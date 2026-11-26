import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { LayoutGrid, PackageSearch, Search } from "lucide-react";
import { categoryIcon } from "@/lib/category-icons";
import { getCategories, getPublicProducts, getSettings } from "@/lib/queries";
import { ProductCard } from "@/components/product-card";

export const metadata: Metadata = { title: "Products" };

export default function ProductsPage({ searchParams }: PageProps<"/products">) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-semibold">Products</h1>
      <Suspense fallback={<GridSkeleton />}>
        <Catalog searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function Catalog({ searchParams }: { searchParams: PageProps<"/products">["searchParams"] }) {
  const sp = await searchParams;
  const category = typeof sp.category === "string" ? sp.category : undefined;
  const q = typeof sp.q === "string" ? sp.q.trim().slice(0, 100) : undefined;

  const s = await getSettings();
  const [categories, products] = await Promise.all([
    getCategories(),
    getPublicProducts({ categorySlug: category, q: q || undefined, includeOutOfStock: s.showOutOfStock }),
  ]);

  const chip = (active: boolean) =>
    `inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-sm ${
      active ? "border-brand bg-brand text-white" : "border-border bg-surface hover:border-brand"
    }`;
  const withQ = (cat?: string) => {
    const p = new URLSearchParams();
    if (cat) p.set("category", cat);
    if (q) p.set("q", q);
    const str = p.toString();
    return str ? `/products?${str}` : "/products";
  };

  return (
    <>
      <form action="/products" className="mt-4 flex gap-2">
        {category && <input type="hidden" name="category" value={category} />}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
          <input name="q" defaultValue={q} placeholder="Search products…" className="input pl-9" />
        </div>
        <button className="btn-primary">
          <Search className="size-4 sm:hidden" aria-label="Search" />
          <span className="hidden sm:inline">Search</span>
        </button>
      </form>

      <div className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1">
        <Link href={withQ()} className={chip(!category)}>
          <LayoutGrid className="size-3.5" aria-hidden />
          All
        </Link>
        {categories.map((c) => {
          const Icon = categoryIcon(c.icon, c.name);
          return (
            <Link key={c.id} href={withQ(c.slug)} className={chip(category === c.slug)}>
              <Icon className="size-3.5" aria-hidden />
              {c.name}
            </Link>
          );
        })}
      </div>

      {products.length === 0 ? (
        <div className="card mt-6 flex flex-col items-center gap-2 p-10 text-center text-muted">
          <PackageSearch className="size-8" strokeWidth={1.5} aria-hidden />
          No products found{q ? ` for “${q}”` : ""}.
        </div>
      ) : (
        <>
          <p className="mt-4 text-sm text-muted">{products.length} products</p>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} settings={s} />
            ))}
          </div>
        </>
      )}
    </>
  );
}

function GridSkeleton() {
  return (
    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="card aspect-[3/4] animate-pulse bg-background" />
      ))}
    </div>
  );
}
