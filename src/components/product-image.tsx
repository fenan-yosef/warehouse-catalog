import Image from "next/image";

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
      <div className="flex size-full items-center justify-center bg-brand-soft text-brand">
        <span className="text-3xl font-semibold opacity-60">{name.slice(0, 1).toUpperCase()}</span>
      </div>
    );
  }
  return (
    <Image
      src={url}
      alt={name}
      fill
      sizes={sizes}
      priority={priority}
      className="object-cover"
    />
  );
}
