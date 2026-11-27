import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createElement, Suspense } from "react";
import { ChevronRight } from "lucide-react";
import { getDictionary, localePath, localizeCategory, localizeSettings, toLang, type Lang } from "@/i18n";
import { categoryIcon } from "@/lib/category-icons";
import { getCategories, getCategoryBySlug, getPublicProducts, getSettings } from "@/lib/queries";
import { clip, pageMetadata } from "@/lib/site";
import { breadcrumbLd, itemListLd } from "@/lib/structured-data";
import { Catalog, GridSkeleton } from "@/components/catalog";
import { JsonLd } from "@/components/json-ld";

type Props = PageProps<"/[lang]/categories/[slug]">;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang: raw, slug } = await params;
  const lang = toLang(raw);
  const t = getDictionary(lang);
  const [row, s] = await Promise.all([getCategoryBySlug(slug), getSettings()]);
  if (!row) return {};
  const c = localizeCategory(row, lang);
  return pageMetadata({
    lang,
    path: `/categories/${slug}`,
    title: t.meta.categoryTitle(c.name),
    description: clip(c.description ? `${c.description}. ${t.meta.categoryDescription(c.name)}` : t.meta.categoryDescription(c.name)),
    siteName: s.businessName,
  });
}

export default function CategoryPage({ params }: Props) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Suspense fallback={<GridSkeleton />}>
        <CategoryDetail params={params} />
      </Suspense>
    </div>
  );
}

async function CategoryDetail({ params }: { params: Props["params"] }) {
  const { lang: raw, slug } = await params;
  const lang: Lang = toLang(raw);
  const t = getDictionary(lang);
  const row = await getCategoryBySlug(slug);
  if (!row) notFound();
  const c = localizeCategory(row, lang);
  const s = localizeSettings(await getSettings(), lang);
  const [categories, products] = await Promise.all([
    getCategories(),
    getPublicProducts({ categorySlug: slug, includeOutOfStock: s.showOutOfStock }),
  ]);
  const path = (p: string) => localePath(lang, p);

  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1 text-sm text-muted">
        <Link href={path("/")} className="hover:text-brand">{t.nav.home}</Link>
        <ChevronRight className="size-3.5" aria-hidden />
        <Link href={path("/products")} className="hover:text-brand">{t.nav.products}</Link>
        <ChevronRight className="size-3.5" aria-hidden />
        <span className="text-foreground">{c.name}</span>
      </nav>

      <header className="mb-6 flex items-start gap-4">
        <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-brand text-white">
          {createElement(categoryIcon(row.icon, row.name), { className: "size-7", "aria-hidden": true })}
        </span>
        <div>
          <h1 className="text-2xl font-semibold sm:text-3xl">{c.name}</h1>
          <p className="mt-1 max-w-3xl text-muted">
            {c.description ? `${c.description}. ` : ""}
            {t.category.intro(c.name)}
          </p>
        </div>
      </header>

      <Catalog lang={lang} t={t} settings={s} categories={categories} products={products} activeSlug={slug} />

      <JsonLd
        data={breadcrumbLd([
          { name: t.nav.home, path: path("/") },
          { name: t.nav.products, path: path("/products") },
          { name: c.name, path: path(`/categories/${slug}`) },
        ])}
      />
      {products.length > 0 && <JsonLd data={itemListLd(products.map((p) => path(`/products/${p.slug}`)))} />}
    </>
  );
}
