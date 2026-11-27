import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin, PackageCheck, Ship, Store, Warehouse } from "lucide-react";
import { getDictionary, localePath, localizeCategory, localizeProduct, localizeSettings, toLang } from "@/i18n";
import { photos } from "@/lib/photos";
import { getCategories, getPublicProducts, getSettings } from "@/lib/queries";
import { getContactLinks } from "@/lib/contact";
import { categoryIcon } from "@/lib/category-icons";
import { pageMetadata } from "@/lib/site";
import { LogoBars } from "@/components/brand-accents";
import { ContactButtons } from "@/components/contact-buttons";
import { MapEmbed } from "@/components/map-embed";
import { ProductCard } from "@/components/product-card";
import { ImportRoute } from "@/components/import-route";
import { Faq } from "@/components/faq";
import { ThreeScene } from "@/components/three/three-scene";

export async function generateMetadata({ params }: PageProps<"/[lang]">): Promise<Metadata> {
  const lang = toLang((await params).lang);
  const t = getDictionary(lang);
  const s = await getSettings();
  return pageMetadata({
    lang,
    path: "/",
    title: { absolute: t.meta.siteTitle },
    description: t.meta.description,
    siteName: s.businessName,
  });
}

const WHAT_WE_SELL = [
  { image: photos.steelPipes, key: "metals" },
  { image: photos.faucet, key: "sanitary" },
] as const;

const VALUE_PROPS = [
  { image: photos.containerTrucks, Icon: Ship },
  { image: photos.stackedBoxes, Icon: Store },
  { image: photos.pipeRacks, Icon: Warehouse },
];

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const lang = toLang((await params).lang);
  const t = getDictionary(lang);
  const base = await getSettings();
  const s = localizeSettings(base, lang);
  const [categories, featured] = await Promise.all([
    getCategories(),
    getPublicProducts({ featuredOnly: true, includeOutOfStock: s.showOutOfStock, limit: 8 }),
  ]);
  const href = (path: string) => localePath(lang, path);

  return (
    <>
      <section className="relative isolate overflow-hidden bg-ink text-white">
        <Image
          src={photos.warehouseAisle}
          alt={t.hero.imageAlt}
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
            {t.hero.badge}
          </p>
          <h1 className="mt-4 max-w-xl text-3xl font-semibold tracking-tight sm:text-5xl">{base.businessName}</h1>
          <LogoBars className="mt-5 h-4 w-auto" />
          <p className="mt-5 max-w-2xl text-lg text-white/85">{s.tagline}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={href("/products")} className="btn-primary px-5 py-3 text-base">
              {t.hero.browse}
              <ArrowRight className="size-5" aria-hidden />
            </Link>
            <Link
              href={href("/contact")}
              className="btn border border-white/30 bg-white/10 px-5 py-3 text-base text-white backdrop-blur-sm hover:bg-white/20"
            >
              <MapPin className="size-5" aria-hidden />
              {t.hero.visit}
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-12">
        <h2 className="text-xl font-semibold sm:text-2xl">{t.home.introTitle}</h2>
        <p className="mt-3 max-w-3xl leading-relaxed text-muted">{t.home.intro}</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {WHAT_WE_SELL.map(({ image, key }) => (
            <Link
              key={key}
              href={href("/products")}
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
                  <p className="text-xl font-semibold sm:text-2xl">{t.home[key]}</p>
                  <p className="mt-0.5 text-sm text-white/85">{t.home[`${key}Body`]}</p>
                </div>
                <ArrowRight className="size-5 shrink-0 transition-transform group-hover:translate-x-1" aria-hidden />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {categories.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="text-xl font-semibold">{t.home.shopByCategory}</h2>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {categories.map((raw) => {
              const c = localizeCategory(raw, lang);
              const Icon = categoryIcon(raw.icon, raw.name);
              return (
                <Link
                  key={c.id}
                  href={href(`/categories/${c.slug}`)}
                  className="card group flex flex-col gap-3 p-4 transition-colors hover:border-brand"
                >
                  <span className="flex size-11 items-center justify-center rounded-lg bg-brand-soft text-brand transition-colors group-hover:bg-brand group-hover:text-white">
                    <Icon className="size-5.5" aria-hidden />
                  </span>
                  <span>
                    <span className="block font-medium">{c.name}</span>
                    {c.description && <span className="mt-0.5 line-clamp-2 block text-sm text-muted">{c.description}</span>}
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
            <h2 className="text-xl font-semibold">{t.home.featured}</h2>
            <Link href={href("/products")} className="inline-flex items-center gap-1 text-sm font-medium text-brand hover:underline">
              {t.home.seeAll}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p.id} product={localizeProduct(p, lang)} settings={s} t={t} lang={lang} />
            ))}
          </div>
        </section>
      )}

      <ImportRoute t={t} />

      <section className="mx-auto max-w-6xl px-4 py-12">
        <h2 className="text-xl font-semibold">{t.home.whyBuy}</h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-3">
          {VALUE_PROPS.map(({ image, Icon }, i) => {
            const { title, body } = t.home.valueProps[i];
            return (
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
                    <h3 className="font-semibold">{title}</h3>
                    <p className="mt-1 text-sm text-muted">{body}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold">{t.home.findUs}</h2>
            <p className="mt-2 text-muted">{t.home.findUsBody}</p>
            <div className="mt-5">
              <ContactButtons links={getContactLinks(s, t)} emptyText={t.contactLinks.soon} size="lg" />
            </div>
          </div>
          <MapEmbed settings={s} base={base} t={t} />
        </div>
      </section>

      <Faq t={t} address={s.warehouseAddress} hours={s.openingHours} markup={false} />
    </>
  );
}
