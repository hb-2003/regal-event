import { config } from "dotenv";
import path from "path";
import { Client } from "pg";

config({ path: path.resolve(process.cwd(), ".env.local") });
config();

const url =
  process.env.DATABASE_URL ||
  "postgres://postgres:postgres@localhost:5432/regal_events";

async function main() {
  const client = new Client({
    connectionString: url,
    connectionTimeoutMillis: 10_000,
  });
  try {
    await client.connect();
    const res = await client.query("SELECT current_database(), current_user");
    console.log("OK:", res.rows[0]);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Database connection failed:", msg);
    if (msg.includes('database "regal_events" does not exist')) {
      console.error(
        "\nCreate it:\n  psql postgres://postgres:postgres@localhost:5432/postgres -c \"CREATE DATABASE regal_events;\""
      );
    }
    process.exit(1);
  } finally {
    await client.end().catch(() => undefined);
  }
}

main();
