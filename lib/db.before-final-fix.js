/**
 * BM Grammar School
 *
 * Synchronous MariaDB compatibility layer.
 *
 * The existing application was written for better-sqlite3,
 * therefore the public API intentionally remains synchronous:
 *
 *   db.prepare(sql).get(...)
 *   db.prepare(sql).all(...)
 *   db.prepare(sql).run(...)
 *
 * This version uses the XAMPP MariaDB mysql.exe client
 * synchronously so existing pages do NOT need to be rewritten.
 */

const path = require("path");
const fs = require("fs");
const cp = require("child_process");

const MYSQL =
  process.env.MYSQL_BIN ||
  "C:\\xampp\\mysql\\bin\\mysql.exe";

const DB_HOST =
  process.env.DB_HOST || "127.0.0.1";

const DB_PORT =
  process.env.DB_PORT || "3306";

const DB_USER =
  process.env.DB_USER || "root";

const DB_PASSWORD =
  process.env.DB_PASSWORD || "";

const DB_NAME =
  process.env.DB_NAME || "bm_grammar_school";

/* --------------------------------------------------
   Validate mysql.exe
-------------------------------------------------- */

if (!fs.existsSync(MYSQL)) {
  throw new Error(
    "XAMPP MariaDB client not found: " + MYSQL
  );
}

/* --------------------------------------------------
   SQL value escaping
-------------------------------------------------- */

function sqlValue(value) {

  if (value === null || value === undefined) {
    return "NULL";
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      return "NULL";
    }

    return String(value);
  }

  if (typeof value === "boolean") {
    return value ? "1" : "0";
  }

  if (Buffer.isBuffer(value)) {
    return "X'" + value.toString("hex") + "'";
  }

  return "'" +
    String(value)
      .replace(/\\/g, "\\\\")
      .replace(/'/g, "''")
      .replace(/\r/g, "\\r")
      .replace(/\n/g, "\\n") +
    "'";
}

/* --------------------------------------------------
   Replace ? placeholders
-------------------------------------------------- */

function buildSQL(sql, params) {

  let index = 0;

  return String(sql).replace(/\?/g, () => {

    if (index >= params.length) {
      throw new Error(
        "SQL parameter count mismatch."
      );
    }

    return sqlValue(params[index++]);
  });
}

/* --------------------------------------------------
   Execute mysql.exe synchronously
-------------------------------------------------- */

function execute(sql) {

  const args = [
    "--host=" + DB_HOST,
    "--port=" + DB_PORT,
    "--user=" + DB_USER,
    "--database=" + DB_NAME,
    "--batch",
    "--raw",
    "--skip-column-names",
    "--default-character-set=utf8mb4",
    "-e",
    sql
  ];

  const result = cp.spawnSync(
    MYSQL,
    args,
    {
      encoding: "utf8",
      windowsHide: true,
      maxBuffer: 50 * 1024 * 1024
    }
  );

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(
      String(result.stderr || result.stdout || "MariaDB query failed.")
        .trim()
    );
  }

  return String(result.stdout || "");
}

/* --------------------------------------------------
   Decode mysql batch output
-------------------------------------------------- */

function decodeCell(value) {

  return String(value)
    .replace(/\\0/g, "\0")
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\t/g, "\t")
    .replace(/\\\\/g, "\\");
}

/* --------------------------------------------------
   Get column names
-------------------------------------------------- */

function getColumns(sql) {

  const wrapped =
    "SELECT * FROM (" +
    sql +
    ") AS __bmgs_result LIMIT 0";

  const args = [
    "--host=" + DB_HOST,
    "--port=" + DB_PORT,
    "--user=" + DB_USER,
    "--database=" + DB_NAME,
    "--batch",
    "--default-character-set=utf8mb4",
    "-e",
    wrapped
  ];

  const result = cp.spawnSync(
    MYSQL,
    args,
    {
      encoding: "utf8",
      windowsHide: true,
      maxBuffer: 10 * 1024 * 1024
    }
  );

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(
      String(result.stderr || "").trim()
    );
  }

  const firstLine =
    String(result.stdout || "")
      .split(/\r?\n/)[0];

  if (!firstLine) {
    return [];
  }

  return firstLine
    .split("\t")
    .map(decodeCell);
}

/* --------------------------------------------------
   SELECT parser
-------------------------------------------------- */

