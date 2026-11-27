ALTER TABLE "categories" ADD COLUMN "i18n" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "i18n" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "facebook_url" text;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "tiktok_url" text;--> statement-breakpoint
ALTER TABLE "settings" ADD COLUMN "i18n" jsonb DEFAULT '{}'::jsonb NOT NULL;