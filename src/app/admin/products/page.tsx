import Link from "next/link";
import { asc, eq, ilike } from "drizzle-orm";
import { EyeOff, PackageSearch, Plus, Search } from "lucide-react";
import { db } from "@/db";
import { categories, products } from "@/db/schema";
import { requireAdminPage } from "@/lib/admin";
import { formatNumber } from "@/lib/display";
import { getSettings } from "@/lib/queries";
import { QuickStock } from "./quick-stock";

export default async function AdminProductsPage({ searchParams }: PageProps<"/admin/products">) {
  await requireAdminPage();
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const s = await getSettings();

  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      unit: products.unit,
      quantity: products.quantity,
      isPublished: products.isPublished,
      category: categories.name,
    })
    .from(products)
    .leftJoin(categories, eq(categories.id, products.categoryId))
    .where(q ? ilike(products.name, `%${q.replace(/[%_]/g, "")}%`) : undefined)
    .orderBy(asc(products.name))
    .limit(300);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Products</h1>
        <Link href="/admin/products/new" className="btn-primary">
          <Plus className="size-4" aria-hidden />
          Add product
        </Link>
      </div>

      <form className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" aria-hidden />
          <input name="q" defaultValue={q} placeholder="Search by name…" className="input pl-9" />
        </div>
        <button className="btn-secondary" aria-label="Search">
          <Search className="size-4 sm:hidden" aria-hidden />
          <span className="hidden sm:inline">Search</span>
        </button>
      </form>

      {rows.length === 0 ? (
        <div className="card flex flex-col items-center gap-2 p-10 text-center text-muted">
          <PackageSearch className="size-8" strokeWidth={1.5} aria-hidden />
          {q ? `No products match “${q}”.` : "No products yet. Add your first one."}
        </div>
      ) : (
        <ul className="space-y-2">
          {rows.map((p) => {
            const tone =
              p.quantity <= 0 ? "text-out" : p.quantity <= s.lowStockThreshold ? "text-low" : "text-ok";
            return (
              <li key={p.id} className="card p-3 sm:p-4">
                <div className="flex items-start justify-between gap-3">
                  <Link href={`/admin/products/${p.id}`} className="min-w-0 hover:text-brand">
                    <p className="truncate font-medium">{p.name}</p>
                    <p className="flex items-center gap-1 text-xs text-muted">
                      {p.category ?? "No category"}
                      {!p.isPublished && (
                        <>
                          {" · "}
                          <EyeOff className="size-3" aria-hidden /> Hidden from site
                        </>
                      )}
                    </p>
                  </Link>
                  <p className={`shrink-0 text-right text-lg font-semibold tabular-nums ${tone}`}>
                    {formatNumber(p.quantity)}
                    <span className="ml-1 text-xs font-normal text-muted">{p.unit}</span>
                  </p>
                </div>
                <QuickStock productId={p.id} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
