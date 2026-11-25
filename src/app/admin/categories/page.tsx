import { asc, count, eq } from "drizzle-orm";
import { db } from "@/db";
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
        {rows.map((c) => (
          <details key={c.id} className="card group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4">
              <span>
                <span className="font-medium">{c.name}</span>
                <span className="ml-2 text-sm text-muted">{c.productCount} products</span>
              </span>
              <span className="text-sm text-brand group-open:hidden">Edit</span>
            </summary>
            <div className="space-y-3 border-t border-border p-4">
              <CategoryForm category={c} />
              <form action={deleteCategory}>
                <input type="hidden" name="id" value={c.id} />
                <ConfirmButton
                  message={`Delete “${c.name}”? Its products stay, but lose their category.`}
                  className="btn-danger"
                >
                  Delete category
                </ConfirmButton>
              </form>
            </div>
          </details>
        ))}
      </section>
    </div>
  );
}
