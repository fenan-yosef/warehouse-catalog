import Link from "next/link";
import { getCategories, getPublicProducts, getSettings } from "@/lib/queries";
import { getContactLinks } from "@/lib/contact";
import { ContactButtons } from "@/components/contact-buttons";
import { MapEmbed } from "@/components/map-embed";
import { ProductCard } from "@/components/product-card";

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
          <p className="text-sm font-medium uppercase tracking-wide text-brand">
            Direct importers · Warehouse in Ashewa Meda
          </p>
          <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight sm:text-5xl">
            {s.businessName}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">{s.tagline}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/products" className="btn-primary px-5 py-3 text-base">
              Browse products
            </Link>
            <Link href="/contact" className="btn-secondary px-5 py-3 text-base">
              Visit the warehouse
            </Link>
          </div>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-12">
          <h2 className="text-xl font-semibold">Shop by category</h2>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/products?category=${c.slug}`}
                className="card p-4 transition-colors hover:border-brand"
              >
                <p className="font-medium">{c.name}</p>
                {c.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-muted">{c.description}</p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {featured.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-12">
          <div className="flex items-end justify-between">
            <h2 className="text-xl font-semibold">Featured products</h2>
            <Link href="/products" className="text-sm font-medium text-brand hover:underline">
              See all →
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
          {[
            ["Imported directly", "We import from manufacturers abroad, so you skip the middlemen."],
            ["Wholesale & retail", "Buy by the piece or in bulk. Ask us about large orders."],
            ["See it in person", "Visit our warehouse in Ashewa Meda to check goods before you buy."],
          ].map(([title, body]) => (
            <div key={title}>
              <p className="font-semibold">{title}</p>
              <p className="mt-1 text-sm text-muted">{body}</p>
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
