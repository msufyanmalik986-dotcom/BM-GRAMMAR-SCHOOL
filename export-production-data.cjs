const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

(async () => {
  const connection = await mysql.createConnection({
    host: "127.0.0.1",
    port: 3306,
    user: "root",
    password: "",
    database: "bm_grammar_school"
  });

  const tables = [
    "branches",
    "events",
    "gallery_images",
    "notices",
    "faculty",
    "faqs",
    "admission_applications",
    "contact_messages",
    "users"
  ];

  const data = {};

  for (const table of tables) {
    console.log(`  Exporting ${table}...`);
    const [rows] = await connection.query(`SELECT * FROM \`${table}\``);
    data[table] = rows;
  }

  await connection.end();

  const dir = path.join(process.cwd(), "data");
  fs.mkdirSync(dir, { recursive: true });

  const output = path.join(dir, "production-data.json");

  fs.writeFileSync(
    output,
    JSON.stringify(data, null, 2),
    "utf8"
  );

  console.log(`EXPORT_OK:${output}`);

  for (const table of tables) {
    console.log(`${table}: ${data[table].length}`);
  }
})().catch(err => {
  console.error(err);
  process.exit(1);
});
