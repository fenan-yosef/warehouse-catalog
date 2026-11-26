/**
 * Business settings plus placeholder products so the site looks real before the family adds their own.
 * Safe to re-run: it only inserts what's missing.
 *
 *   npm run db:seed
 */
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../src/db/schema";
import { slugify } from "../src/lib/display";
import { pgConnectionString } from "../src/db/url";

config({ path: ".env.local" });

const pool = new Pool({
  connectionString: pgConnectionString(process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL),
});
const db = drizzle({ client: pool, schema });

// Categories as given by the business (product lines / brands).
const CATEGORIES = [
  { name: "Golden Dragon", icon: "award", description: "Golden Dragon brand products" },
  { name: "Turkish", icon: "globe", description: "Products imported from Turkey" },
  { name: "Fittings", icon: "wrench", description: "Pipe fittings: elbows, tees, couplings, unions, valves" },
  { name: "Parkings", icon: "ring", description: "" },
];

// PLACEHOLDER products so the site doesn't look empty. Replace them from the admin panel.
const PRODUCTS: Array<{
  name: string;
  category: string;
  unit: string;
  qty: number;
  price: number;
  min?: number;
  featured?: boolean;
  description: string;
}> = [
  { name: "Copper Pipe 15mm (sample)", category: "Golden Dragon", unit: "meter", qty: 1200, price: 420, min: 50, featured: true, description: "Placeholder product. Replace with real details." },
  { name: "Copper Pipe 22mm (sample)", category: "Golden Dragon", unit: "meter", qty: 640, price: 610, min: 50, description: "Placeholder product. Replace with real details." },
  { name: "Brass Ball Valve 1/2\" (sample)", category: "Golden Dragon", unit: "pcs", qty: 15, price: 380, min: 10, featured: true, description: "Placeholder product. Replace with real details." },
  { name: "Kitchen Mixer Tap (sample)", category: "Turkish", unit: "pcs", qty: 85, price: 3200, featured: true, description: "Placeholder product. Replace with real details." },
  { name: "Shower Set with Rail (sample)", category: "Turkish", unit: "set", qty: 40, price: 4800, featured: true, description: "Placeholder product. Replace with real details." },
  { name: "Basin Tap Chrome (sample)", category: "Turkish", unit: "pcs", qty: 0, price: 1900, description: "Placeholder product. Replace with real details." },
  { name: "PPR Elbow 90° 25mm (sample)", category: "Fittings", unit: "pcs", qty: 5000, price: 18, min: 100, featured: true, description: "Placeholder product. Replace with real details." },
  { name: "PPR Tee 32mm (sample)", category: "Fittings", unit: "pcs", qty: 2400, price: 35, min: 100, description: "Placeholder product. Replace with real details." },
  { name: "Galvanized Union 1\" (sample)", category: "Fittings", unit: "pcs", qty: 18, price: 150, min: 20, description: "Placeholder product. Replace with real details." },
  { name: "Rubber Gasket Set (sample)", category: "Parkings", unit: "box", qty: 300, price: 260, min: 5, description: "Placeholder product. Replace with real details." },
];

async function main() {
  await db
    .insert(schema.settings)
    .values({
      id: 1,
      businessName: "Tufte General Trading Works PLC",
      tagline: "Importer of metals and sanitary materials",
    })
    .onConflictDoNothing();

  for (const [i, c] of CATEGORIES.entries()) {
    await db
      .insert(schema.categories)
      .values({ ...c, slug: slugify(c.name), sortOrder: i })
      .onConflictDoNothing({ target: schema.categories.slug });
  }
  const cats = await db.select().from(schema.categories);
  const catId = new Map(cats.map((c) => [c.name, c.id]));

  let added = 0;
  for (const p of PRODUCTS) {
    const [row] = await db
      .insert(schema.products)
      .values({
        name: p.name,
        slug: slugify(p.name),
        categoryId: catId.get(p.category) ?? null,
        description: p.description,
        unit: p.unit,
        minOrderQty: p.min ?? 1,
        priceEtb: p.price,
        quantity: p.qty,
        isFeatured: p.featured ?? false,
      })
      .onConflictDoNothing({ target: schema.products.slug })
      .returning({ id: schema.products.id });
    if (row && p.qty > 0) {
      await db.insert(schema.stockMovements).values({
        productId: row.id,
        delta: p.qty,
        quantityAfter: p.qty,
        reason: "arrival",
        note: "Demo data",
        adminEmail: "seed",
      });
    }
    if (row) added++;
  }

  console.log(`Seed done: settings ok, ${cats.length} categories, ${added} new products.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
