import { getPool, runMigrations } from "./postgresClient.js";

/**
 * @param {{ emptyTemplate: Record<string, unknown> }} opts
 */
export async function createPostgresContentStore({ emptyTemplate }) {
  await runMigrations();
  const pool = getPool();
  const projectKey = process.env.PROJECT_KEY?.trim() || "default";

  return {
    mode: "postgres",
    projectKey,
    async read() {
      const r = await pool.query("SELECT content_json FROM site_content WHERE project_key = $1", [projectKey]);
      const row = r.rows[0];
      if (!row?.content_json) {
        return { ...emptyTemplate };
      }
      const raw = row.content_json;
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      return { ...emptyTemplate, ...parsed };
    },
    async write(data) {
      await pool.query(
        `INSERT INTO site_content (project_key, content_json, updated_at)
         VALUES ($1, $2::jsonb, NOW())
         ON CONFLICT (project_key) DO UPDATE SET
           content_json = EXCLUDED.content_json,
           updated_at = NOW()`,
        [projectKey, JSON.stringify(data)]
      );
    },
    async recordMedia(meta) {
      await pool.query(
        `INSERT INTO media_files (project_key, url, filename, mime_type, size, created_at)
         VALUES ($1, $2, $3, $4, $5, NOW())`,
        [projectKey, meta.url, meta.filename, meta.mimeType ?? null, meta.size ?? null]
      );
    }
  };
}
