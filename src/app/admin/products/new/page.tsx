import Link from "next/link";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { categories } from "@/db/schema";
import { requireAdminPage } from "@/lib/admin";
import { ProductForm } from "../product-form";

export default async function NewProductPage() {
  await requireAdminPage();
  const cats = await db.select().from(categories).orderBy(asc(categories.sortOrder), asc(categories.name));
  return (
    <div className="space-y-4">
      <Link href="/admin/products" className="text-sm text-muted hover:text-brand">← Products</Link>
      <h1 className="text-2xl font-semibold">Add product</h1>
      <p className="text-sm text-muted">You can add photos after creating the product.</p>
      <ProductForm categories={cats} />
    </div>
  );
}
