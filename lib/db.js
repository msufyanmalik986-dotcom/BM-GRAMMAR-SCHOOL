const cp = require("child_process");

const MYSQL =
  process.env.MYSQL_BIN ||
  "C:\\xampp\\mysql\\bin\\mysql.exe";

const HOST = process.env.DB_HOST || "127.0.0.1";
const PORT = process.env.DB_PORT || "3306";
const USER = process.env.DB_USER || "root";
const PASSWORD = process.env.DB_PASSWORD || "";
const DATABASE = process.env.DB_NAME || "bm_grammar_school";

function mysqlArgs(extra = []) {
  const args = [
    "--protocol=tcp",
    "-h", HOST,
    "-P", PORT,
    "-u", USER,
    "-D", DATABASE,
    "--batch",
    "--raw",
  ];

  if (PASSWORD) {
    args.push(`-p${PASSWORD}`);
  }

  return [...args, ...extra];
}

function execute(sql) {
  const result = cp.spawnSync(
    MYSQL,
    mysqlArgs(["-e", sql]),
    {
      encoding: "utf8",
      windowsHide: true,
      maxBuffer: 20 * 1024 * 1024,
    }
  );

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(
      String(result.stderr || result.stdout || "MariaDB query failed").trim()
    );
  }

  return String(result.stdout || "");
}

function escapeSqlValue(value) {
  if (value === null || value === undefined) {
    return "NULL";
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) return "NULL";
    return String(value);
  }

  if (typeof value === "boolean") {
    return value ? "1" : "0";
  }

  if (value instanceof Date) {
    value = value.toISOString().slice(0, 19).replace("T", " ");
  }

  if (typeof value === "object") {
    value = JSON.stringify(value);
  }

  return "'" +
    String(value)
      .replace(/\\/g, "\\\\")
      .replace(/'/g, "''")
      .replace(/\0/g, "\\0")
      .replace(/\n/g, "\\n")
      .replace(/\r/g, "\\r") +
    "'";
}

function applyParams(sql, params) {
  let result = String(sql);

  // Support better-sqlite3 style named parameters:
  // @user_id, @student_name, @campus_id, etc.
  if (
    params.length === 1 &&
    params[0] &&
    typeof params[0] === "object" &&
    !Array.isArray(params[0])
  ) {
    const obj = params[0];

    for (const [key, value] of Object.entries(obj)) {
      const safeKey = String(key).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      result = result.replace(
        new RegExp("@" + safeKey + "\\b", "g"),
        escapeSqlValue(value)
      );
    }

    return result;
  }

  // Support ? positional parameters.
  let index = 0;

  result = result.replace(/\?/g, () => {
    if (index >= params.length) {
      throw new Error("Not enough SQL parameters.");
    }

    return escapeSqlValue(params[index++]);
  });

  return result;
}

function decode(value) {
  if (value === undefined || value === null) {
    return value;
  }

  return String(value)
    .replace(/\\t/g, "\t")
    .replace(/\\n/g, "\n")
    .replace(/\\r/g, "\r")
    .replace(/\\\\/g, "\\");
}

function selectRows(sql) {
  const output = execute(sql).trim();

  if (!output) {
    return [];
  }

  const lines = output.split(/\r?\n/);

  if (lines.length === 0) {
    return [];
  }

  const headers = lines[0].split("\t").map(decode);

  return lines.slice(1).map((line) => {
    const values = line.split("\t").map(decode);
    const row = {};

    headers.forEach((header, i) => {
      row[header] = values[i] === undefined ? null : values[i];
    });

    return row;
  });
}

function selectRowsNoHeader(sql) {
  const output = execute(sql).trim();

  if (!output) {
    return [];
  }

  return output
    .split(/\r?\n/)
    .map((line) => line.split("\t").map(decode));
}

function prepare(sql) {
  return {
    all: (...params) => {
      const finalSql = applyParams(sql, params);
      return selectRows(finalSql);
    },

    get: (...params) => {
      const rows = prepare(sql).all(...params);
      return rows.length ? rows[0] : undefined;
    },

    run: (...params) => {
      const finalSql = applyParams(sql, params);

      const output = execute(
        finalSql +
        "; SELECT ROW_COUNT() AS changes, LAST_INSERT_ID() AS lastInsertRowid;"
      ).trim();

      let changes = 0;
      let lastInsertRowid = 0;

      const lines = output.split(/\r?\n/);

      for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i].trim();

        if (!line || line.startsWith("changes")) {
          continue;
        }

        const parts = line.split("\t");

        if (parts.length >= 2) {
          changes = Number(parts[0]) || 0;
          lastInsertRowid = Number(parts[1]) || 0;
          break;
        }
      }

      return {
        changes,
        lastInsertRowid
      };
    }
  };
}

const db = {
  prepare,

  exec(sql) {
    return execute(sql);
  },

  pragma() {
    return undefined;
  }
};

const q = {
  branches: () =>
    db.prepare(
      "SELECT * FROM branches WHERE active = 1 ORDER BY id"
    ).all(),

  branch: (slug) =>
    db.prepare(
      "SELECT * FROM branches WHERE slug = ?"
    ).get(slug),

  branchById: (id) =>
    db.prepare(
      "SELECT * FROM branches WHERE id = ?"
    ).get(id),

  events: () =>
    db.prepare(
      "SELECT * FROM events WHERE published = 1 ORDER BY id"
    ).all(),

  event: (slug) =>
    db.prepare(
      "SELECT * FROM events WHERE slug = ? AND published = 1"
    ).get(slug),

  gallery: () =>
    db.prepare(
      "SELECT * FROM gallery_images WHERE published = 1 ORDER BY id"
    ).all(),

  notices: () =>
    db.prepare(
      "SELECT * FROM notices WHERE published = 1 ORDER BY published_at DESC, id DESC"
    ).all(),

  notice: (slug) =>
    db.prepare(
      "SELECT * FROM notices WHERE slug = ? AND published = 1"
    ).get(slug),

  faculty: () =>
    db.prepare(
      "SELECT * FROM faculty WHERE published = 1 ORDER BY id"
    ).all(),

  faqs: () =>
    db.prepare(
      "SELECT * FROM faqs WHERE published = 1 ORDER BY sort_order, id"
    ).all(),
};

module.exports = {
  db,
  q
};

