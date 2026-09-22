const fs = require("fs");
const path = require("path");
const initSqlJs = require("sql.js");
const mysql = require("mysql2/promise");

const sqlitePath = path.join(process.cwd(), "data", "bmgs.db");

function qi(name) {
    return "`" + String(name).replace(/`/g, "``") + "`";
}

function qsqlite(name) {
    return '"' + String(name).replace(/"/g, '""') + '"';
}

function mysqlType(type) {
    const t = String(type || "").toUpperCase();

    if (t.includes("INT")) return "BIGINT";
    if (t.includes("CHAR")) return "VARCHAR(255)";
    if (t.includes("CLOB") || t.includes("TEXT")) return "LONGTEXT";
    if (t.includes("BLOB")) return "LONGBLOB";
    if (t.includes("REAL") || t.includes("FLOA") || t.includes("DOUB")) return "DOUBLE";
    if (t.includes("BOOL")) return "TINYINT(1)";
    if (t.includes("DATE") || t.includes("TIME")) return "DATETIME";
    if (t.includes("DECIMAL") || t.includes("NUMERIC")) return "DECIMAL(30,10)";

    return "LONGTEXT";
}

function normalizeValue(value) {
    if (value === undefined) return null;
    if (value instanceof Uint8Array) return Buffer.from(value);
    return value;
}

async function main() {
    console.log("\n====================================================");
    console.log(" READING SQLITE DATABASE");
    console.log("====================================================");

    const fileBuffer = fs.readFileSync(sqlitePath);

    const SQL = await initSqlJs({
        locateFile: () => require.resolve("sql.js/dist/sql-wasm.wasm")
    });

    const sqlite = new SQL.Database(fileBuffer);

    const tableResult = sqlite.exec(`
        SELECT name
        FROM sqlite_master
        WHERE type='table'
          AND name NOT LIKE 'sqlite_%'
        ORDER BY name
    `);

    const tables = tableResult.length
        ? tableResult[0].values.map(row => row[0])
        : [];

    console.log(`SQLite tables found: ${tables.length}`);

    if (!tables.length) {
        throw new Error("No application tables were found in bmgs.db");
    }

    console.log("");
    for (const table of tables) {
        console.log(`  - ${table}`);
    }

    console.log("\n====================================================");
    console.log(" CONNECTING TO MARIADB");
    console.log("====================================================");

    const conn = await mysql.createConnection({
        host: "127.0.0.1",
        user: "root",
        password: "",
        database: "bm_grammar_school",
        charset: "utf8mb4"
    });

    await conn.query("SET FOREIGN_KEY_CHECKS=0");

    console.log("MariaDB connected.");

    console.log("\n====================================================");
    console.log(" MIGRATING TABLES + DATA");
    console.log("====================================================");

    for (const table of tables) {
        console.log(`\n[+] ${table}`);

        const pragma = sqlite.exec(`PRAGMA table_info(${qsqlite(table)})`);

        if (!pragma.length) {
            console.log("    Skipped: no column information.");
            continue;
        }

        const columns = pragma[0].values.map(row => ({
            cid: row[0],
            name: row[1],
            type: row[2],
            notnull: row[3],
            defaultValue: row[4],
            pk: row[5]
        }));

        await conn.query(`DROP TABLE IF EXISTS ${qi(table)}`);

        const definitions = [];

        for (const col of columns) {
            let definition =
                `${qi(col.name)} ${mysqlType(col.type)}`;

            const isSingleIntegerPrimaryKey =
                col.pk === 1 &&
                columns.filter(c => c.pk > 0).length === 1 &&
                String(col.type || "").toUpperCase() === "INTEGER";

            if (isSingleIntegerPrimaryKey) {
                definition += " PRIMARY KEY AUTO_INCREMENT";
            } else if (col.notnull === 1 && col.pk === 0) {
                definition += " NOT NULL";
            }

            definitions.push(definition);
        }

        const primaryColumns = columns
            .filter(c => c.pk > 0)
            .sort((a, b) => a.pk - b.pk);

        const hasAutoPrimary =
            primaryColumns.length === 1 &&
            String(primaryColumns[0].type || "").toUpperCase() === "INTEGER";

        if (primaryColumns.length > 0 && !hasAutoPrimary) {
            definitions.push(
                "PRIMARY KEY (" +
                primaryColumns.map(c => qi(c.name)).join(", ") +
                ")"
            );
        }

        const createSQL = `
            CREATE TABLE ${qi(table)} (
                ${definitions.join(",\n")}
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
        `;

        await conn.query(createSQL);

        const dataResult = sqlite.exec(
            `SELECT * FROM ${qsqlite(table)}`
        );

        const rows = dataResult.length
            ? dataResult[0].values
            : [];

        if (rows.length > 0) {
            const placeholders =
                "(" + columns.map(() => "?").join(",") + ")";

            const insertSQL =
                `INSERT INTO ${qi(table)} (` +
                columns.map(c => qi(c.name)).join(", ") +
                `) VALUES ${placeholders}`;

            for (const row of rows) {
                const values = row.map(normalizeValue);
                await conn.query(insertSQL, values);
            }
        }

        const [countRows] = await conn.query(
            `SELECT COUNT(*) AS total FROM ${qi(table)}`
        );

        console.log(
            `    Columns: ${columns.length} | Rows: ${countRows[0].total}`
        );
    }

    await conn.query("SET FOREIGN_KEY_CHECKS=1");

    console.log("\n====================================================");
    console.log(" VERIFYING MARIADB");
    console.log("====================================================");

    const [dbTables] = await conn.query(`
        SELECT TABLE_NAME
        FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = 'bm_grammar_school'
        ORDER BY TABLE_NAME
    `);

    console.log(`MariaDB tables: ${dbTables.length}`);

    for (const item of dbTables) {
        const table = item.TABLE_NAME;

        const [countRows] = await conn.query(
            `SELECT COUNT(*) AS total FROM ${qi(table)}`
        );

        console.log(`  ${table}: ${countRows[0].total} rows`);
    }

    await conn.end();
    sqlite.close();

    console.log("\n====================================================");
    console.log("              MIGRATION COMPLETE");
    console.log("====================================================");
    console.log("");
    console.log("MariaDB database:");
    console.log("  bm_grammar_school");
    console.log("");
    console.log("Original SQLite:");
    console.log("  data\\bmgs.db");
    console.log("");
    console.log("SQLite backup:");
    console.log("  data\\bmgs_before_mysql_backup.db");
    console.log("");
    console.log("SQLite file has NOT been deleted.");
    console.log("All migrated data remains in the original SQLite file too.");
    console.log("");
}

main().catch(async error => {
    console.error("\nMIGRATION FAILED:");
    console.error(error.message || error);
    process.exit(1);
});
