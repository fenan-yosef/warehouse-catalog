import { asc, count, eq } from "drizzle-orm";
import { Pencil, Trash2 } from "lucide-react";
import { db } from "@/db";
import { categoryIcon } from "@/lib/category-icons";
import { categories, products } from "@/db/schema";
import { requireAdminPage } from "@/lib/admin";
import { deleteCategory } from "../actions";
import { ConfirmButton } from "../confirm-button";
import { CategoryForm } from "./category-form";

export default async function CategoriesPage() {
  await requireAdminPage();
  const rows = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
      description: categories.description,
      sortOrder: categories.sortOrder,
      icon: categories.icon,
      i18n: categories.i18n,
      createdAt: categories.createdAt,
      productCount: count(products.id),
    })
    .from(categories)
    .leftJoin(products, eq(products.categoryId, categories.id))
    .groupBy(categories.id)
    .orderBy(asc(categories.sortOrder), asc(categories.name));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Categories</h1>

      <section>
        <h2 className="mb-2 font-semibold">Add a category</h2>
        <CategoryForm />
      </section>

      <section className="space-y-2">
        <h2 className="font-semibold">All categories</h2>
        {rows.length === 0 && <p className="text-sm text-muted">No categories yet.</p>}
        {rows.map((c) => {
          const Icon = categoryIcon(c.icon, c.name);
          return (
          <details key={c.id} className="card group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4">
              <span className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-lg bg-brand-soft text-brand">
                  <Icon className="size-4.5" aria-hidden />
                </span>
                <span>
                  <span className="font-medium">{c.name}</span>
                  <span className="ml-2 text-sm text-muted">{c.productCount} products</span>
                </span>
              </span>
              <span className="flex items-center gap-1 text-sm text-brand group-open:hidden">
                <Pencil className="size-3.5" aria-hidden />
                Edit
              </span>
            </summary>
            <div className="space-y-3 border-t border-border p-4">
              <CategoryForm category={c} />
              <form action={deleteCategory}>
                <input type="hidden" name="id" value={c.id} />
                <ConfirmButton
                  message={`Delete “${c.name}”? Its products stay, but lose their category.`}
                  className="btn-danger"
                >
                  <Trash2 className="size-4" aria-hidden />
                  Delete category
                </ConfirmButton>
              </form>
            </div>
          </details>
          );
        })}
      </section>
    </div>
  );
}
