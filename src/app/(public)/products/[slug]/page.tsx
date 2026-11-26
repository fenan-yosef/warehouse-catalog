import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ChevronRight, Package, ShoppingCart } from "lucide-react";
import { getPublicProductBySlug, getSettings } from "@/lib/queries";
import { getAvailability, getPriceText, formatNumber } from "@/lib/display";
import { getContactLinks } from "@/lib/contact";
import { AvailabilityBadge } from "@/components/availability-badge";
import { ContactButtons } from "@/components/contact-buttons";
import { ProductImage } from "@/components/product-image";

export async function generateMetadata({ params }: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = await getPublicProductBySlug(slug);
  return p ? { title: p.name, description: p.description.slice(0, 160) } : {};
}

export default function ProductPage({ params }: PageProps<"/products/[slug]">) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Suspense fallback={<div className="card h-96 animate-pulse bg-background" />}>
        <ProductDetail params={params} />
      </Suspense>
    </div>
  );
}

async function ProductDetail({ params }: { params: PageProps<"/products/[slug]">["params"] }) {
  const { slug } = await params;
  const [product, s] = await Promise.all([getPublicProductBySlug(slug), getSettings()]);
  if (!product) notFound();

  const availability = getAvailability(product.quantity, product.unit, s);
  const [main, ...rest] = product.images;

  return (
    <>
      <nav className="mb-4 flex flex-wrap items-center gap-1 text-sm text-muted">
        <Link href="/products" className="hover:text-brand">
          Products
        </Link>
        {product.category && (
          <>
            <ChevronRight className="size-3.5" aria-hidden />
            <Link href={`/products?category=${product.category.slug}`} className="hover:text-brand">
              {product.category.name}
            </Link>
          </>
        )}
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          <div className="card relative aspect-square overflow-hidden">
            <ProductImage
              url={main?.url ?? null}
              name={product.name}
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>
          {rest.length > 0 && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {rest.map((img) => (
                <a
                  key={img.id}
                  href={img.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card relative aspect-square overflow-hidden"
                >
                  <ProductImage url={img.url} name={product.name} sizes="25vw" />
                </a>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="text-2xl font-semibold sm:text-3xl">{product.name}</h1>
          <p className="mt-3 text-xl">{getPriceText(product.priceEtb, product.unit, s)}</p>
          <div className="mt-3">
            <AvailabilityBadge availability={availability} />
          </div>

          <dl className="card mt-6 grid grid-cols-2 gap-4 p-4 text-sm">
            <div className="flex gap-3">
              <Package className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden />
              <div>
                <dt className="text-muted">Sold by</dt>
                <dd className="font-medium">{product.unit}</dd>
              </div>
            </div>
            <div className="flex gap-3">
              <ShoppingCart className="mt-0.5 size-5 shrink-0 text-brand" aria-hidden />
              <div>
                <dt className="text-muted">Minimum order</dt>
                <dd className="font-medium">
                  {formatNumber(product.minOrderQty)} {product.unit}
                </dd>
              </div>
            </div>
          </dl>

          {product.description && (
            <div className="mt-6 whitespace-pre-line text-muted">{product.description}</div>
          )}

          <div className="mt-8">
            <p className="mb-3 font-medium">Interested? Message us to order:</p>
            <ContactButtons links={getContactLinks(s, product.name)} size="lg" />
          </div>
        </div>
      </div>
    </>
  );
}