function selectRows(sql) {

  const output = execute(sql);

  if (!output.trim()) {
    return [];
  }

  const lines =
    output
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .split("\n")
      .filter((x) => x.length > 0);

  if (!lines.length) {
    return [];
  }

  /*
   * Run the query again with column headers.
   * This keeps support for arbitrary SELECT statements.
   */
  const args = [
    "--host=" + DB_HOST,
    "--port=" + DB_PORT,
    "--user=" + DB_USER,
    "--database=" + DB_NAME,
    "--batch",
    "--default-character-set=utf8mb4",
    "-e",
    sql
  ];

  const result = cp.spawnSync(
    MYSQL,
    args,
    {
      encoding: "utf8",
      windowsHide: true,
      maxBuffer: 50 * 1024 * 1024
    }
  );

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(
      String(result.stderr || "").trim()
    );
  }

  const allLines =
    String(result.stdout || "")
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .split("\n")
      .filter((x) => x.length > 0);

  if (!allLines.length) {
    return [];
  }

  const columns =
    allLines[0]
      .split("\t")
      .map(decodeCell);

  const rows = [];

  for (let i = 1; i < allLines.length; i++) {

    const values =
      allLines[i]
        .split("\t")
        .map(decodeCell);

    const row = {};

    for (let j = 0; j < columns.length; j++) {

      let value =
        values[j] === undefined
          ? null
          : values[j];

      /*
       * Convert numeric-looking database values back
       * to numbers where appropriate.
       */
      if (
        value !== null &&
        value !== "" &&
        /^-?\d+(\.\d+)?$/.test(value)
      ) {
        const numeric = Number(value);

        if (Number.isFinite(numeric)) {
          value = numeric;
        }
      }

      row[columns[j]] = value;
    }

    rows.push(row);
  }

  return rows;
}

/* --------------------------------------------------
   better-sqlite3 compatible prepare()
-------------------------------------------------- */

function prepare(sql) {

  return {

    get: (...params) => {

      const finalSQL =
        buildSQL(sql, params);

      const rows =
        selectRows(finalSQL);

      return rows.length
        ? rows[0]
        : undefined;
    },

    all: (...params) => {

      const finalSQL =
        buildSQL(sql, params);

      return selectRows(finalSQL);
    },

    run: (...params) => {

      const finalSQL =
        buildSQL(sql, params);

      /*
       * Run INSERT/UPDATE/DELETE and obtain affected rows.
       */
      const output =
        execute(
          finalSQL +
          "; SELECT ROW_COUNT(); SELECT LAST_INSERT_ID();"
        );

      const lines =
        output
          .replace(/\r\n/g, "\n")
          .replace(/\r/g, "\n")
          .split("\n")
          .filter((x) => x.length > 0);

      let changes = 0;
      let lastInsertRowid = 0;

      if (lines.length >= 1) {
        const n = Number(lines[lines.length - 2]);

        if (Number.isFinite(n)) {
          changes = n;
        }
      }

      if (lines.length >= 1) {
        const n = Number(lines[lines.length - 1]);

        if (Number.isFinite(n)) {
          lastInsertRowid = n;
        }
      }

      return {
        changes,
        lastInsertRowid
      };
    }
  };
}

/* --------------------------------------------------
   Compatibility database object
-------------------------------------------------- */

const db = {

  prepare,

  exec: (sql) => {
    execute(sql);
  },

  pragma: () => {
    /*
     * SQLite PRAGMA is intentionally ignored.
     */
  }
};

/* --------------------------------------------------
   Existing BM Grammar School query API
-------------------------------------------------- */

const q = {

  branches: () =>
    prepare(
      "SELECT * FROM branches WHERE active = 1 ORDER BY id"
    ).all(),

  branch: (slug) =>
    prepare(
      "SELECT * FROM branches WHERE slug = ?"
    ).get(slug),

  branchById: (id) =>
    prepare(
      "SELECT * FROM branches WHERE id = ?"
    ).get(id),

  events: () =>
    prepare(
      "SELECT * FROM events WHERE published = 1 ORDER BY id"
    ).all(),

  event: (slug) =>
    prepare(
      "SELECT * FROM events WHERE slug = ? AND published = 1"
    ).get(slug),

  gallery: () =>
    prepare(
      "SELECT * FROM gallery_images WHERE published = 1 ORDER BY id"
    ).all(),

  notices: () =>
    prepare(
      "SELECT * FROM notices WHERE published = 1 ORDER BY published_at DESC, id DESC"
    ).all(),

  notice: (slug) =>
    prepare(
      "SELECT * FROM notices WHERE slug = ? AND published = 1"
    ).get(slug),

  faculty: () =>
    prepare(
      "SELECT * FROM faculty WHERE published = 1 ORDER BY id"
    ).all(),

  faqs: () =>
    prepare(
      "SELECT * FROM faqs WHERE published = 1 ORDER BY sort_order, id"
    ).all()
};

/* --------------------------------------------------
   MariaDB startup test
-------------------------------------------------- */

try {

  const test =
    selectRows(
      "SELECT COUNT(*) AS total FROM users"
    );

  console.log(
    "[BMGS DB] MariaDB connected successfully."
  );

  console.log(
    "[BMGS DB] Users:",
    test.length ? test[0].total : 0
  );

} catch (error) {

  console.error(
    "[BMGS DB] MariaDB connection failed:"
  );

  console.error(error.message);

  throw error;
}

module.exports = {
  db,
  q
};
