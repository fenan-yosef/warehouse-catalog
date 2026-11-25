import { defineConfig } from "@neon/config/v1";

// Every branch gets Postgres. On top of that:
// - auth: Managed Better Auth for the admin panel login
// - product-images: public_read bucket for product photos (anonymous reads, signed writes)
export default defineConfig({
  auth: true,
  buckets: {
    "product-images": { access: "public_read" },
  },
});
