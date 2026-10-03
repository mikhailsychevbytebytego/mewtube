import Image from "next/image";
import Link from "next/link";
import { CatFace } from "@/components/cat-face";
import { CheckIcon } from "@/components/icons";
import { channelHref, watchHref, type Video } from "@/lib/videos";

export function VideoCard({ video }: { video: Video }) {
  const watch = watchHref(video);
  const channel = channelHref(video.channelHandle);
  return (
    <article>
      <Link
        href={watch}
        className="group block w-full rounded-xl text-left outline-none focus-visible:ring-2 focus-visible:ring-ink"
      >
        <div className="relative aspect-video overflow-hidden rounded-xl bg-[#e5e5e5] transition-[border-radius] duration-200 group-hover:rounded-none">
          <Image
            src={video.thumbnail ?? `/thumbnails/${video.slug ?? video.id}.jpg`}
            alt=""
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
          <span className="absolute right-1.5 bottom-1.5 rounded-[4px] bg-black/80 px-1 py-0.5 text-xs font-medium text-white">
            {video.duration}
          </span>
        </div>
      </Link>
      <div className="mt-3 flex gap-3">
        <Link
          href={channel}
          className="mt-0.5 grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-[#f3f3f3]"
        >
          <CatFace color={video.avatar} innerEar={video.innerEar} />
        </Link>
        <span className="min-w-0">
          <Link
            href={watch}
            className="line-clamp-2 text-sm font-medium leading-5 text-ink outline-none focus-visible:ring-2 focus-visible:ring-ink"
          >
            {video.title}
          </Link>
          <Link
            href={channel}
            className="mt-1 flex items-center gap-1 text-xs text-muted outline-none focus-visible:ring-2 focus-visible:ring-ink"
          >
            <span className="truncate">{video.channel}</span>
            <CheckIcon />
            <span className="sr-only">Verified</span>
          </Link>
          <span className="mt-0.5 block text-xs text-muted">
            {video.views} • {video.uploaded}
          </span>
        </span>
      </div>
    </article>
  );
}
