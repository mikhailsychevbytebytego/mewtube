import Image from "next/image";
import { CatFace } from "@/components/cat-face";
import { CheckIcon } from "@/components/icons";
import type { Video } from "@/lib/videos";

export function VideoCard({ video }: { video: Video }) {
  return (
    <article>
      <button type="button" className="group block w-full text-left">
        <div className="relative aspect-video overflow-hidden rounded-xl bg-[#e5e5e5] transition-[border-radius] duration-200 group-hover:rounded-none">
          <Image
            src={`/thumbnails/${video.id}.jpg`}
            alt=""
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
          <span className="sr-only">{video.duration}</span>
        </div>
        <div className="mt-3 flex gap-3">
          <span className="mt-0.5 grid size-9 shrink-0 place-items-center overflow-hidden rounded-full bg-[#f3f3f3]">
            <CatFace color={video.avatar} innerEar={video.innerEar} />
          </span>
          <span className="min-w-0">
            <span className="line-clamp-2 text-sm font-medium leading-5 text-ink">
              {video.title}
            </span>
            <span className="mt-1 flex items-center gap-1 text-xs text-muted">
              <span className="truncate">{video.channel}</span>
              <CheckIcon />
              <span className="sr-only">Verified</span>
            </span>
            <span className="mt-0.5 block text-xs text-muted">
              {video.views} • {video.uploaded}
            </span>
          </span>
        </div>
      </button>
    </article>
  );
}
