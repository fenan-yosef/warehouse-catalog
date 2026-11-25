CREATE TABLE "admins" (
	"email" text PRIMARY KEY NOT NULL,
	"name" text DEFAULT '' NOT NULL,
	"added_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_images" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"url" text NOT NULL,
	"storage_key" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"category_id" integer,
	"description" text DEFAULT '' NOT NULL,
	"unit" text DEFAULT 'pcs' NOT NULL,
	"min_order_qty" integer DEFAULT 1 NOT NULL,
	"price_etb" integer,
	"quantity" integer DEFAULT 0 NOT NULL,
	"is_published" boolean DEFAULT true NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"business_name" text DEFAULT 'Tufte General Trading Works PLC' NOT NULL,
	"tagline" text DEFAULT 'Importer of metals and sanitary materials' NOT NULL,
	"about_text" text DEFAULT '' NOT NULL,
	"hero_image_url" text,
	"warehouse_address" text DEFAULT 'Ashewa Meda, Addis Ababa, Ethiopia' NOT NULL,
	"map_lat" double precision,
	"map_lng" double precision,
	"opening_hours" text DEFAULT 'Mon–Sat, 8:30 AM – 6:00 PM' NOT NULL,
	"phones" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"telegram_username" text,
	"whatsapp_number" text,
	"email" text,
	"show_phone" boolean DEFAULT true NOT NULL,
	"show_telegram" boolean DEFAULT true NOT NULL,
	"show_whatsapp" boolean DEFAULT false NOT NULL,
	"show_prices" boolean DEFAULT false NOT NULL,
	"price_fallback_text" text DEFAULT 'Call for price' NOT NULL,
	"stock_display" text DEFAULT 'status' NOT NULL,
	"low_stock_threshold" integer DEFAULT 20 NOT NULL,
	"show_out_of_stock" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stock_movements" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"delta" integer NOT NULL,
	"quantity_after" integer NOT NULL,
	"reason" text NOT NULL,
	"note" text,
	"admin_email" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "categories_slug_idx" ON "categories" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "product_images_product_idx" ON "product_images" USING btree ("product_id");--> statement-breakpoint
CREATE UNIQUE INDEX "products_slug_idx" ON "products" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "products_category_idx" ON "products" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "stock_movements_product_idx" ON "stock_movements" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "stock_movements_created_idx" ON "stock_movements" USING btree ("created_at");