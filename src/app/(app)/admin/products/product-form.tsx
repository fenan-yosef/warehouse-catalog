"use client";

import { useActionState } from "react";
import { Plus, Save } from "lucide-react";
import type { Category, Product } from "@/db/schema";
import { createProduct, updateProduct, type FormState } from "../actions";
import { FormMessage } from "../form-message";
import { TranslationFields } from "../translation-fields";

const UNITS = ["pcs", "carton", "set", "pair", "box", "pack", "roll", "kg", "meter", "dozen"];

export function ProductForm({
  product,
  categories,
}: {
  product?: Product;
  categories: Category[];
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(
    product ? updateProduct : createProduct,
    undefined,
  );

  return (
    <form action={action} className="card space-y-4 p-4 sm:p-6">
      {product && <input type="hidden" name="id" value={product.id} />}

      <div>
        <label className="label" htmlFor="name">Product name</label>
        <input id="name" name="name" required defaultValue={product?.name} className="input" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="categoryId">Category</label>
          <select id="categoryId" name="categoryId" defaultValue={product?.categoryId ?? ""} className="input">
            <option value="">No category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="unit">Sold by (unit)</label>
          <input id="unit" name="unit" list="units" defaultValue={product?.unit ?? "pcs"} className="input" />
          <datalist id="units">
            {UNITS.map((u) => <option key={u} value={u} />)}
          </datalist>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="priceEtb">Price (ETB, optional)</label>
          <input
            id="priceEtb"
            name="priceEtb"
            type="number"
            inputMode="numeric"
            min={0}
            defaultValue={product?.priceEtb ?? ""}
            className="input"
          />
          <p className="mt-1 text-xs text-muted">Only shown if prices are turned on in Settings.</p>
        </div>
        <div>
          <label className="label" htmlFor="minOrderQty">Minimum order</label>
          <input
            id="minOrderQty"
            name="minOrderQty"
            type="number"
            inputMode="numeric"
            min={1}
            defaultValue={product?.minOrderQty ?? 1}
            className="input"
          />
        </div>
        {!product && (
          <div>
            <label className="label" htmlFor="quantity">Starting stock</label>
            <input id="quantity" name="quantity" type="number" inputMode="numeric" min={0} defaultValue={0} className="input" />
          </div>
        )}
      </div>

      <div>
        <label className="label" htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          rows={5}
          defaultValue={product?.description}
          placeholder="Size, material, colours, what's in a carton…"
          className="input"
        />
      </div>

      <TranslationFields
        values={product?.i18n}
        fields={[
          { key: "name", label: "Product name" },
          { key: "description", label: "Description", multiline: true },
        ]}
      />

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isPublished" defaultChecked={product?.isPublished ?? true} className="size-4 accent-brand" />
          Show on website
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isFeatured" defaultChecked={product?.isFeatured ?? false} className="size-4 accent-brand" />
          Feature on home page
        </label>
      </div>

      <FormMessage state={state} />
      <button disabled={pending} className="btn-primary w-full sm:w-auto">
        {product ? <Save className="size-4" aria-hidden /> : <Plus className="size-4" aria-hidden />}
        {pending ? "Saving…" : product ? "Save changes" : "Create product"}
      </button>
    </form>
  );
}
