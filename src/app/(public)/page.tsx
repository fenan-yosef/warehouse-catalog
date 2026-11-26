import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, PackageCheck, Ship, Store, Warehouse } from "lucide-react";
import { photos } from "@/lib/photos";
import { LogoBars } from "@/components/brand-accents";
import { getCategories, getPublicProducts, getSettings } from "@/lib/queries";
import { getContactLinks } from "@/lib/contact";
import { categoryIcon } from "@/lib/category-icons";
import { ContactButtons } from "@/components/contact-buttons";
import { MapEmbed } from "@/components/map-embed";
import { ProductCard } from "@/components/product-card";
import { ImportRoute } from "@/components/import-route";
import { ThreeScene } from "@/components/three/three-scene";

const WHAT_WE_SELL = [
  { image: photos.steelPipes, title: "Metals", body: "Pipes, tubes and metal fittings" },
  { image: photos.faucet, title: "Sanitary materials", body: "Taps, sinks and bathroom supplies" },
];

const VALUE_PROPS = [
  {
    image: photos.containerTrucks,
    Icon: Ship,
    title: "Imported directly",
    body: "We import from manufacturers abroad, so you skip the middlemen.",
  },
  {
    image: photos.stackedBoxes,
    Icon: Store,
    title: "Wholesale & retail",
    body: "Buy by the piece or in bulk. Ask us about large orders.",
  },
  {
    image: photos.pipeRacks,
    Icon: Warehouse,
    title: "See it in person",
    body: "Visit our warehouse in Ashewa Meda to check goods before you buy.",
  },
];

export default async function HomePage() {
  const s = await getSettings();
  const [categories, featured] = await Promise.all([
    getCategories(),
    getPublicProducts({ featuredOnly: true, includeOutOfStock: s.showOutOfStock, limit: 8 }),
  ]);

  return (
    <>
      <section className="relative isolate overflow-hidden bg-ink text-white">
        <Image
          src={photos.warehouseAisle}
          alt="Warehouse aisle with shelves full of stock"
          fill
          priority
          placeholder="blur"
          quality={55}
          sizes="100vw"
          className="-z-10 object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-linear-to-r from-black/85 via-black/65 to-black/45" />
        <div className="pointer-events-none absolute inset-0 opacity-45 lg:opacity-100">
          <ThreeScene scene="hero" className="size-full" />
        </div>
        <div className="relative mx-auto max-w-6xl px-4 py-20 sm:py-32">
          <p className="inline-flex items-center gap-2 rounded-full bg-brand px-3 py-1 text-sm font-medium">
            <PackageCheck className="size-4" aria-hidden />
            Direct importers · Warehouse in Ashewa Meda
          </p>
          <h1 className="mt-4 max-w-xl text-3xl font-semibold tracking-tight sm:text-5xl">
            {s.businessName}
          </h1>
          <LogoBars className="mt-5 h-4 w-auto" />
          <p className="mt-5 max-w-2xl text-lg text-white/85">{s.tagline}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/products" className="btn-primary px-5 py-3 text-base">
              Browse products
              <ArrowRight className="size-5" aria-hidden />
            </Link>
            <Link
              href="/contact"
              className="btn border border-white/30 bg-white/10 px-5 py-3 text-base text-white backdrop-blur-sm hover:bg-white/20"
            >
              <MapPin className="size-5" aria-hidden />
              Visit the warehouse
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-12">
        <h2 className="text-xl font-semibold">What we import</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {WHAT_WE_SELL.map(({ image, title, body }) => (
            <Link
              key={title}
              href="/products"
              className="group relative isolate flex h-48 items-end overflow-hidden rounded-xl bg-ink text-white sm:h-64"
            >
              <Image
                src={image}
                alt=""
                fill
                placeholder="blur"
                quality={55}
                sizes="(min-width: 640px) 50vw, 100vw"
                className="-z-10 object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 -z-10 bg-linear-to-t from-black/75 via-black/25 to-transparent" />
              <div className="flex w-full items-end justify-between gap-3 p-5">
                <div>
                  <p className="text-xl font-semibold sm:text-2xl">{title}</p>
                  <p className="mt-0.5 text-sm text-white/85">{body}</p>
                </div>
                <ArrowRight className="size-5 shrink-0 transition-transform group-hover:translate-x-1" aria-hidden />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {categories.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="text-xl font-semibold">Shop by category</h2>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((c) => {
              const Icon = categoryIcon(c.icon, c.name);
              return (
                <Link
                  key={c.id}
                  href={`/products?category=${c.slug}`}
                  className="card group flex flex-col gap-3 p-4 transition-colors hover:border-brand"
                >
                  <span className="flex size-11 items-center justify-center rounded-lg bg-brand-soft text-brand transition-colors group-hover:bg-brand group-hover:text-white">
                    <Icon className="size-5.5" aria-hidden />
                  </span>
                  <span>
                    <span className="block font-medium">{c.name}</span>
                    {c.description && (
                      <span className="mt-0.5 line-clamp-2 block text-sm text-muted">{c.description}</span>
                    )}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-12">
          <div className="flex items-end justify-between">
            <h2 className="text-xl font-semibold">Featured products</h2>
            <Link href="/products" className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline">
              See all
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} settings={s} />
            ))}
          </div>
        </section>
      )}

      <ImportRoute />

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div>
          <h2 className="text-xl font-semibold">Why buy from us</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-3">
            {VALUE_PROPS.map(({ image, Icon, title, body }) => (
              <div key={title} className="card overflow-hidden">
                <div className="relative aspect-16/10 bg-neutral-200">
                  <Image
                    src={image}
                    alt=""
                    fill
                    placeholder="blur"
                    quality={55}
                    sizes="(min-width: 640px) 33vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <div className="flex gap-3 p-4">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand text-white">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <div>
                    <p className="font-semibold">{title}</p>
                    <p className="mt-1 text-sm text-muted">{body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold">Find our warehouse</h2>
            <p className="mt-2 text-muted">
              Come see the goods, or message us and we&apos;ll confirm availability before you travel.
            </p>
            <div className="mt-5">
              <ContactButtons links={getContactLinks(s)} size="lg" />
            </div>
          </div>
          <MapEmbed settings={s} />
        </div>
      </section>
    </>
  );
}
