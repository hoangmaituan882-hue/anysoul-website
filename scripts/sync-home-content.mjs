import "dotenv/config";
import { Pool } from "pg";
import { tsImport } from "tsx/esm/api";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL is required. Run this on the server after creating .env.");
  process.exit(1);
}

const { contentSeedEntries } = await tsImport("../src/content/seeds/index.ts", import.meta.url);

const entries = contentSeedEntries.map((entry) => ({
  ...entry,
  status: entry.status === "draft" ? "draft" : "published"
}));

const pool = new Pool({ connectionString: databaseUrl });
const client = await pool.connect();

try {
  await client.query("begin");

  for (const entry of entries) {
    await client.query(
      `insert into content_entries (key, type, status, draft, published, version, updated_at, published_at)
       values ($1, $2, $3, $4, $4, 1, now(), now())
       on conflict (key) do update set
         type = excluded.type,
         status = excluded.status,
         draft = excluded.draft,
         published = excluded.published,
         version = content_entries.version + 1,
         updated_at = now(),
         published_at = now()`,
      [entry.key, entry.type, entry.status, JSON.stringify(entry.content)]
    );
  }

  const meta = await client.query(
    `insert into content_meta (id, site_version, updated_at)
     values ('main', 2, now())
     on conflict (id) do update set site_version = content_meta.site_version + 1, updated_at = now()
     returning site_version`
  );
  const siteVersion = Number(meta.rows[0]?.site_version || 1);

  await client.query(
    `insert into content_events (id, type, keys, version, message, actor_id, actor_name, actor_role, created_at)
     values ($1, 'content.published', $2, $3, $4, 'deploy-script', 'Deploy Script', 'admin', now())`,
    [
      `event-site-content-seed-${Date.now()}`,
      entries.map((entry) => entry.key),
      siteVersion,
      "Synchronized site seed content"
    ]
  );

  await client.query("commit");
  console.log("Site content synchronized:");
  for (const entry of entries) console.log(`- ${entry.key} (${entry.status})`);
} catch (error) {
  await client.query("rollback");
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  client.release();
  await pool.end();
}
