import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ChevronRight, Package, ShoppingCart } from "lucide-react";
import {
  getDictionary,
  localePath,
  localizeCategory,
  localizeProduct,
  localizeSettings,
  toLang,
  type Lang,
} from "@/i18n";
import { getPublicProductBySlug, getSettings } from "@/lib/queries";
import { formatNumber, getAvailability, getPriceText, unitLabel } from "@/lib/display";
import { getContactLinks } from "@/lib/contact";
import { clip, pageMetadata } from "@/lib/site";
import { breadcrumbLd, productLd } from "@/lib/structured-data";
import { AvailabilityBadge } from "@/components/availability-badge";
import { ContactButtons } from "@/components/contact-buttons";
import { ProductImage } from "@/components/product-image";
import { JsonLd } from "@/components/json-ld";

type Props = PageProps<"/[lang]/products/[slug]">;

async function load(rawLang: string, slug: string) {
  const lang = toLang(rawLang);
  const row = await getPublicProductBySlug(slug);
  if (!row) return null;
  const product = localizeProduct(row, lang);
  const category = row.category ? localizeCategory(row.category, lang) : null;
  return { lang, product, category };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang: raw, slug } = await params;
  const [data, s] = await Promise.all([load(raw, slug), getSettings()]);
  if (!data) return {};
  const { lang, product, category } = data;
  const t = getDictionary(lang);
  const main = product.images[0];
  return pageMetadata({
    lang,
    path: `/products/${slug}`,
    title: t.meta.productTitle(product.name, category?.name),
    description: clip(product.description || t.meta.productDescription(product.name, category?.name)),
    siteName: s.businessName,
    image: main ? { url: main.url, alt: product.name } : null,
  });
}

export default function ProductPage({ params }: Props) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Suspense fallback={<div className="card h-96 animate-pulse bg-background" />}>
        <ProductDetail params={params} />
      </Suspense>
    </div>
  );
}

async function ProductDetail({ params }: { params: Props["params"] }) {
  const { lang: raw, slug } = await params;
  const [data, base] = await Promise.all([load(raw, slug), getSettings()]);
  if (!data) notFound();
  const { product, category } = data;
  const lang: Lang = data.lang;
  const t = getDictionary(lang);
  const s = localizeSettings(base, lang);
  const path = (p: string) => localePath(lang, p);

  const availability = getAvailability(product.quantity, product.unit, s, t);
  const unit = unitLabel(product.unit, t);
  const [main, ...rest] = product.images;
  const alt = category ? `${product.name} — ${category.name}` : product.name;

  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1 text-sm text-muted">
        <Link href={path("/products")} className="hover:text-brand">
          {t.nav.products}
        </Link>
        {category && (
          <>
            <ChevronRight className="size-3.5" aria-hidden />
            <Link href={path(`/categories/${category.slug}`)} className="hover:text-brand">
              {category.name}
            </Link>
          </>
        )}
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <div className="card relative aspect-square overflow-hidden">
            <ProductImage
              url={main?.url ?? null}
              name={alt}
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
              emptyLabel={t.product.noPhoto}
            />
          </div>
          {rest.length > 0 && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {rest.map((img, i) => (
                <a
                  key={img.id}
                  href={img.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card relative aspect-square overflow-hidden"
                >
                  <ProductImage url={img.url} name={`${alt} (${i + 2})`} sizes="25vw" />
                </a>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="text-2xl font-semibold sm:text-3xl">{product.name}</h1>
          <p className="mt-3 text-xl">{getPriceText(product.priceEtb, product.unit, s, t)}</p>
          <div className="mt-3">
            <AvailabilityBadge availability={availability} />
          </div>

          <dl className="card mt-6 grid grid-cols-2 gap-4 p-4 text-sm">
            <div className="flex gap-3">
              <Package className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden />
              <div>
                <dt className="text-muted">{t.product.soldBy}</dt>
                <dd className="font-medium">{unit}</dd>
              </div>
            </div>
            <div className="flex gap-3">
              <ShoppingCart className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden />
              <div>
                <dt className="text-muted">{t.product.minOrder}</dt>
                <dd className="font-medium">
                  {formatNumber(product.minOrderQty)} {unit}
                </dd>
              </div>
            </div>
          </dl>

          {product.description && <div className="mt-6 whitespace-pre-line text-muted">{product.description}</div>}

          <div className="mt-8">
            <p className="mb-3 font-medium">{t.product.interested}</p>
            <ContactButtons links={getContactLinks(s, t, product.name)} emptyText={t.contactLinks.soon} size="lg" />
          </div>
        </div>
      </div>

      <JsonLd
        data={productLd({
          name: product.name,
          description: product.description || t.meta.productDescription(product.name, category?.name),
          path: path(`/products/${product.slug}`),
          images: product.images.map((i) => i.url),
          category: category?.name,
          sku: String(product.id),
          tone: availability.tone,
          priceEtb: s.showPrices ? product.priceEtb : null,
        })}
      />
      <JsonLd
        data={breadcrumbLd([
          { name: t.nav.home, path: path("/") },
          { name: t.nav.products, path: path("/products") },
          ...(category ? [{ name: category.name, path: path(`/categories/${category.slug}`) }] : []),
          { name: product.name, path: path(`/products/${product.slug}`) },
        ])}
      />
    </>
  );
}
