import type { CategoryI18n, ProductI18n, Settings } from "@/db/schema";
import { am } from "./am";
import { en, type Dict } from "./en";
import { om } from "./om";
import { isLang, type Lang } from "./config";

export * from "./config";
export type { Dict };

const DICTS: Record<Lang, Dict> = { en, am, om };

export function getDictionary(lang: Lang): Dict {
  return DICTS[lang];
}

/** Validates a [lang] route param; anything unexpected falls back to English. */
export function toLang(v: string): Lang {
  return isLang(v) ? v : "en";
}

type WithI18n<F extends string> = { i18n: Partial<Record<"am" | "om", Partial<Record<F, string>>>> | null };

/** A translated field if the admin filled one in, otherwise the English value. */
function pick<F extends string>(row: WithI18n<F>, lang: Lang, field: F, english: string): string {
  if (lang === "en") return english;
  const v = row.i18n?.[lang]?.[field]?.trim();
  return v || english;
}

/** Works for full rows and for list rows that carry no description. */
export function localizeProduct<T extends { name: string; description?: string; i18n: ProductI18n | null }>(
  p: T,
  lang: Lang,
): T {
  const name = pick(p, lang, "name", p.name);
  return p.description === undefined ? { ...p, name } : { ...p, name, description: pick(p, lang, "description", p.description) };
}

export function localizeCategory<T extends { name: string; description: string; i18n: CategoryI18n | null }>(
  c: T,
  lang: Lang,
): T {
  return { ...c, name: pick(c, lang, "name", c.name), description: pick(c, lang, "description", c.description) };
}

export function localizeSettings(s: Settings, lang: Lang): Settings {
  return {
    ...s,
    tagline: pick(s, lang, "tagline", s.tagline),
    aboutText: pick(s, lang, "aboutText", s.aboutText),
    priceFallbackText: pick(s, lang, "priceFallbackText", s.priceFallbackText),
    warehouseAddress: pick(s, lang, "warehouseAddress", s.warehouseAddress),
    openingHours: pick(s, lang, "openingHours", s.openingHours),
  };
}

export { unitLabel } from "@/lib/display";
