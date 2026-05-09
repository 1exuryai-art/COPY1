import path from "path";
import { mkdir, readFile, writeFile } from "fs/promises";

/**
 * @param {{ contentFile: string, emptyTemplate: Record<string, unknown> }} opts
 */
export async function createJsonContentStore({ contentFile, emptyTemplate }) {
  const dataDir = path.dirname(contentFile);

  async function ensureDirs() {
    await mkdir(dataDir, { recursive: true });
  }

  return {
    mode: "json",
    async read() {
      await ensureDirs();
      try {
        const raw = await readFile(contentFile, "utf8");
        const parsed = JSON.parse(raw);
        return { ...emptyTemplate, ...parsed };
      } catch (err) {
        if (err && err.code === "ENOENT") {
          await writeFile(contentFile, `${JSON.stringify(emptyTemplate, null, 2)}\n`, "utf8");
          return { ...emptyTemplate };
        }
        throw err;
      }
    },
    async write(data) {
      await ensureDirs();
      await writeFile(contentFile, `${JSON.stringify(data, null, 2)}\n`, "utf8");
    },
    async recordMedia() {
      /* JSON mode: optional metadata only in DB mode */
    }
  };
}
