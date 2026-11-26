import Image, { type StaticImageData } from "next/image";
import { RedRule } from "./brand-accents";
import { ThreeScene, type SceneName } from "./three/three-scene";

/** Full-width photo strip with a darkened overlay and a title on top. */
export function PageBanner({
  image,
  title,
  subtitle,
  className = "h-40 sm:h-56",
  priority = true,
  scene,
}: {
  image: StaticImageData;
  title: string;
  subtitle?: string;
  className?: string;
  priority?: boolean;
  /** Optional 3D layer on the right side of the banner. */
  scene?: SceneName;
}) {
  return (
    <section className={`relative isolate flex items-end overflow-hidden bg-ink text-white ${className}`}>
      <Image
        src={image}
        alt=""
        fill
        priority={priority}
        placeholder="blur"
        quality={55}
        sizes="100vw"
        className="-z-10 object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-linear-to-t from-black/75 via-black/40 to-black/10" />
      {scene && <ThreeScene scene={scene} className="absolute inset-0 size-full" />}
      <div className="relative mx-auto w-full max-w-6xl px-4 pb-6 sm:pb-8">
        <h1 className="text-2xl font-semibold sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-1.5 max-w-2xl text-white/85 sm:text-lg">{subtitle}</p>}
      </div>
      <RedRule className="absolute inset-x-0 bottom-0" />
    </section>
  );
}
