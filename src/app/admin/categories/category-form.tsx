"use client";

import { useActionState, useState } from "react";
import { Plus, Save } from "lucide-react";
import type { Category } from "@/db/schema";
import { CATEGORY_ICONS, guessCategoryIcon, type CategoryIconKey } from "@/lib/category-icons";
import { saveCategory, type FormState } from "../actions";
import { FormMessage } from "../form-message";

export function CategoryForm({ category }: { category?: Category }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveCategory, undefined);
  const [picked, setPicked] = useState<CategoryIconKey | null>(
    category?.icon && category.icon in CATEGORY_ICONS ? (category.icon as CategoryIconKey) : null,
  );
  const [name, setName] = useState(category?.name ?? "");
  // Until the admin picks one, follow the name (e.g. "Fittings" → wrench).
  const current = picked ?? guessCategoryIcon(name);

  return (
    <form action={action} className={`space-y-3 ${category ? "" : "card p-4"}`}>
      {category && <input type="hidden" name="id" value={category.id} />}
      <input type="hidden" name="icon" value={current} />
      <div className="grid gap-3 sm:grid-cols-[1fr_8rem]">
        <div>
          <label className="label">Name</label>
          <input
            name="name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
          />
        </div>
        <div>
          <label className="label">Order</label>
          <input
            name="sortOrder"
            type="number"
            inputMode="numeric"
            min={0}
            defaultValue={category?.sortOrder ?? 0}
            className="input"
          />
        </div>
      </div>
      <div>
        <label className="label">Short description (optional)</label>
        <input name="description" defaultValue={category?.description} className="input" />
      </div>
      <fieldset>
        <legend className="label">Icon</legend>
        <div className="grid grid-cols-8 gap-1.5 sm:grid-cols-[repeat(16,minmax(0,1fr))]">
          {(Object.entries(CATEGORY_ICONS) as [CategoryIconKey, (typeof CATEGORY_ICONS)[CategoryIconKey]][]).map(
            ([key, { label, Icon }]) => (
              <button
                key={key}
                type="button"
                title={label}
                aria-label={label}
                aria-pressed={current === key}
                onClick={() => setPicked(key)}
                className={`flex aspect-square items-center justify-center rounded-lg border transition-colors ${
                  current === key
                    ? "border-brand bg-brand text-white"
                    : "border-border bg-surface text-muted hover:border-brand hover:text-brand"
                }`}
              >
                <Icon className="size-4.5" aria-hidden />
              </button>
            ),
          )}
        </div>
        <p className="mt-1 text-xs text-muted">{CATEGORY_ICONS[current].label}</p>
      </fieldset>
      <FormMessage state={state} />
      <button disabled={pending} className="btn-primary">
        {category ? <Save className="size-4" aria-hidden /> : <Plus className="size-4" aria-hidden />}
        {pending ? "Saving…" : category ? "Save" : "Add category"}
      </button>
    </form>
  );
}
