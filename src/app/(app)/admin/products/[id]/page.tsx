import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, desc, eq } from "drizzle-orm";
import { ArrowLeft, ExternalLink, History, ImageIcon, Info, Package, Trash2 } from "lucide-react";
import { db } from "@/db";
import { categories, productImages, products, stockMovements } from "@/db/schema";
import { requireAdminPage } from "@/lib/admin";
import { formatNumber } from "@/lib/display";
import { deleteProduct } from "../../actions";
import { ProductForm } from "../product-form";
import { QuickStock } from "../quick-stock";
import { ImageManager } from "./image-manager";
import { ConfirmButton } from "../../confirm-button";

export default async function EditProductPage({ params, searchParams }: PageProps<"/admin/products/[id]">) {
  await requireAdminPage();
  const { id: rawId } = await params;
  const { created } = await searchParams;
  const id = Number(rawId);
  if (!Number.isInteger(id)) notFound();

  const [product, cats, images, movements] = await Promise.all([
    db.query.products.findFirst({ where: eq(products.id, id) }),
    db.select().from(categories).orderBy(asc(categories.sortOrder), asc(categories.name)),
    db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, id))
      .orderBy(asc(productImages.sortOrder), asc(productImages.id)),
    db
      .select()
      .from(stockMovements)
      .where(eq(stockMovements.productId, id))
      .orderBy(desc(stockMovements.createdAt))
      .limit(30),
  ]);
  if (!product) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin/products" className="inline-flex items-center gap-1 text-sm text-muted hover:text-brand">
            <ArrowLeft className="size-4" aria-hidden />
            Products
          </Link>
          <h1 className="mt-1 text-2xl font-semibold">{product.name}</h1>
        </div>
        {product.isPublished && (
          <Link href={`/products/${product.slug}`} target="_blank" className="btn-secondary">
            View on site
            <ExternalLink className="size-4" aria-hidden />
          </Link>
        )}
      </div>

      {created && (
        <p className="rounded-lg bg-ok-soft px-3 py-2 text-sm text-ok">Product created. Add some photos below.</p>
      )}

      <section className="card p-4 sm:p-6">
        <div className="flex items-baseline justify-between">
          <h2 className="flex items-center gap-2 font-semibold">
            <Package className="size-4 text-brand" aria-hidden />
            Stock
          </h2>
          <p className="text-2xl font-semibold tabular-nums">
            {formatNumber(product.quantity)} <span className="text-sm font-normal text-muted">{product.unit}</span>
          </p>
        </div>
        <QuickStock productId={product.id} showSet />
      </section>

      <section>
        <h2 className="mb-2 flex items-center gap-2 font-semibold">
          <ImageIcon className="size-4 text-brand" aria-hidden />
          Photos
        </h2>
        <ImageManager productId={product.id} images={images} />
      </section>

      <section>
        <h2 className="mb-2 flex items-center gap-2 font-semibold">
          <Info className="size-4 text-brand" aria-hidden />
          Details
        </h2>
        <ProductForm product={product} categories={cats} />
      </section>

      <section className="card p-4">
        <h2 className="flex items-center gap-2 font-semibold">
          <History className="size-4 text-brand" aria-hidden />
          Stock history
        </h2>
        {movements.length === 0 ? (
          <p className="mt-2 text-sm text-muted">No stock changes yet.</p>
        ) : (
          <ul className="mt-2 divide-y divide-border text-sm">
            {movements.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-3 py-2">
                <span className="min-w-0">
                  <span className="block capitalize">{m.reason}{m.note ? ` · ${m.note}` : ""}</span>
                  <span className="block truncate text-xs text-muted">
                    {m.adminEmail} ·{" "}
                    {m.createdAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Addis_Ababa" })}
                  </span>
                </span>
                <span className={`shrink-0 font-medium tabular-nums ${m.delta > 0 ? "text-ok" : "text-brand"}`}>
                  {m.delta > 0 ? "+" : ""}{formatNumber(m.delta)} → {formatNumber(m.quantityAfter)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="card border-red-200 p-4">
        <h2 className="flex items-center gap-2 font-semibold text-red-700">
          <Trash2 className="size-4" aria-hidden />
          Delete product
        </h2>
        <p className="mt-1 text-sm text-muted">
          Removes the product, its photos and its stock history. To just hide it, untick “Show on website”.
        </p>
        <form action={deleteProduct} className="mt-3">
          <input type="hidden" name="id" value={product.id} />
          <ConfirmButton message={`Delete “${product.name}” permanently?`} className="btn-danger">
            <Trash2 className="size-4" aria-hidden />
            Delete product
          </ConfirmButton>
        </form>
      </section>
    </div>
  );
}
