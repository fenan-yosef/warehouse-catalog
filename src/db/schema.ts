import {
  boolean,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const STOCK_DISPLAY = ["exact", "status", "hidden"] as const;
export type StockDisplay = (typeof STOCK_DISPLAY)[number];

export const MOVEMENT_REASONS = ["arrival", "sale", "adjustment", "correction"] as const;
export type MovementReason = (typeof MOVEMENT_REASONS)[number];

/** Languages with optional translations. English lives in the normal columns. */
export const TRANSLATED_LANGS = ["am", "om"] as const;
export type TranslatedLang = (typeof TRANSLATED_LANGS)[number];
type Translations<F extends string> = Partial<Record<TranslatedLang, Partial<Record<F, string>>>>;

export const PRODUCT_I18N_FIELDS = ["name", "description"] as const;
export const CATEGORY_I18N_FIELDS = ["name", "description"] as const;
export const SETTINGS_I18N_FIELDS = [
  "tagline",
  "aboutText",
  "priceFallbackText",
  "warehouseAddress",
  "openingHours",
] as const;
export type ProductI18n = Translations<(typeof PRODUCT_I18N_FIELDS)[number]>;
export type CategoryI18n = Translations<(typeof CATEGORY_I18N_FIELDS)[number]>;
export type SettingsI18n = Translations<(typeof SETTINGS_I18N_FIELDS)[number]>;

/**
 * Site-wide settings. Always exactly one row (id = 1).
 * The "display rules" columns are the business decisions that are still open;
 * the admin can flip them without a code change.
 */
export const settings = pgTable("settings", {
  id: integer("id").primaryKey().default(1),

  // Business info
  businessName: text("business_name").notNull().default("Tufte General Trading Works PLC"),
  tagline: text("tagline").notNull().default("Importer of metals and sanitary materials"),
  aboutText: text("about_text").notNull().default(""),
  heroImageUrl: text("hero_image_url"),
  warehouseAddress: text("warehouse_address").notNull().default("Ashewa Meda, Addis Ababa, Ethiopia"),
  mapLat: doublePrecision("map_lat"),
  mapLng: doublePrecision("map_lng"),
  openingHours: text("opening_hours").notNull().default("Mon–Sat, 8:30 AM – 6:00 PM"),

  // Contact
  phones: jsonb("phones").$type<string[]>().notNull().default([]),
  telegramUsername: text("telegram_username"),
  whatsappNumber: text("whatsapp_number"),
  email: text("email"),
  showPhone: boolean("show_phone").notNull().default(true),
  showTelegram: boolean("show_telegram").notNull().default(true),
  showWhatsapp: boolean("show_whatsapp").notNull().default(false),

  // Display rules (the open decisions)
  showPrices: boolean("show_prices").notNull().default(false),
  priceFallbackText: text("price_fallback_text").notNull().default("Call for price"),
  stockDisplay: text("stock_display", { enum: STOCK_DISPLAY }).notNull().default("status"),
  lowStockThreshold: integer("low_stock_threshold").notNull().default(20),
  showOutOfStock: boolean("show_out_of_stock").notNull().default(true),

  // Social profiles (shown in the footer and used for search-engine "sameAs" links)
  facebookUrl: text("facebook_url"),
  tiktokUrl: text("tiktok_url"),

  /** Amharic / Afaan Oromo versions of the text fields; English is the fallback. */
  i18n: jsonb("i18n").$type<SettingsI18n>().notNull().default({}),

  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const categories = pgTable(
  "categories",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description").notNull().default(""),
    /** Key from CATEGORY_ICONS; null = guess from the name. */
    icon: text("icon"),
    sortOrder: integer("sort_order").notNull().default(0),
    i18n: jsonb("i18n").$type<CategoryI18n>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("categories_slug_idx").on(t.slug)],
);

export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    categoryId: integer("category_id").references(() => categories.id, { onDelete: "set null" }),
    description: text("description").notNull().default(""),
    unit: text("unit").notNull().default("pcs"),
    minOrderQty: integer("min_order_qty").notNull().default(1),
    /** Whole Ethiopian Birr. Null = no price set. */
    priceEtb: integer("price_etb"),
    quantity: integer("quantity").notNull().default(0),
    isPublished: boolean("is_published").notNull().default(true),
    isFeatured: boolean("is_featured").notNull().default(false),
    i18n: jsonb("i18n").$type<ProductI18n>().notNull().default({}),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex("products_slug_idx").on(t.slug),
    index("products_category_idx").on(t.categoryId),
  ],
);

export const productImages = pgTable(
  "product_images",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    storageKey: text("storage_key").notNull(),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("product_images_product_idx").on(t.productId)],
);

export const stockMovements = pgTable(
  "stock_movements",
  {
    id: serial("id").primaryKey(),
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    delta: integer("delta").notNull(),
    quantityAfter: integer("quantity_after").notNull(),
    reason: text("reason", { enum: MOVEMENT_REASONS }).notNull(),
    note: text("note"),
    adminEmail: text("admin_email").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("stock_movements_product_idx").on(t.productId),
    index("stock_movements_created_idx").on(t.createdAt),
  ],
);

/**
 * Staff allowed into the admin panel. Owners are configured with the
 * ADMIN_OWNER_EMAILS env var, so the panel can never be locked out.
 */
export const admins = pgTable("admins", {
  email: text("email").primaryKey(),
  name: text("name").notNull().default(""),
  addedBy: text("added_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, { fields: [products.categoryId], references: [categories.id] }),
  images: many(productImages),
  movements: many(stockMovements),
}));

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, { fields: [productImages.productId], references: [products.id] }),
}));

export const stockMovementsRelations = relations(stockMovements, ({ one }) => ({
  product: one(products, { fields: [stockMovements.productId], references: [products.id] }),
}));

export type Settings = typeof settings.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type Product = typeof products.$inferSelect;
export type ProductImage = typeof productImages.$inferSelect;
export type StockMovement = typeof stockMovements.$inferSelect;
