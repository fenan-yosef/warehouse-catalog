import Image from "next/image";
import { Package } from "lucide-react";

/** Product photo, or a neutral placeholder tile when there is none yet. */
export function ProductImage({
  url,
  name,
  sizes,
  priority,
}: {
  url: string | null;
  name: string;
  sizes: string;
  priority?: boolean;
}) {
  if (!url) {
    return (
      <div className="flex size-full flex-col items-center justify-center gap-1 bg-neutral-100 text-neutral-400">
        <Package className="size-1/4 max-h-16 max-w-16" strokeWidth={1.5} aria-hidden />
        <span className="text-xs">No photo yet</span>
      </div>
    );
  }
  return (
    <Image
      src={url}
      alt={name}
      fill
      sizes={sizes}
      quality={70}
      priority={priority}
      className="object-cover"
    />
  );
}
