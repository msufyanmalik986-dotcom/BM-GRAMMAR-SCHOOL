const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const mysqlExe = "C:\\xampp\\mysql\\bin\\mysql.exe";
const snapshotPath = path.join(process.cwd(), "data", "production-data.json");

const isVercel = !!process.env.VERCEL;

let productionData = null;

if (isVercel) {
  try {
    productionData = JSON.parse(
      fs.readFileSync(snapshotPath, "utf8")
    );
  } catch (error) {
    console.error("Failed to load production database snapshot:", error);
    productionData = {};
  }
}

function localMysql(sql, params = []) {
  let finalSql = sql;

  for (const param of params) {
    let value;

    if (param === null || param === undefined) {
      value = "NULL";
    } else if (typeof param === "number") {
      value = String(param);
    } else {
      value = "'" + String(param)
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "''") + "'";
    }

    finalSql = finalSql.replace("?", value);
  }

  const result = spawnSync(
    mysqlExe,
    [
      "--protocol=tcp",
      "-h", process.env.DB_HOST || "127.0.0.1",
      "-P", process.env.DB_PORT || "3306",
      "-u", process.env.DB_USER || "root",
      ...(process.env.DB_PASSWORD
        ? ["-p" + process.env.DB_PASSWORD]
        : []),
      "-D", process.env.DB_NAME || "bm_grammar_school",
      "--batch",
      "--raw",
      "-e",
      finalSql
    ],
    {
      encoding: "utf8",
      windowsHide: true
    }
  );

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error(result.stderr || "MariaDB query failed");
  }

  const output = result.stdout || "";
  const lines = output.trim()
    ? output.trim().split(/\r?\n/)
    : [];

  if (lines.length === 0) {
    return [];
  }

  const headers = lines[0].split("\t");

  return lines.slice(1).map(line => {
    const values = line.split("\t");
    const row = {};

    headers.forEach((header, index) => {
      row[header] =
        values[index] === undefined ? null : values[index];
    });

    return row;
  });
}

function snapshotRows(table) {
  if (!productionData) return [];
  return Array.isArray(productionData[table])
    ? productionData[table]
    : [];
}

function getById(table, id) {
  return snapshotRows(table).find(
    row => String(row.id) === String(id)
  );
}

function getBySlug(table, slug) {
  return snapshotRows(table).find(
    row => String(row.slug) === String(slug)
  );
}

const q = {
  branches: () => {
    if (isVercel) {
      return snapshotRows("branches")
        .filter(row => Number(row.active) === 1)
        .sort((a, b) => Number(a.id) - Number(b.id));
    }

    return localMysql(
      "SELECT * FROM branches WHERE active = 1 ORDER BY id"
    );
  },

  branch: (slug) => {
    if (isVercel) {
      return snapshotRows("branches").find(
        row =>
          String(row.slug) === String(slug) &&
          Number(row.active) === 1
      );
    }

    const rows = localMysql(
      "SELECT * FROM branches WHERE slug = ? AND active = 1 LIMIT 1",
      [slug]
    );

    return rows[0];
  },

  branchById: (id) => {
    if (isVercel) {
      return getById("branches", id);
    }

    const rows = localMysql(
      "SELECT * FROM branches WHERE id = ? LIMIT 1",
      [id]
    );

    return rows[0];
  },

  events: () => {
    if (isVercel) {
      return snapshotRows("events")
        .filter(row => Number(row.published) === 1)
        .sort((a, b) => Number(a.id) - Number(b.id));
    }

    return localMysql(
      "SELECT * FROM events WHERE published = 1 ORDER BY id"
    );
  },

  event: (slug) => {
    if (isVercel) {
      return snapshotRows("events").find(
        row =>
          String(row.slug) === String(slug) &&
          Number(row.published) === 1
      );
    }

    const rows = localMysql(
      "SELECT * FROM events WHERE slug = ? AND published = 1 LIMIT 1",
      [slug]
    );

    return rows[0];
  },

  gallery: () => {
    if (isVercel) {
      return snapshotRows("gallery_images")
        .filter(row => Number(row.published) === 1)
        .sort((a, b) => Number(a.id) - Number(b.id));
    }

    return localMysql(
      "SELECT * FROM gallery_images WHERE published = 1 ORDER BY id"
    );
  },

  notices: () => {
    if (isVercel) {
      return snapshotRows("notices")
        .filter(row => Number(row.published) === 1)
        .sort((a, b) => {
          const aDate = new Date(a.published_at || 0).getTime();
          const bDate = new Date(b.published_at || 0).getTime();

          if (bDate !== aDate) {
            return bDate - aDate;
          }

          return Number(b.id) - Number(a.id);
        });
    }

    return localMysql(
      "SELECT * FROM notices WHERE published = 1 ORDER BY published_at DESC, id DESC"
    );
  },

  notice: (slug) => {
    if (isVercel) {
      return snapshotRows("notices").find(
        row =>
          String(row.slug) === String(slug) &&
          Number(row.published) === 1
      );
    }

    const rows = localMysql(
      "SELECT * FROM notices WHERE slug = ? AND published = 1 LIMIT 1",
      [slug]
    );

    return rows[0];
  },

  faculty: () => {
    if (isVercel) {
      return snapshotRows("faculty")
        .filter(row => Number(row.published) === 1)
        .sort((a, b) => Number(a.id) - Number(b.id));
    }

    return localMysql(
      "SELECT * FROM faculty WHERE published = 1 ORDER BY id"
    );
  },

  faqs: () => {
    if (isVercel) {
      return snapshotRows("faqs")
        .filter(row => Number(row.published) === 1)
        .sort((a, b) => {
          const aSort = Number(a.sort_order || 0);
          const bSort = Number(b.sort_order || 0);

          if (aSort !== bSort) {
            return aSort - bSort;
          }

          return Number(a.id) - Number(b.id);
        });
    }

    return localMysql(
      "SELECT * FROM faqs WHERE published = 1 ORDER BY sort_order, id"
    );
  }
};

/*
 * Compatibility wrapper.
 * Local development continues using synchronous XAMPP MariaDB.
 * Vercel build/runtime uses the exported snapshot and never
 * attempts to execute C:\\xampp\\mysql\\bin\\mysql.exe.
 */

const db = {
  prepare(sql) {
    return {
      all: (...params) => {
        if (isVercel) return [];
        return localMysql(sql, params);
      },

      get: (...params) => {
        if (isVercel) return undefined;

        const rows = localMysql(sql, params);
        return rows[0];
      },

      run: (...params) => {
        if (isVercel) {
          return {
            changes: 0,
            lastInsertRowid: 0
          };
        }

        localMysql(sql, params);

        return {
          changes: 1,
          lastInsertRowid: 0
        };
      }
    };
  },

  exec(sql) {
    if (isVercel) return;
    localMysql(sql);
  }
};

module.exports = {
  db,
  q
};
