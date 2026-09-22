/**
 * BM Grammar School
 * MariaDB database layer
 *
 * Database:
 *   bm_grammar_school
 *
 * Server:
 *   127.0.0.1:3306
 *
 * NOTE:
 * This file intentionally does NOT use better-sqlite3,
 * sync-mysql, or sync-rpc.
 */

const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "bm_grammar_school",
  charset: "utf8mb4",

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

/* --------------------------------------------------
   Database connection test
-------------------------------------------------- */

let connectionReady = false;

async function testConnection() {
  if (connectionReady) return true;

  const connection = await pool.getConnection();

  try {
    await connection.query("SELECT 1");
    connectionReady = true;
    return true;
  } finally {
    connection.release();
  }
}

/* --------------------------------------------------
   Compatibility database object
-------------------------------------------------- */

const db = {
  async query(sql, params = []) {
    const [rows] = await pool.execute(sql, params);
    return rows;
  },

  async get(sql, params = []) {
    const [rows] = await pool.execute(sql, params);
    return rows && rows.length ? rows[0] : undefined;
  },

  async all(sql, params = []) {
    const [rows] = await pool.execute(sql, params);
    return rows || [];
  },

  async run(sql, params = []) {
    const [result] = await pool.execute(sql, params);

    return {
      changes: result.affectedRows || 0,
      lastInsertRowid: result.insertId
    };
  },

  async exec(sql) {
    await pool.query(sql);
  },

  async prepare(sql) {
    return {
      get: async (...params) => {
        return db.get(sql, params);
      },

      all: async (...params) => {
        return db.all(sql, params);
      },

      run: async (...params) => {
        return db.run(sql, params);
      }
    };
  },

  pragma() {
    /*
     * SQLite-only operation.
     * MariaDB does not use SQLite PRAGMA.
     */
  }
};

/* --------------------------------------------------
   Query helpers
-------------------------------------------------- */

const q = {
  branches: async () =>
    db.all(
      "SELECT * FROM branches WHERE active = 1 ORDER BY id"
    ),

  branch: async (slug) =>
    db.get(
      "SELECT * FROM branches WHERE slug = ?",
      [slug]
    ),

  branchById: async (id) =>
    db.get(
      "SELECT * FROM branches WHERE id = ?",
      [id]
    ),

  events: async () =>
    db.all(
      "SELECT * FROM events WHERE published = 1 ORDER BY id"
    ),

  event: async (slug) =>
    db.get(
      "SELECT * FROM events WHERE slug = ? AND published = 1",
      [slug]
    ),

  gallery: async () =>
    db.all(
      "SELECT * FROM gallery_images WHERE published = 1 ORDER BY id"
    ),

  notices: async () =>
    db.all(
      "SELECT * FROM notices WHERE published = 1 ORDER BY published_at DESC, id DESC"
    ),

  notice: async (slug) =>
    db.get(
      "SELECT * FROM notices WHERE slug = ? AND published = 1",
      [slug]
    ),

  faculty: async () =>
    db.all(
      "SELECT * FROM faculty WHERE published = 1 ORDER BY id"
    ),

  faqs: async () =>
    db.all(
      "SELECT * FROM faqs WHERE published = 1 ORDER BY sort_order, id"
    )
};

/* --------------------------------------------------
   Startup verification
-------------------------------------------------- */

testConnection()
  .then(() => {
    console.log(
      "[BMGS DB] MariaDB connected: " +
      (process.env.DB_NAME || "bm_grammar_school")
    );
  })
  .catch((error) => {
    console.error("[BMGS DB] MariaDB connection failed:");
    console.error(error.message);
  });

module.exports = {
  db,
  q,
  pool,
  testConnection
};
