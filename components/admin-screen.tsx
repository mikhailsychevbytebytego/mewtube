import type { ReactNode } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { AdminForm, DeleteButton } from "@/components/admin-controls";
import {
  deleteChannel,
  deleteComment,
  deleteUser,
  deleteVideo,
  saveChannel,
  saveComment,
  saveUser,
  saveVideo,
} from "@/lib/admin-actions";
import { adminTypes, type AdminType, type getAdminData } from "@/lib/admin";

type AdminData = Awaited<ReturnType<typeof getAdminData>>;

const labels: Record<AdminType, string> = {
  users: "Users",
  channels: "Channels",
  videos: "Videos",
  comments: "Comments",
};

function href(type: AdminType, edit?: string) {
  return edit ? `/admin?type=${type}&edit=${encodeURIComponent(edit)}` : `/admin?type=${type}`;
}

function Field({
  label,
  name,
  defaultValue,
  required,
  readOnly,
  type = "text",
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  required?: boolean;
  readOnly?: boolean;
  type?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium">
        {label}
        {required ? <span className="text-muted"> *</span> : null}
      </span>
      <input
        name={name}
        type={type}
        required={required}
        readOnly={readOnly}
        defaultValue={defaultValue ?? ""}
        className="h-10 w-full rounded-lg border border-field-border bg-field px-3 outline-none focus:border-ink read-only:text-muted"
      />
    </label>
  );
}

