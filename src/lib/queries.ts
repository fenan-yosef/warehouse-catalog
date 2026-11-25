import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { and, asc, desc, eq, gt, ilike, inArray, or, type SQL } from "drizzle-orm";
import { db } from "@/db";
import { categories, productImages, products, settings, type Settings } from "@/db/schema";

/** Cache tags. Admin mutations call updateTag() with these. */
export const TAGS = {
  settings: "settings",
  catalog: "catalog",
} as const;

export const DEFAULT_SETTINGS: Settings = {
  id: 1,
  businessName: "Tufte General Trading Works PLC",
  tagline: "Importer of metals and sanitary materials",
  aboutText: "",
  heroImageUrl: null,
  warehouseAddress: "Ashewa Meda, Addis Ababa, Ethiopia",
  mapLat: null,
  mapLng: null,
  openingHours: "Mon–Sat, 8:30 AM – 6:00 PM",
  phones: [],
  telegramUsername: null,
  whatsappNumber: null,
  email: null,
  showPhone: true,
  showTelegram: true,
  showWhatsapp: false,
  showPrices: false,
  priceFallbackText: "Call for price",
  stockDisplay: "status",
  lowStockThreshold: 20,
  showOutOfStock: true,
  updatedAt: new Date(0),
};

export async function getSettings(): Promise<Settings> {
  "use cache";
  cacheTag(TAGS.settings);
  cacheLife("days");
  const row = await db.query.settings.findFirst({ where: eq(settings.id, 1) });
  return row ?? DEFAULT_SETTINGS;
}

export async function getCategories() {
  "use cache";
  cacheTag(TAGS.catalog);
  cacheLife("days");
  return db.select().from(categories).orderBy(asc(categories.sortOrder), asc(categories.name));
}

const publicProductColumns = {
  id: products.id,
  name: products.name,
  slug: products.slug,
  unit: products.unit,
  priceEtb: products.priceEtb,
  quantity: products.quantity,
  categoryId: products.categoryId,
} as const;

export type PublicProduct = Awaited<ReturnType<typeof getPublicProducts>>[number];

/** Published products for the catalog grid, with their first image. */
export async function getPublicProducts(opts: {
  categorySlug?: string;
  q?: string;
  featuredOnly?: boolean;
  includeOutOfStock: boolean;
  limit?: number;
}) {
  "use cache";
  cacheTag(TAGS.catalog);
  cacheLife("days");

  const where: SQL[] = [eq(products.isPublished, true)];
  if (!opts.includeOutOfStock) where.push(gt(products.quantity, 0));
  if (opts.featuredOnly) where.push(eq(products.isFeatured, true));
  if (opts.categorySlug) {
    const cat = await db.query.categories.findFirst({
      where: eq(categories.slug, opts.categorySlug),
      columns: { id: true },
    });
    if (!cat) return [];
    where.push(eq(products.categoryId, cat.id));
  }
  if (opts.q) {
    const term = `%${opts.q.replace(/[%_]/g, "")}%`;
    where.push(or(ilike(products.name, term), ilike(products.description, term))!);
  }

  const rows = await db
    .select(publicProductColumns)
    .from(products)
    .where(and(...where))
    .orderBy(desc(products.isFeatured), asc(products.name))
    .limit(opts.limit ?? 200);

  if (rows.length === 0) return [];

  // First image per product, in one query.
  const images = await db
    .selectDistinctOn([productImages.productId], {
      productId: productImages.productId,
      url: productImages.url,
    })
    .from(productImages)
    .where(inArray(productImages.productId, rows.map((r) => r.id)))
    .orderBy(productImages.productId, asc(productImages.sortOrder), asc(productImages.id));
  const imageByProduct = new Map(images.map((i) => [i.productId, i.url]));

  return rows.map((r) => ({ ...r, imageUrl: imageByProduct.get(r.id) ?? null }));
}

export async function getPublicProductBySlug(slug: string) {
  "use cache";
  cacheTag(TAGS.catalog);
  cacheLife("days");
  const product = await db.query.products.findFirst({
    where: and(eq(products.slug, slug), eq(products.isPublished, true)),
    with: {
      category: { columns: { name: true, slug: true } },
      images: { orderBy: [asc(productImages.sortOrder), asc(productImages.id)] },
    },
  });
  return product ?? null;
}
