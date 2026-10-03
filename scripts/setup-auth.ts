import { eq } from "drizzle-orm";
import postgres from "postgres";
import { user } from "../drizzle/auth-schema";
import { db } from "../lib/db";

const statements = [
  `create table if not exists "user" (
    id text primary key,
    name text not null,
    email text not null unique,
    email_verified boolean not null default false,
    image text,
    created_at timestamp not null default now(),
    updated_at timestamp not null default now(),
    admin boolean not null default false
  )`,
  `create table if not exists "session" (
    id text primary key,
    expires_at timestamp not null,
    token text not null unique,
    created_at timestamp not null default now(),
    updated_at timestamp not null,
    ip_address text,
    user_agent text,
    user_id text not null references "user"(id) on delete cascade
  )`,
  `create index if not exists "session_userId_idx" on "session" (user_id)`,
  `create table if not exists "account" (
    id text primary key,
    account_id text not null,
    provider_id text not null,
    user_id text not null references "user"(id) on delete cascade,
    access_token text,
    refresh_token text,
    id_token text,
    access_token_expires_at timestamp,
    refresh_token_expires_at timestamp,
    scope text,
    password text,
    created_at timestamp not null default now(),
    updated_at timestamp not null default now()
  )`,
  `create index if not exists "account_userId_idx" on "account" (user_id)`,
  `create table if not exists "verification" (
    id text primary key,
    identifier text not null,
    value text not null,
    expires_at timestamp not null,
    created_at timestamp not null default now(),
    updated_at timestamp not null default now()
  )`,
  `create index if not exists "verification_identifier_idx" on "verification" (identifier)`,
  `alter table "user" enable row level security`,
  `alter table "session" enable row level security`,
  `alter table "account" enable row level security`,
  `alter table "verification" enable row level security`,
];

async function main() {
  const connectionString = process.env.DATABASE_URL;
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!connectionString || !email || !password) {
    throw new Error("DATABASE_URL, ADMIN_EMAIL, and ADMIN_PASSWORD are required.");
  }

  const sql = postgres(connectionString, { prepare: false });
  try {
    for (const statement of statements) {
      await sql.unsafe(statement);
    }

    const rls = await sql<{ relname: string; relrowsecurity: boolean }[]>`
      select c.relname, c.relrowsecurity
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public'
        and c.relname in ('user', 'session', 'account', 'verification')
      order by c.relname
    `;
    console.log(
      rls.map((row) => `${row.relname}:${row.relrowsecurity}`).join(" "),
    );

    const response = await fetch("http://localhost:3000/api/auth/sign-up/email", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        origin: "http://localhost:3000",
      },
      body: JSON.stringify({ email, password, name: "Admin" }),
    });
    if (!response.ok) {
      const [existing] = await db
        .select({ email: user.email })
        .from(user)
        .where(eq(user.email, email))
        .limit(1);
      if (!existing) {
        const detail = await response.text();
        throw new Error(`Sign-up failed (${response.status}): ${detail.slice(0, 300)}`);
      }
    }

    await db.update(user).set({ admin: true }).where(eq(user.email, email));
    const [admin] = await db
      .select({ email: user.email, admin: user.admin })
      .from(user)
      .where(eq(user.email, email))
      .limit(1);
    console.log(admin ? `${admin.email} admin=${admin.admin}` : "admin missing");
  } finally {
    await sql.end();
  }
  process.exit(0);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
