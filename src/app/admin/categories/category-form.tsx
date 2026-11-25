"use client";

import { useActionState } from "react";
import type { Category } from "@/db/schema";
import { saveCategory, type FormState } from "../actions";
import { FormMessage } from "../form-message";

export function CategoryForm({ category }: { category?: Category }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveCategory, undefined);
  return (
    <form action={action} className={`space-y-3 ${category ? "" : "card p-4"}`}>
      {category && <input type="hidden" name="id" value={category.id} />}
      <div className="grid gap-3 sm:grid-cols-[1fr_8rem]">
        <div>
          <label className="label">Name</label>
          <input name="name" required defaultValue={category?.name} className="input" />
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
      <FormMessage state={state} />
      <button disabled={pending} className="btn-primary">
        {pending ? "Saving…" : category ? "Save" : "Add category"}
      </button>
    </form>
  );
}
