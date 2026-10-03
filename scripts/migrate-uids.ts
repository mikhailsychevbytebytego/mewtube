import { sql } from "drizzle-orm";
import { db } from "../lib/db";

async function main() {
  const existing = await db.execute<{ column_name: string }>(sql`
    select column_name
    from information_schema.columns
    where table_schema = 'public' and table_name = 'users' and column_name = 'slug'
  `);
  if (existing.length > 0) {
    console.log("Already using uids.");
    process.exit(0);
  }

  await db.execute(sql`
    alter table public.users add column uid uuid not null default gen_random_uuid();
    alter table public.users add column slug text;
    update public.users set slug = id;
    alter table public.users alter column slug set not null;

    alter table public.channels add column uid uuid not null default gen_random_uuid();
    alter table public.channels add column slug text;
    update public.channels set slug = id;
    alter table public.channels alter column slug set not null;

    alter table public.videos add column uid uuid not null default gen_random_uuid();
    alter table public.videos add column slug text;
    update public.videos set slug = id;
    alter table public.videos alter column slug set not null;
    alter table public.videos add column channel_uid uuid;
    update public.videos as video
      set channel_uid = channel.uid
      from public.channels as channel
      where video.channel_id = channel.id;
    alter table public.videos alter column channel_uid set not null;

    alter table public.comments add column uid uuid not null default gen_random_uuid();
    alter table public.comments add column video_uid uuid;
    alter table public.comments add column user_uid uuid;
    update public.comments as comment
      set video_uid = video.uid
      from public.videos as video
      where comment.video_id = video.id;
    update public.comments as comment
      set user_uid = account.uid
      from public.users as account
      where comment.user_id = account.id;
    alter table public.comments alter column video_uid set not null;
    alter table public.comments alter column user_uid set not null;

    alter table public.comments drop constraint comments_video_id_fkey;
    alter table public.comments drop constraint comments_user_id_fkey;
    alter table public.videos drop constraint videos_channel_id_fkey;
    alter table public.comments drop constraint comments_pkey;
    alter table public.videos drop constraint videos_pkey;
    alter table public.channels drop constraint channels_pkey;
    alter table public.users drop constraint users_pkey;

    alter table public.comments drop column id;
    alter table public.comments drop column video_id;
    alter table public.comments drop column user_id;
    alter table public.videos drop column id;
    alter table public.videos drop column channel_id;
    alter table public.channels drop column id;
    alter table public.users drop column id;

    alter table public.users rename column uid to id;
    alter table public.channels rename column uid to id;
    alter table public.videos rename column uid to id;
    alter table public.videos rename column channel_uid to channel_id;
    alter table public.comments rename column uid to id;
    alter table public.comments rename column video_uid to video_id;
    alter table public.comments rename column user_uid to user_id;

    alter table public.users add primary key (id);
    alter table public.users add constraint users_slug_key unique (slug);
    alter table public.channels add primary key (id);
    alter table public.channels add constraint channels_slug_key unique (slug);
    alter table public.videos add primary key (id);
    alter table public.videos add constraint videos_slug_key unique (slug);
    alter table public.videos
      add constraint videos_channel_id_fkey
      foreign key (channel_id) references public.channels (id);
    alter table public.comments add primary key (id);
    alter table public.comments
      add constraint comments_video_id_fkey
      foreign key (video_id) references public.videos (id);
    alter table public.comments
      add constraint comments_user_id_fkey
      foreign key (user_id) references public.users (id);
  `);

  const [sample] = await db.execute<{ slug: string; id: string }>(sql`
    select slug, id::text as id from public.videos where slug = 'piano'
  `);
  console.log(sample);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
