import { createJsonContentStore } from "./jsonContentStore.js";
import { createPostgresContentStore } from "./postgresContentStore.js";

/** @type {Awaited<ReturnType<typeof createJsonContentStore>> | Awaited<ReturnType<typeof createPostgresContentStore>> | null} */
let singleton = null;

/**
 * @param {{ contentFile: string, emptyTemplate: Record<string, unknown> }} opts
 */
export async function initContentStore(opts) {
  const mode = (process.env.CONTENT_STORE || "json").toLowerCase();
  const hasDb = Boolean(process.env.DATABASE_URL?.trim());

  if (mode === "postgres" && hasDb) {
    singleton = await createPostgresContentStore({ emptyTemplate: opts.emptyTemplate });
    console.log("[content] store=postgres project_key=%s", singleton.projectKey);
  } else {
    if (mode === "postgres" && !hasDb) {
      console.warn("[content] CONTENT_STORE=postgres but DATABASE_URL missing — using JSON file store");
    }
    singleton = await createJsonContentStore({
      contentFile: opts.contentFile,
      emptyTemplate: opts.emptyTemplate
    });
    console.log("[content] store=json file=%s", opts.contentFile);
  }
  return singleton;
}

export function getContentStore() {
  if (!singleton) throw new Error("Content store not initialized — call initContentStore first");
  return singleton;
}
