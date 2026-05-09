import bcrypt from "bcryptjs";
import { getPool, runMigrations } from "./postgresClient.js";

const SALT_ROUNDS = 10;

export async function ensureAuthSchema() {
  await runMigrations();
}

export async function countAdmins() {
  const pool = getPool();
  const r = await pool.query(`SELECT COUNT(*)::int AS c FROM users WHERE role = 'admin'`);
  return r.rows[0]?.c ?? 0;
}

export async function findUserByUsername(username) {
  const pool = getPool();
  const r = await pool.query(
    `SELECT id, username, password_hash, role FROM users WHERE username = $1 LIMIT 1`,
    [String(username).trim()]
  );
  return r.rows[0] || null;
}

export async function createUser(username, plainPassword, role = "admin") {
  const hash = await bcrypt.hash(String(plainPassword), SALT_ROUNDS);
  const pool = getPool();
  const r = await pool.query(
    `INSERT INTO users (username, password_hash, role, updated_at)
     VALUES ($1, $2, $3, NOW())
     RETURNING id, username, role`,
    [String(username).trim(), hash, role]
  );
  return r.rows[0];
}

export async function verifyPassword(plainPassword, passwordHash) {
  return bcrypt.compare(String(plainPassword), String(passwordHash));
}