function Area({
  label,
  name,
  defaultValue,
  hint,
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  hint?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-sm md:col-span-2">
      <span className="mb-1 block font-medium">
        {label}
        {required ? <span className="text-muted"> *</span> : null}
      </span>
      <textarea
        name={name}
        required={required}
        defaultValue={defaultValue ?? ""}
        rows={4}
        className="w-full rounded-lg border border-field-border bg-field px-3 py-2 outline-none focus:border-ink"
      />
      {hint ? <span className="mt-1 block text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

function Check({
  label,
  name,
  defaultChecked,
}: {
  label: string;
  name: string;
  defaultChecked?: boolean;
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="size-4 accent-ink"
      />
      {label}
    </label>
  );
}

function SelectField({
  label,
  name,
  defaultValue,
  options,
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  options: { value: string; label: string }[];
  required?: boolean;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium">
        {label}
        {required ? <span className="text-muted"> *</span> : null}
      </span>
      <select
        name={name}
        required={required}
        defaultValue={defaultValue ?? ""}
        className="h-10 w-full rounded-lg border border-field-border bg-field px-3 outline-none focus:border-ink"
      >
        <option value="">Choose</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function AdminScreen({
  type,
  edit,
  notice,
  data,
}: {
  type: AdminType;
  edit: string | null;
  notice: string | null;
  data: AdminData;
}) {
  const counts: Record<AdminType, number> = {
    users: data.userRows.length,
    channels: data.channelRows.length,
    videos: data.videoRows.length,
    comments: data.commentRows.length,
  };
  const creating = edit === "new";
  const user = data.userRows.find((row) => row.id === edit);
  const channel = data.channelRows.find((row) => row.id === edit);
  const video = data.videoRows.find((row) => row.id === edit);
  const comment = data.commentRows.find((row) => row.id === edit);
  const editing =
    creating ||
    (type === "users" && user) ||
    (type === "channels" && channel) ||
    (type === "videos" && video) ||
    (type === "comments" && comment);

  return (
    <div className="flex h-dvh flex-col bg-background text-ink">
      <header className="flex h-16 shrink-0 items-center gap-4 border-b border-line px-4 sm:px-6">
        <Link href="/" className="text-lg font-medium">
          CatTube
        </Link>
        <p className="text-sm text-muted">Admin</p>
        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </header>
      <div className="flex min-h-0 flex-1">
        <nav className="hidden w-52 shrink-0 flex-col gap-1 border-r border-line p-3 sm:flex">
          {adminTypes.map((item) => (
            <Link
              key={item}
              href={href(item)}
              aria-current={item === type ? "page" : undefined}
              className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${
                item === type ? "bg-ink font-medium text-background" : "hover:bg-chip"
              }`}
            >
              {labels[item]}
              <span className={item === type ? "text-background/80" : "text-muted"}>
                {counts[item]}
              </span>
            </Link>
          ))}
        </nav>
        <main className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
          <div className="mb-4 flex gap-2 overflow-x-auto sm:hidden">
            {adminTypes.map((item) => (
              <Link
                key={item}
                href={href(item)}
                className={`shrink-0 rounded-full px-3 py-1.5 text-sm ${
                  item === type ? "bg-ink text-background" : "bg-chip"
                }`}
              >
                {labels[item]}
              </Link>
            ))}
          </div>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-medium">{labels[type]}</h1>
              <p className="mt-1 text-sm text-muted">
                Changes show on the site right away. No sign-in on this page.
              </p>
            </div>
            {editing ? null : (
              <Link
                href={href(type, "new")}
                className="inline-flex h-10 items-center rounded-full bg-ink px-5 text-sm font-medium text-background"
              >
                New
              </Link>
            )}
          </div>
          {notice ? (
            <p className="mb-4 rounded-lg border border-field-border bg-chip px-3 py-2 text-sm">
              {notice}
            </p>
          ) : null}
          {editing ? (
            <section className="mb-8 max-w-3xl rounded-xl border border-line p-4 sm:p-5">
              <h2 className="mb-4 text-lg font-medium">
                {creating ? `New ${labels[type].slice(0, -1).toLowerCase()}` : `Edit ${edit}`}
              </h2>
              {type === "users" ? (
                <UserForm creating={creating} row={user} />
              ) : null}
              {type === "channels" ? (
                <ChannelForm creating={creating} row={channel} />
              ) : null}
              {type === "videos" ? (
                <VideoForm
                  creating={creating}
                  row={video}
                  channels={data.channelRows.map((row) => ({
                    value: row.id,
                    label: row.name,
                  }))}
                />
              ) : null}
              {type === "comments" ? (
                <CommentForm
                  creating={creating}
                  row={comment}
                  users={data.userRows.map((row) => ({ value: row.id, label: row.name }))}
                  videos={data.videoRows.map((row) => ({ value: row.id, label: row.title }))}
                />
              ) : null}
            </section>
          ) : null}
          {type === "users" ? <UserTable rows={data.userRows} /> : null}
          {type === "channels" ? <ChannelTable rows={data.channelRows} /> : null}
          {type === "videos" ? (
            <VideoTable rows={data.videoRows} channels={data.channelRows} />
          ) : null}
          {type === "comments" ? <CommentTable rows={data.commentRows} /> : null}
        </main>
      </div>
    </div>
  );
}

function UserForm({
  creating,
  row,
}: {
  creating: boolean;
  row: AdminData["userRows"][number] | undefined;
}) {
  return (
    <AdminForm action={saveUser} cancelHref={href("users")} submitLabel="Save user">
      <input type="hidden" name="mode" value={creating ? "create" : "update"} />
      {creating ? null : <input type="hidden" name="id" value={row?.id} />}
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Slug" name="slug" defaultValue={row?.slug} required />
        <Field label="Name" name="name" defaultValue={row?.name} required />
        <Field label="Avatar color" name="avatar" defaultValue={row?.avatar ?? "#e09a62"} required />
        <Field label="Inner ear color" name="innerEar" defaultValue={row?.innerEar} />
      </div>
    </AdminForm>
  );
}

function ChannelForm({
  creating,
  row,
}: {
  creating: boolean;
  row: AdminData["channelRows"][number] | undefined;
}) {
  return (
    <AdminForm action={saveChannel} cancelHref={href("channels")} submitLabel="Save channel">
      <input type="hidden" name="mode" value={creating ? "create" : "update"} />
      {creating ? null : <input type="hidden" name="id" value={row?.id} />}
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Slug" name="slug" defaultValue={row?.slug} required />
        <Field label="Name" name="name" defaultValue={row?.name} required />
        <Field label="Subscribers" name="subscribers" defaultValue={row?.subscribers} />
        <Field
          label="Video count"
          name="videoCount"
          type="number"
          defaultValue={row?.videoCount}
        />
        <Field
          label="Avatar color"
          name="avatarColor"
          defaultValue={row?.avatarColor ?? "#c4b8ae"}
          required
        />
        <Field label="Inner ear color" name="innerEar" defaultValue={row?.innerEar} />
        <Field label="Avatar image" name="avatarImage" defaultValue={row?.avatarImage} />
        <Field label="Banner image" name="bannerImage" defaultValue={row?.bannerImage} />
        <Field label="Creator image" name="creatorImage" defaultValue={row?.creatorImage} />
        <Check label="Has a channel page" name="hasPage" defaultChecked={row?.hasPage} />
        <Area
          label="Bio"
          name="bio"
          defaultValue={row?.bio.join("\n")}
          hint="One paragraph per line."
        />
        <Area label="More bio" name="bioMore" defaultValue={row?.bioMore} />
      </div>
    </AdminForm>
  );
}

function VideoForm({
  creating,
  row,
  channels,
}: {
  creating: boolean;
  row: AdminData["videoRows"][number] | undefined;
  channels: { value: string; label: string }[];
}) {
  return (
    <AdminForm action={saveVideo} cancelHref={href("videos")} submitLabel="Save video">
      <input type="hidden" name="mode" value={creating ? "create" : "update"} />
      {creating ? null : <input type="hidden" name="id" value={row?.id} />}
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Slug" name="slug" defaultValue={row?.slug} required />
        <SelectField
          label="Channel"
          name="channelId"
          defaultValue={row?.channelId}
          options={channels}
          required
        />
        <Field label="Title" name="title" defaultValue={row?.title} required />
        <Field label="Subtitle" name="subtitle" defaultValue={row?.subtitle} />
        <Field label="Duration" name="duration" defaultValue={row?.duration ?? "0:00"} required />
        <Field label="Views" name="views" defaultValue={row?.views} />
        <Field label="Uploaded" name="uploaded" defaultValue={row?.uploaded} />
        <Field label="Likes" name="likes" defaultValue={row?.likes} />
        <Field label="Thumbnail" name="thumbnail" defaultValue={row?.thumbnail} required />
        <Field label="Poster" name="poster" defaultValue={row?.poster} />
        <Field label="Featured image" name="featuredImage" defaultValue={row?.featuredImage} />
        <Field
          label="Comment count"
          name="commentCount"
          type="number"
          defaultValue={row?.commentCount ?? 0}
        />
        <Field label="Home order" name="homeOrder" type="number" defaultValue={row?.homeOrder ?? 0} />
        <Field
          label="Related order"
          name="relatedOrder"
          type="number"
          defaultValue={row?.relatedOrder ?? 0}
        />
        <Field
          label="Section order"
          name="sectionOrder"
          type="number"
          defaultValue={row?.sectionOrder ?? 0}
        />
        <SelectField
          label="Channel section"
          name="channelSection"
          defaultValue={row?.channelSection}
          options={[
            { value: "for-you", label: "For you" },
            { value: "shelf", label: "Shelf" },
          ]}
        />
        <div className="flex flex-wrap gap-4 md:col-span-2">
          <Check label="Show on home" name="showOnHome" defaultChecked={row?.showOnHome} />
          <Check label="Featured on channel" name="featured" defaultChecked={row?.featured} />
        </div>
        <Area label="Description" name="description" defaultValue={row?.description} />
        <Area
          label="Watch paragraphs"
          name="paragraphs"
          defaultValue={row?.paragraphs.join("\n")}
          hint="One paragraph per line."
        />
        <Area label="Show more text" name="descriptionMore" defaultValue={row?.descriptionMore} />
        <Area
          label="Thumbnail overlay"
          name="overlay"
          defaultValue={row?.overlay.join("\n")}
          hint="One overlay line per row."
        />
        <Field
          label="Categories"
          name="categories"
          defaultValue={row?.categories.join(", ")}
        />
        <Field label="Hashtags" name="hashtags" defaultValue={row?.hashtags.join(", ")} />
      </div>
    </AdminForm>
  );
}

function CommentForm({
  creating,
  row,
  users,
  videos,
}: {
  creating: boolean;
  row: AdminData["commentRows"][number] | undefined;
  users: { value: string; label: string }[];
  videos: { value: string; label: string }[];
}) {
  return (
    <AdminForm action={saveComment} cancelHref={href("comments")} submitLabel="Save comment">
      <input type="hidden" name="mode" value={creating ? "create" : "update"} />
      {creating ? null : <input type="hidden" name="id" value={row?.id} />}
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Posted" name="posted" defaultValue={row?.posted ?? "Just now"} required />
        <SelectField
          label="User"
          name="userId"
          defaultValue={row?.userId}
          options={users}
          required
        />
        <SelectField
          label="Video"
          name="videoId"
          defaultValue={row?.videoId}
          options={videos}
          required
        />
        <Field label="Likes" name="likes" defaultValue={row?.likes ?? "0"} required />
        <Field
          label="Sort order"
          name="sortOrder"
          type="number"
          defaultValue={row?.sortOrder ?? 0}
        />
        <Area label="Comment" name="body" defaultValue={row?.body} required />
      </div>
    </AdminForm>
  );
}

function UserTable({ rows }: { rows: AdminData["userRows"] }) {
  return (
    <Table
      headers={["Name", "Slug", "Avatar", ""]}
      empty="No users yet."
      rows={rows.map((row) => [
        row.name,
        row.slug,
        row.avatar,
        <RowActions
          key={row.id}
          editHref={href("users", row.id)}
          action={deleteUser.bind(null, row.id)}
          name={row.name}
        />,
      ])}
    />
  );
}

function ChannelTable({ rows }: { rows: AdminData["channelRows"] }) {
  return (
    <Table
      headers={["Name", "Slug", "Subscribers", "Page", ""]}
      empty="No channels yet."
      rows={rows.map((row) => [
        row.name,
        row.slug,
        row.subscribers ?? "—",
        row.hasPage ? "Yes" : "No",
        <RowActions
          key={row.id}
          editHref={href("channels", row.id)}
          action={deleteChannel.bind(null, row.id)}
          name={row.name}
        />,
      ])}
    />
  );
}

function VideoTable({
  rows,
  channels,
}: {
  rows: AdminData["videoRows"];
  channels: AdminData["channelRows"];
}) {
  const names = new Map(channels.map((channel) => [channel.id, channel.name]));
  return (
    <Table
      headers={["Title", "Channel", "Home", ""]}
      empty="No videos yet."
      rows={rows.map((row) => [
        row.title,
        names.get(row.channelId) ?? row.channelId,
        row.showOnHome ? "Yes" : "No",
        <RowActions
          key={row.id}
          editHref={href("videos", row.id)}
          action={deleteVideo.bind(null, row.id)}
          name={row.title}
        />,
      ])}
    />
  );
}

function CommentTable({ rows }: { rows: AdminData["commentRows"] }) {
  return (
    <Table
      headers={["Comment", "User", "Video", ""]}
      empty="No comments yet."
      rows={rows.map((row) => [
        row.body,
        row.author,
        row.videoTitle,
        <RowActions
          key={row.id}
          editHref={href("comments", row.id)}
          action={deleteComment.bind(null, row.id)}
          name="this comment"
        />,
      ])}
    />
  );
}

function RowActions({
  editHref,
  action,
  name,
}: {
  editHref: string;
  action: (formData: FormData) => void | Promise<void>;
  name: string;
}) {
  return (
    <span className="flex items-center justify-end gap-3">
      <Link href={editHref} className="text-sm font-medium">
        Edit
      </Link>
      <DeleteButton action={action} name={name} />
    </span>
  );
}

function Table({
  headers,
  rows,
  empty,
}: {
  headers: string[];
  rows: ReactNode[][];
  empty: string;
}) {
  if (rows.length === 0) {
    return <p className="text-sm text-muted">{empty}</p>;
  }
  return (
    <div className="overflow-x-auto rounded-xl border border-line">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="bg-chip text-muted">
          <tr>
            {headers.map((header) => (
              <th key={header || "actions"} className="px-3 py-2 font-medium">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((cells, index) => (
            <tr key={index} className="border-t border-line">
              {cells.map((cell, cellIndex) => (
                <td key={cellIndex} className="max-w-[360px] px-3 py-2 align-top">
                  {typeof cell === "string" || typeof cell === "number" ? (
                    <span className="line-clamp-2">{cell}</span>
                  ) : (
                    cell
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
