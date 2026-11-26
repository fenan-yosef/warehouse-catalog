"use server";

import { and, eq, gte, max, sql } from "drizzle-orm";
import { refresh, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/db";
import {
  admins,
  categories,
  MOVEMENT_REASONS,
  productImages,
  products,
  settings,
  STOCK_DISPLAY,
  stockMovements,
} from "@/db/schema";
import { requireAdmin } from "@/lib/admin";
import { CATEGORY_ICONS } from "@/lib/category-icons";
import { slugify } from "@/lib/display";
import { TAGS } from "@/lib/queries";
import { deleteObject, putObject } from "@/lib/storage";

export type FormState = { ok?: boolean; error?: string; message?: string } | undefined;

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const bool = (fd: FormData, k: string) => fd.get(k) === "on" || fd.get(k) === "true";

function refreshCatalog() {
  updateTag(TAGS.catalog);
}

async function uniqueSlug(table: typeof products | typeof categories, base: string, exceptId?: number) {
  const root = slugify(base);
  let slug = root;
  for (let i = 2; ; i++) {
    const hit = await db
      .select({ id: table.id })
      .from(table)
      .where(eq(table.slug, slug))
      .limit(1);
    if (hit.length === 0 || hit[0].id === exceptId) return slug;
    slug = `${root}-${i}`;
  }
}

// ---------- Stock ----------

const stockSchema = z.object({
  productId: z.coerce.number().int().positive(),
  direction: z.enum(["in", "out", "set"]),
  amount: z.coerce.number().int().min(0).max(1_000_000),
  reason: z.enum(MOVEMENT_REASONS).optional(),
  note: z.string().max(300).optional(),
});

/**
 * Changes stock and records a movement in one transaction.
 * "in" = goods arrived, "out" = sold, "set" = counted/corrected to an exact number.
 */
export async function adjustStock(_prev: FormState, fd: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const parsed = stockSchema.safeParse({
    productId: fd.get("productId"),
    direction: fd.get("direction"),
    amount: fd.get("amount"),
    reason: fd.get("reason") || undefined,
    note: str(fd, "note") || undefined,
  });
  if (!parsed.success) return { error: "Enter a valid amount." };
  const { productId, direction, amount, note } = parsed.data;
  if (direction !== "set" && amount === 0) return { error: "Amount must be more than 0." };

  try {
    const after = await db.transaction(async (tx) => {
      const [current] = await tx
        .select({ quantity: products.quantity })
        .from(products)
        .where(eq(products.id, productId))
        .for("update");
      if (!current) throw new Error("Product not found.");

      const delta =
        direction === "in" ? amount : direction === "out" ? -amount : amount - current.quantity;
      const quantityAfter = current.quantity + delta;
      if (quantityAfter < 0) throw new Error(`Only ${current.quantity} in stock.`);
      if (delta === 0) return quantityAfter;

      await tx
        .update(products)
        .set({ quantity: quantityAfter, updatedAt: new Date() })
        .where(and(eq(products.id, productId), gte(sql`${products.quantity} + ${delta}`, 0)));
      await tx.insert(stockMovements).values({
        productId,
        delta,
        quantityAfter,
        reason:
          parsed.data.reason ??
          (direction === "in" ? "arrival" : direction === "out" ? "sale" : "correction"),
        note: note ?? null,
        adminEmail: admin.email,
      });
      return quantityAfter;
    });
    refreshCatalog();
    return { ok: true, message: `Stock is now ${after}.` };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not update stock." };
  }
}

// ---------- Products ----------

const productSchema = z.object({
  name: z.string().min(2, "Name is required").max(160),
  categoryId: z.coerce.number().int().positive().nullable(),
  description: z.string().max(5000),
  unit: z.string().min(1).max(30),
  minOrderQty: z.coerce.number().int().min(1).max(1_000_000),
  priceEtb: z.coerce.number().int().min(0).max(1_000_000_000).nullable(),
  isPublished: z.boolean(),
  isFeatured: z.boolean(),
});

function readProduct(fd: FormData) {
  return productSchema.safeParse({
    name: str(fd, "name"),
    categoryId: str(fd, "categoryId") || null,
    description: str(fd, "description"),
    unit: str(fd, "unit") || "pcs",
    minOrderQty: str(fd, "minOrderQty") || 1,
    priceEtb: str(fd, "priceEtb") || null,
    isPublished: bool(fd, "isPublished"),
    isFeatured: bool(fd, "isFeatured"),
  });
}

export async function createProduct(_prev: FormState, fd: FormData): Promise<FormState> {
  const admin = await requireAdmin();
  const parsed = readProduct(fd);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid product." };

  const initialQty = Math.max(0, Math.floor(Number(str(fd, "quantity") || 0)) || 0);
  const slug = await uniqueSlug(products, parsed.data.name);

  const id = await db.transaction(async (tx) => {
    const [row] = await tx
      .insert(products)
      .values({ ...parsed.data, slug, quantity: initialQty })
      .returning({ id: products.id });
    if (initialQty > 0) {
      await tx.insert(stockMovements).values({
        productId: row.id,
        delta: initialQty,
        quantityAfter: initialQty,
        reason: "arrival",
        note: "Initial stock",
        adminEmail: admin.email,
      });
    }
    return row.id;
  });

  refreshCatalog();
  redirect(`/admin/products/${id}?created=1`);
}

export async function updateProduct(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const id = Number(fd.get("id"));
  if (!Number.isInteger(id)) return { error: "Missing product." };
  const parsed = readProduct(fd);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid product." };

  const slug = await uniqueSlug(products, parsed.data.name, id);
  await db
    .update(products)
    .set({ ...parsed.data, slug, updatedAt: new Date() })
    .where(eq(products.id, id));
  refreshCatalog();
  return { ok: true, message: "Saved." };
}

export async function deleteProduct(fd: FormData) {
  await requireAdmin();
  const id = Number(fd.get("id"));
  const imgs = await db
    .select({ key: productImages.storageKey })
    .from(productImages)
    .where(eq(productImages.productId, id));
  await db.delete(products).where(eq(products.id, id));
  await Promise.allSettled(imgs.map((i) => deleteObject(i.key)));
  refreshCatalog();
  redirect("/admin/products");
}

// ---------- Images ----------

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function uploadProductImages(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const productId = Number(fd.get("productId"));
  const files = fd.getAll("images").filter((f): f is File => f instanceof File && f.size > 0);
  if (!Number.isInteger(productId) || files.length === 0) return { error: "Choose at least one photo." };

  for (const f of files) {
    if (!IMAGE_TYPES.includes(f.type)) return { error: `${f.name}: use JPG, PNG or WebP.` };
    if (f.size > MAX_IMAGE_BYTES) return { error: `${f.name} is too large (max 4 MB).` };
  }

  const [{ top }] = await db
    .select({ top: max(productImages.sortOrder) })
    .from(productImages)
    .where(eq(productImages.productId, productId));
  let order = (top ?? -1) + 1;

  let done = 0;
  for (const f of files) {
    const ext = f.type === "image/png" ? "png" : f.type === "image/webp" ? "webp" : "jpg";
    const key = `products/${productId}/${crypto.randomUUID()}.${ext}`;
    try {
      const url = await putObject(key, new Uint8Array(await f.arrayBuffer()), f.type);
      await db.insert(productImages).values({ productId, url, storageKey: key, sortOrder: order++ });
      done++;
    } catch (e) {
      console.error("Photo upload failed", e);
      refreshCatalog();
      return {
        error: `${done ? `${done} photo${done > 1 ? "s" : ""} uploaded, but ` : ""}${f.name} could not be uploaded. Check your connection and try again.`,
      };
    }
  }

  refreshCatalog();
  return { ok: true, message: `${done} photo${done > 1 ? "s" : ""} uploaded.` };
}

export async function deleteProductImage(fd: FormData) {
  await requireAdmin();
  const id = Number(fd.get("imageId"));
  const [img] = await db.delete(productImages).where(eq(productImages.id, id)).returning();
  if (img) await deleteObject(img.storageKey).catch(() => {});
  refreshCatalog();
}

/** Makes this photo the main (first) one. */
export async function makeMainImage(fd: FormData) {
  await requireAdmin();
  const id = Number(fd.get("imageId"));
  const img = await db.query.productImages.findFirst({ where: eq(productImages.id, id) });
  if (!img) return;
  const [{ low }] = await db
    .select({ low: sql<number>`coalesce(min(${productImages.sortOrder}), 0)` })
    .from(productImages)
    .where(eq(productImages.productId, img.productId));
  await db
    .update(productImages)
    .set({ sortOrder: Number(low) - 1 })
    .where(eq(productImages.id, id));
  refreshCatalog();
}

// ---------- Categories ----------

const categorySchema = z.object({
  name: z.string().min(2, "Name is required").max(80),
  description: z.string().max(300),
  sortOrder: z.coerce.number().int().min(0).max(9999),
  icon: z
    .string()
    .refine((v) => v in CATEGORY_ICONS)
    .nullable(),
});

export async function saveCategory(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const id = Number(fd.get("id")) || undefined;
  const parsed = categorySchema.safeParse({
    name: str(fd, "name"),
    description: str(fd, "description"),
    sortOrder: str(fd, "sortOrder") || 0,
    icon: str(fd, "icon") || null,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid category." };

  const slug = await uniqueSlug(categories, parsed.data.name, id);
  if (id) await db.update(categories).set({ ...parsed.data, slug }).where(eq(categories.id, id));
  else await db.insert(categories).values({ ...parsed.data, slug });
  refreshCatalog();
  return { ok: true, message: id ? "Category saved." : "Category added." };
}

export async function deleteCategory(fd: FormData) {
  await requireAdmin();
  await db.delete(categories).where(eq(categories.id, Number(fd.get("id"))));
  refreshCatalog();
}

// ---------- Settings ----------

const optionalNumber = z
  .string()
  .transform((v) => (v.trim() === "" ? null : Number(v)))
  .pipe(z.number().finite().nullable());

const settingsSchema = z.object({
  businessName: z.string().min(1, "Business name is required").max(120),
  tagline: z.string().max(200),
  aboutText: z.string().max(5000),
  warehouseAddress: z.string().min(1, "Address is required").max(300),
  mapLat: optionalNumber.refine((v) => v == null || (v >= -90 && v <= 90), "Latitude must be between -90 and 90"),
  mapLng: optionalNumber.refine((v) => v == null || (v >= -180 && v <= 180), "Longitude must be between -180 and 180"),
  openingHours: z.string().max(200),
  phones: z.array(z.string().max(40)).max(5),
  telegramUsername: z.string().max(64).nullable(),
  whatsappNumber: z.string().max(40).nullable(),
  email: z.string().email("Invalid email").max(200).nullable(),
  showPhone: z.boolean(),
  showTelegram: z.boolean(),
  showWhatsapp: z.boolean(),
  showPrices: z.boolean(),
  priceFallbackText: z.string().min(1).max(60),
  stockDisplay: z.enum(STOCK_DISPLAY),
  lowStockThreshold: z.coerce.number().int().min(0).max(1_000_000),
  showOutOfStock: z.boolean(),
});

export async function saveSettings(_prev: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = settingsSchema.safeParse({
    businessName: str(fd, "businessName"),
    tagline: str(fd, "tagline"),
    aboutText: str(fd, "aboutText"),
    warehouseAddress: str(fd, "warehouseAddress"),
    mapLat: str(fd, "mapLat"),
    mapLng: str(fd, "mapLng"),
    openingHours: str(fd, "openingHours"),
    phones: str(fd, "phones")
      .split(/[\n,]/)
      .map((p) => p.trim())
      .filter(Boolean),
    telegramUsername: str(fd, "telegramUsername").replace(/^@/, "") || null,
    whatsappNumber: str(fd, "whatsappNumber") || null,
    email: str(fd, "email") || null,
    showPhone: bool(fd, "showPhone"),
    showTelegram: bool(fd, "showTelegram"),
    showWhatsapp: bool(fd, "showWhatsapp"),
    showPrices: bool(fd, "showPrices"),
    priceFallbackText: str(fd, "priceFallbackText") || "Call for price",
    stockDisplay: str(fd, "stockDisplay"),
    lowStockThreshold: str(fd, "lowStockThreshold") || 0,
    showOutOfStock: bool(fd, "showOutOfStock"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid settings." };

  await db
    .insert(settings)
    .values({ id: 1, ...parsed.data, updatedAt: new Date() })
    .onConflictDoUpdate({ target: settings.id, set: { ...parsed.data, updatedAt: new Date() } });
  updateTag(TAGS.settings);
  return { ok: true, message: "Settings saved. The public site is updated." };
}

// ---------- Team (owner only) ----------

export async function addAdmin(_prev: FormState, fd: FormData): Promise<FormState> {
  const owner = await requireAdmin("owner");
  const parsed = z
    .object({ email: z.string().email("Enter a valid email"), name: z.string().max(80) })
    .safeParse({ email: str(fd, "email").toLowerCase(), name: str(fd, "name") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  await db
    .insert(admins)
    .values({ ...parsed.data, addedBy: owner.email })
    .onConflictDoUpdate({ target: admins.email, set: { name: parsed.data.name } });
  return {
    ok: true,
    message: `${parsed.data.email} can now sign in at /auth/sign-in (first time: "Create password").`,
  };
}

export async function removeAdmin(fd: FormData) {
  await requireAdmin("owner");
  await db.delete(admins).where(eq(admins.email, String(fd.get("email"))));
  refresh();
}
