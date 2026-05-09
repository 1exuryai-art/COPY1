/**
 * One-time import: data/site-content.json → PostgreSQL site_content.content_json
 * Usage: DATABASE_URL=... PROJECT_KEY=default node scripts/import-site-content.mjs
 */
import "dotenv/config";
import { readFile } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { getPool, runMigrations, closePool } from "../postgresClient.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const contentFile = path.join(root, "data", "site-content.json");
const projectKey = process.env.PROJECT_KEY?.trim() || "default";

if (!process.env.DATABASE_URL?.trim()) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const raw = await readFile(contentFile, "utf8");
const json = JSON.parse(raw);

await runMigrations();
const pool = getPool();

await pool.query(
  `INSERT INTO site_content (project_key, content_json, updated_at)
   VALUES ($1, $2::jsonb, NOW())
   ON CONFLICT (project_key) DO UPDATE SET
     content_json = EXCLUDED.content_json,
     updated_at = NOW()`,
  [projectKey, JSON.stringify(json)]
);

console.log("Imported site content for project_key=%s from %s", projectKey, contentFile);
await closePool();
