import Link from "next/link";
import { and, count, desc, eq, gt, lte, sum } from "drizzle-orm";
import { CircleAlert, CircleX, Boxes, History, Package, PackagePlus, Plus, type LucideIcon } from "lucide-react";
import { db } from "@/db";
import { products, stockMovements } from "@/db/schema";
import { requireAdminPage } from "@/lib/admin";
import { formatNumber } from "@/lib/display";
import { getSettings } from "@/lib/queries";

export default async function AdminDashboard() {
  await requireAdminPage();
  const s = await getSettings();

  const [[totals], low, out, recent] = await Promise.all([
    db
      .select({ products: count(), units: sum(products.quantity) })
      .from(products),
    db
      .select({ id: products.id, name: products.name, quantity: products.quantity, unit: products.unit })
      .from(products)
      .where(and(gt(products.quantity, 0), lte(products.quantity, s.lowStockThreshold)))
      .orderBy(products.quantity)
      .limit(10),
    db
      .select({ id: products.id, name: products.name })
      .from(products)
      .where(lte(products.quantity, 0))
      .orderBy(products.name)
      .limit(10),
    db
      .select({
        id: stockMovements.id,
        delta: stockMovements.delta,
        quantityAfter: stockMovements.quantityAfter,
        reason: stockMovements.reason,
        adminEmail: stockMovements.adminEmail,
        createdAt: stockMovements.createdAt,
        productId: products.id,
        productName: products.name,
      })
      .from(stockMovements)
      .innerJoin(products, eq(products.id, stockMovements.productId))
      .orderBy(desc(stockMovements.createdAt))
      .limit(10),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="flex gap-2">
          <Link href="/admin/products" className="btn-secondary">
            <PackagePlus className="size-4" aria-hidden />
            Update stock
          </Link>
          <Link href="/admin/products/new" className="btn-primary">
            <Plus className="size-4" aria-hidden />
            Add product
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat Icon={Package} label="Products" value={formatNumber(totals.products)} />
        <Stat Icon={Boxes} label="Units in stock" value={formatNumber(Number(totals.units ?? 0))} />
        <Stat Icon={CircleAlert} label="Low stock" value={String(low.length)} tone="low" />
        <Stat Icon={CircleX} label="Out of stock" value={String(out.length)} tone="out" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-4">
          <h2 className="flex items-center gap-2 font-semibold">
            <CircleAlert className="size-4 text-low" aria-hidden />
            Running low (≤ {s.lowStockThreshold})
          </h2>
          <List
            empty="Nothing is running low."
            items={low.map((p) => ({
              href: `/admin/products/${p.id}`,
              left: p.name,
              right: `${formatNumber(p.quantity)} ${p.unit}`,
            }))}
          />
        </section>
        <section className="card p-4">
          <h2 className="flex items-center gap-2 font-semibold">
            <CircleX className="size-4 text-out" aria-hidden />
            Out of stock
          </h2>
          <List
            empty="Everything is in stock."
            items={out.map((p) => ({ href: `/admin/products/${p.id}`, left: p.name, right: "0" }))}
          />
        </section>
      </div>

      <section className="card p-4">
        <h2 className="flex items-center gap-2 font-semibold">
          <History className="size-4 text-muted" aria-hidden />
          Recent stock changes
        </h2>
        <List
          empty="No stock changes yet."
          items={recent.map((m) => ({
            href: `/admin/products/${m.productId}`,
            left: `${m.productName} · ${m.reason}`,
            sub: `${m.adminEmail} · ${m.createdAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Addis_Ababa" })}`,
            right: `${m.delta > 0 ? "+" : ""}${formatNumber(m.delta)} → ${formatNumber(m.quantityAfter)}`,
          }))}
        />
      </section>
    </div>
  );
}

function Stat({
  Icon,
  label,
  value,
  tone,
}: {
  Icon: LucideIcon;
  label: string;
  value: string;
  tone?: "low" | "out";
}) {
  const color = tone === "low" ? "text-low" : tone === "out" ? "text-out" : "";
  return (
    <div className="card p-4">
      <p className="flex items-center gap-1.5 text-sm text-muted">
        <Icon className={`size-4 ${color}`} aria-hidden />
        {label}
      </p>
      <p className={`mt-1 text-2xl font-semibold ${color}`}>{value}</p>
    </div>
  );
}

function List({
  items,
  empty,
}: {
  items: { href: string; left: string; right: string; sub?: string }[];
  empty: string;
}) {
  if (items.length === 0) return <p className="mt-3 text-sm text-muted">{empty}</p>;
  return (
    <ul className="mt-2 divide-y divide-border">
      {items.map((i, idx) => (
        <li key={idx}>
          <Link href={i.href} className="flex items-center justify-between gap-3 py-2.5 hover:text-brand">
            <span className="min-w-0">
              <span className="block truncate text-sm">{i.left}</span>
              {i.sub && <span className="block truncate text-xs text-muted">{i.sub}</span>}
            </span>
            <span className="shrink-0 text-sm font-medium tabular-nums">{i.right}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
