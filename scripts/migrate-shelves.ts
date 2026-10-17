import { sql } from "drizzle-orm";
import { db } from "../lib/db";

async function main() {
  await db.execute(sql`
    alter table public.channels
      add column if not exists owner_id text
  `);
  await db.execute(sql`
    do $$
    begin
      alter table public.channels
        add constraint channels_owner_id_unique unique (owner_id);
    exception
      when duplicate_object then null;
    end $$
  `);
  await db.execute(sql`
    do $$
    begin
      alter table public.channels
        add constraint channels_owner_id_user_id_fk
        foreign key (owner_id) references public."user"(id) on delete set null;
    exception
      when duplicate_object then null;
    end $$
  `);
  await db.execute(sql`
    create table if not exists public.shelves (
      id uuid primary key default gen_random_uuid(),
      channel_id uuid not null references public.channels(id) on delete cascade,
      title text not null,
      sort_order integer not null default 0
    )
  `);
  await db.execute(sql`
    create index if not exists shelves_channel_id_idx on public.shelves (channel_id)
  `);
  await db.execute(sql`
    alter table public.videos
      add column if not exists shelf_id uuid
  `);
  await db.execute(sql`
    do $$
    begin
      alter table public.videos
        add constraint videos_shelf_id_shelves_id_fk
        foreign key (shelf_id) references public.shelves(id) on delete set null;
    exception
      when duplicate_object then null;
    end $$
  `);
  await db.execute(sql`
    create index if not exists videos_shelf_id_idx on public.videos (shelf_id)
  `);
  console.log("Channel editor schema is ready.");
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
