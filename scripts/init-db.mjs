import "dotenv/config";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Pool } from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, "..");
const schemaPath = path.join(projectRoot, "server", "schema.sql");
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL is required. Copy .env.example to .env and set a PostgreSQL connection string.");
  process.exit(1);
}

const pool = new Pool({ connectionString: databaseUrl });

try {
  const schema = await readFile(schemaPath, "utf8");
  await pool.query(schema);
  const result = await pool.query("select table_name from information_schema.tables where table_schema = 'public' order by table_name");
  console.log("Database initialized:");
  for (const row of result.rows) console.log(`- ${row.table_name}`);
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  await pool.end();
}
