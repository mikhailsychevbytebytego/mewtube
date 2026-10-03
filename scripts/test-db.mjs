import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";
import { pgTable, serial, text, varchar } from "drizzle-orm/pg-core";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const users = pgTable("users", {
  id: serial("id").primaryKey(),
  fullName: text("full_name"),
  phone: varchar("phone", { length: 256 }),
});

const client = postgres(connectionString, { prepare: false });
const db = drizzle(client);

try {
  const [info] = await db.execute(
    sql`select current_database() as database, current_user as "user", version() as version`,
  );
  console.log("Connected.");
  console.log(`database: ${info.database}`);
  console.log(`user: ${info.user}`);
  console.log(`version: ${String(info.version).split(" ").slice(0, 2).join(" ")}`);

  const [existing] = await db.execute(
    sql`select to_regclass('public.users') as users_table`,
  );

  if (!existing.users_table) {
    await db.execute(sql`
      create table public.users (
        id serial primary key,
        full_name text,
        phone varchar(256)
      )
    `);
    await db.execute(sql`alter table public.users enable row level security`);
    console.log("Created public.users and enabled row level security.");
  }

  const allUsers = await db.select().from(users);
  console.log(`users rows: ${allUsers.length}`);
} finally {
  await client.end();
}
