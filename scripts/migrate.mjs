import "dotenv/config";
import { runMigrations, closePool } from "../postgresClient.js";

if (!process.env.DATABASE_URL?.trim()) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

await runMigrations();
console.log("Migrations OK");
await closePool();
