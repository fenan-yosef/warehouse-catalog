import type { Metadata } from "next";
import { Suspense } from "react";
import { getDictionary, localizeSettings, toLang, type Lang } from "@/i18n";
import { getCategories, getPublicProducts, getSettings } from "@/lib/queries";
import { photos } from "@/lib/photos";
import { pageMetadata } from "@/lib/site";
import { PageBanner } from "@/components/page-banner";
import { Catalog, GridSkeleton } from "@/components/catalog";

export async function generateMetadata({ params }: PageProps<"/[lang]/products">): Promise<Metadata> {
  const lang = toLang((await params).lang);
  const t = getDictionary(lang);
  const s = await getSettings();
  return pageMetadata({
    lang,
    path: "/products",
    title: t.meta.productsTitle,
    description: t.meta.productsDescription,
    siteName: s.businessName,
  });
}

export default async function ProductsPage({ params, searchParams }: PageProps<"/[lang]/products">) {
  const lang = toLang((await params).lang);
  const t = getDictionary(lang);
  return (
    <>
      <PageBanner
        image={photos.stackedBoxes}
        title={t.products.title}
        subtitle={t.products.subtitle}
        className="h-32 sm:h-44"
        scene="fittings"
      />
      <div className="mx-auto max-w-6xl px-4 py-6">
        <Suspense fallback={<GridSkeleton />}>
          <Results lang={lang} searchParams={searchParams} />
        </Suspense>
      </div>
    </>
  );
}

async function Results({
  lang,
  searchParams,
}: {
  lang: Lang;
  searchParams: PageProps<"/[lang]/products">["searchParams"];
}) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim().slice(0, 100) || undefined : undefined;
  const t = getDictionary(lang);
  const s = localizeSettings(await getSettings(), lang);
  const [categories, products] = await Promise.all([
    getCategories(),
    getPublicProducts({ q, includeOutOfStock: s.showOutOfStock }),
  ]);
  return (
    <>
      {/* Search result pages shouldn't be indexed; the canonical stays /products. */}
      {q && <meta name="robots" content="noindex, follow" />}
      <Catalog lang={lang} t={t} settings={s} categories={categories} products={products} q={q} />
    </>
  );
}
