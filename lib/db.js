const mysql = require("mysql2");

const isVercel = !!process.env.VERCEL;
const host = process.env.DB_HOST || process.env.TIDB_HOST;
const port = Number(process.env.DB_PORT || process.env.TIDB_PORT || 3306);
const user = process.env.DB_USER || process.env.TIDB_USER;
const password = process.env.DB_PASSWORD || process.env.TIDB_PASSWORD || "";
const database = process.env.DB_NAME || process.env.TIDB_DATABASE;

if (isVercel && (!host || !user || !database)) {
  throw new Error(
    "Production database environment variables are missing. Connect your MySQL-compatible database to Vercel first."
  );
}

/*
 * Local:
 *   Uses the existing XAMPP MariaDB synchronously.
 *
 * Vercel:
 *   Production database must be supplied through environment variables.
 *
 * IMPORTANT:
 * The existing application uses synchronous DB calls. Therefore this adapter
 * intentionally keeps the local implementation unchanged. Production pages
 * must not execute the Windows mysql.exe bridge.
 */

if (isVercel) {
  throw new Error(
    "The legacy synchronous Windows MySQL adapter cannot run on Vercel. " +
    "Production DB calls must be migrated to an async mysql2 implementation."
  );
}

const { spawnSync } = require("child_process");

const MYSQL =
  process.env.MYSQL_BIN ||
  "C:\\xampp\\mysql\\bin\\mysql.exe";

function argsBase() {
  return [
    "--protocol=tcp",
    "-h", host || "127.0.0.1",
    "-P", String(port),
    "-u", user || "root",
    ...(password ? [`-p${password}`] : []),
    "-D", database || "bm_grammar_school",
    "--batch",
    "--raw"
  ];
}

function execute(sql) {
  const result = spawnSync(
    MYSQL,
    [...argsBase(), "-e", sql],
    {
      encoding: "utf8",
      windowsHide: true,
      maxBuffer: 20 * 1024 * 1024
    }
  );

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(result.stderr || "MySQL query failed");
  }

  return result.stdout || "";
}

function parseValue(v) {
  if (v === "\\N") return null;
  return v;
}

function parseRows(output) {
  const lines = output.trimEnd().split(/\r?\n/);
  if (!output.trim()) return [];

  const headers = lines.shift().split("\t");

  return lines.map(line => {
    const values = line.split("\t");
    const row = {};

    headers.forEach((h, i) => {
      row[h] = parseValue(values[i] ?? "");
    });

    return row;
  });
}

function quote(value) {
  if (value === null || value === undefined) return "NULL";

  if (typeof value === "number") {
    return Number.isFinite(value) ? String(value) : "NULL";
  }

  if (typeof value === "boolean") {
    return value ? "1" : "0";
  }

  return "'" +
    String(value)
      .replace(/\\/g, "\\\\")
      .replace(/'/g, "''")
      .replace(/\r/g, "\\r")
      .replace(/\n/g, "\\n") +
    "'";
}

function prepare(sql) {
  return {
    get(...params) {
      let i = 0;
      const query = sql.replace(/\?/g, () => quote(params[i++]));
      return parseRows(execute(query))[0];
    },

    all(...params) {
      let i = 0;
      const query = sql.replace(/\?/g, () => quote(params[i++]));
      return parseRows(execute(query));
    },

    run(...params) {
      let i = 0;
      const query = sql.replace(/\?/g, () => quote(params[i++]));
      execute(query);
      return { changes: 0 };
    }
  };
}

const db = {
  prepare,
  exec(sql) {
    execute(sql);
  }
};

const q = {
  branches: () =>
    db.prepare(
      "SELECT * FROM branches WHERE active = 1 ORDER BY id"
    ).all(),

  branch: slug =>
    db.prepare(
      "SELECT * FROM branches WHERE slug = ?"
    ).get(slug),

  branchById: id =>
    db.prepare(
      "SELECT * FROM branches WHERE id = ?"
    ).get(id),

  events: () =>
    db.prepare(
      "SELECT * FROM events WHERE published = 1 ORDER BY id"
    ).all(),

  event: slug =>
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

  notice: slug =>
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
    ).all()
};

module.exports = { db, q };
