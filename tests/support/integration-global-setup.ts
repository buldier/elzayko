import { execSync } from "node:child_process";
import "dotenv/config";
import { Client } from "pg";

/**
 * Prepares the dedicated integration database:
 * 1. applies migrations (non-destructive `migrate deploy`);
 * 2. empties all tables — only if the database name ends in `_test`, so a misconfigured
 *    TEST_DATABASE_URL can never wipe development or production data.
 */
export default async function setup() {
  const url = process.env.TEST_DATABASE_URL;
  if (!url) throw new Error("TEST_DATABASE_URL must be set for integration tests");
  const database = new URL(url).pathname.slice(1);
  if (!database.endsWith("_test")) {
    throw new Error(`Refusing to run integration tests against "${database}": the database name must end with "_test"`);
  }

  execSync("npx prisma migrate deploy", { stdio: "inherit", env: { ...process.env, DATABASE_URL: url } });

  const client = new Client({ connectionString: url });
  await client.connect();
  try {
    const { rows } = await client.query<{ tablename: string }>(
      `SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename <> '_prisma_migrations'`,
    );
    if (rows.length) {
      await client.query(`TRUNCATE ${rows.map((row) => `"${row.tablename}"`).join(", ")} RESTART IDENTITY CASCADE`);
    }
  } finally {
    await client.end();
  }
}
