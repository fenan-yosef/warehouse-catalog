/**
 * Starter Amharic / Afaan Oromo text for settings and the four categories.
 * Only fills translations that are empty, and only where the English text is still the default,
 * so anything edited in the admin panel is never overwritten. Safe to re-run.
 *
 *   npx tsx scripts/seed-translations.ts
 */
import { config } from "dotenv";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../src/db/schema";
import { pgConnectionString } from "../src/db/url";

config({ path: ".env.local" });

const pool = new Pool({
  connectionString: pgConnectionString(process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL),
});
const db = drizzle({ client: pool, schema });

type Tr = Partial<Record<"am" | "om", Record<string, string>>>;

/** English default → translations. Matched on the English value so edited text is left alone. */
const SETTINGS: Record<string, { field: string; am: string; om: string }> = {
  "Importer of metals and sanitary materials": {
    field: "tagline",
    am: "የብረታ ብረት እና የሳኒተሪ እቃዎች አስመጪ",
    om: "Galchituu sibiilotaa fi meeshaalee saanitarii",
  },
  "Ashewa Meda, Addis Ababa, Ethiopia": {
    field: "warehouseAddress",
    am: "አሸዋ ሜዳ፣ አዲስ አበባ፣ ኢትዮጵያ",
    om: "Ashewa Meda, Finfinnee, Itoophiyaa",
  },
  "Mon–Sat, 8:30 AM – 6:00 PM": {
    field: "openingHours",
    am: "ሰኞ–ቅዳሜ፣ 8:30 AM – 6:00 PM",
    om: "Wiixata–Sanbata, 8:30 AM – 6:00 PM",
  },
  "Call for price": { field: "priceFallbackText", am: "ዋጋ ለማወቅ ይደውሉ", om: "Gatii beekuuf bilbilaa" },
};

const CATEGORIES: Record<string, Tr> = {
  "golden-dragon": {
    am: { name: "Golden Dragon (ጎልደን ድራገን)", description: "የGolden Dragon ብራንድ ምርቶች" },
    om: { name: "Golden Dragon", description: "Oomisha birandii Golden Dragon" },
  },
  turkish: {
    am: { name: "የቱርክ ምርቶች", description: "ከቱርክ የሚገቡ ምርቶች" },
    om: { name: "Oomisha Turkii", description: "Meeshaalee Turkii irraa galan" },
  },
  fittings: {
    am: { name: "ፊቲንግ (የቧንቧ መገጣጠሚያዎች)", description: "የቧንቧ መገጣጠሚያዎች፦ ኤልቦ፣ ቲ፣ ካፕሊንግ፣ ዩኒየን እና ቫልቭ" },
    om: { name: "Fiitingii ujummoo", description: "Fiitingii ujummoo: elboo, tii, kaapilingii, yuuniyenii fi vaalvii" },
  },
};

/** Adds missing keys only. */
function fill(current: Tr | null, add: Tr): Tr {
  const out: Tr = structuredClone(current ?? {});
  for (const lang of ["am", "om"] as const) {
    for (const [k, v] of Object.entries(add[lang] ?? {})) {
      if (!out[lang]?.[k]?.trim()) out[lang] = { ...out[lang], [k]: v };
    }
  }
  return out;
}

async function main() {
  const s = await db.query.settings.findFirst({ where: eq(schema.settings.id, 1) });
  if (s) {
    const add: Tr = { am: {}, om: {} };
    for (const [english, tr] of Object.entries(SETTINGS)) {
      if ((s as Record<string, unknown>)[tr.field] === english) {
        add.am![tr.field] = tr.am;
        add.om![tr.field] = tr.om;
      }
    }
    await db.update(schema.settings).set({ i18n: fill(s.i18n, add) }).where(eq(schema.settings.id, 1));
    console.log("settings: translations for", Object.keys(add.am!).join(", ") || "nothing new");
  }

  const cats = await db.select().from(schema.categories);
  for (const c of cats) {
    const tr = CATEGORIES[c.slug];
    if (!tr) continue;
    await db.update(schema.categories).set({ i18n: fill(c.i18n, tr) }).where(eq(schema.categories.id, c.id));
    console.log("category:", c.slug);
  }
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
