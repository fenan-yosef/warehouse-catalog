import Link from "next/link";
import { ArrowRight, MapPin, PackageCheck, Ship, Store, Warehouse } from "lucide-react";
import { getCategories, getPublicProducts, getSettings } from "@/lib/queries";
import { getContactLinks } from "@/lib/contact";
import { categoryIcon } from "@/lib/category-icons";
import { ContactButtons } from "@/components/contact-buttons";
import { MapEmbed } from "@/components/map-embed";
import { ProductCard } from "@/components/product-card";

const VALUE_PROPS = [
  {
    Icon: Ship,
    title: "Imported directly",
    body: "We import from manufacturers abroad, so you skip the middlemen.",
  },
  {
    Icon: Store,
    title: "Wholesale & retail",
    body: "Buy by the piece or in bulk. Ask us about large orders.",
  },
  {
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
      <section className="border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:py-20">
          <p className="inline-flex items-center gap-2 rounded-full bg-brand-soft px-3 py-1 text-sm font-medium text-brand">
            <PackageCheck className="size-4" aria-hidden />
            Direct importers · Warehouse in Ashewa Meda
          </p>
          <h1 className="mt-4 max-w-3xl text-3xl font-semibold tracking-tight sm:text-5xl">
            {s.businessName}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">{s.tagline}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/products" className="btn-primary px-5 py-3 text-base">
              Browse products
              <ArrowRight className="size-5" aria-hidden />
            </Link>
            <Link href="/contact" className="btn-secondary px-5 py-3 text-base">
              <MapPin className="size-5" aria-hidden />
              Visit the warehouse
            </Link>
          </div>
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

      <section className="border-y border-border bg-surface">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-3">
          {VALUE_PROPS.map(({ Icon, title, body }) => (
            <div key={title} className="flex gap-4">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
                <Icon className="size-5.5" aria-hidden />
              </span>
              <div>
                <p className="font-semibold">{title}</p>
                <p className="mt-1 text-sm text-muted">{body}</p>
              </div>
            </div>
          ))}
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
