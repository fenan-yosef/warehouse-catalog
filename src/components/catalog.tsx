import Link from "next/link";
import { LayoutGrid, PackageSearch, Search } from "lucide-react";
import type { Category, Settings } from "@/db/schema";
import { localePath, localizeCategory, localizeProduct, type Dict, type Lang } from "@/i18n";
import { categoryIcon } from "@/lib/category-icons";
import type { PublicProduct } from "@/lib/queries";
import { ProductCard } from "./product-card";

/** Search box, category chips (links to real category pages) and the product grid. */
export function Catalog({
  lang,
  t,
  settings,
  categories,
  products,
  activeSlug,
  q,
}: {
  lang: Lang;
  t: Dict;
  settings: Settings;
  categories: Category[];
  products: PublicProduct[];
  activeSlug?: string;
  q?: string;
}) {
  const href = (path: string) => localePath(lang, path);
  const chip = (active: boolean) =>
    `inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-sm ${
      active ? "border-brand bg-brand text-white" : "border-border bg-surface hover:border-brand"
    }`;

  return (
    <>
      <form action={href("/products")} role="search" className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
          <input
            name="q"
            type="search"
            defaultValue={q}
            placeholder={t.products.searchPlaceholder}
            aria-label={t.products.search}
            className="input pl-9"
          />
        </div>
        <button className="btn-primary">
          <Search className="size-4 sm:hidden" aria-hidden />
          <span className="sr-only sm:not-sr-only">{t.products.search}</span>
        </button>
      </form>

      <nav className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1">
        <Link href={href("/products")} className={chip(!activeSlug)}>
          <LayoutGrid className="size-3.5" aria-hidden />
          {t.products.all}
        </Link>
        {categories.map((raw) => {
          const c = localizeCategory(raw, lang);
          const Icon = categoryIcon(raw.icon, raw.name);
          return (
            <Link key={c.id} href={href(`/categories/${c.slug}`)} className={chip(activeSlug === c.slug)}>
              <Icon className="size-3.5" aria-hidden />
              {c.name}
            </Link>
          );
        })}
      </nav>

      {products.length === 0 ? (
        <div className="card mt-6 flex flex-col items-center gap-2 p-10 text-center text-muted">
          <PackageSearch className="size-8" strokeWidth={1.5} aria-hidden />
          {q ? t.products.noneFor(q) : activeSlug ? t.category.empty : t.products.none}
        </div>
      ) : (
        <>
          <p className="mt-4 text-sm text-muted">{t.products.count(products.length)}</p>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={localizeProduct(p, lang)} settings={settings} t={t} lang={lang} />
            ))}
          </div>
        </>
      )}
    </>
  );
}

export function GridSkeleton() {
  return (
    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="card aspect-3/4 animate-pulse bg-background" />
      ))}
    </div>
  );
}
