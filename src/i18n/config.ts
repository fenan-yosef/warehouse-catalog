/** Public-site languages. English has no URL prefix; the others live under /am and /om. */
export const LANGS = ["en", "am", "om"] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = "en";

export const isLang = (v: string): v is Lang => (LANGS as readonly string[]).includes(v);

/** Native names for the language switcher. */
export const LANG_LABEL: Record<Lang, string> = { en: "English", am: "አማርኛ", om: "Afaan Oromoo" };
export const LANG_SHORT: Record<Lang, string> = { en: "EN", am: "አማ", om: "OM" };

/** Open Graph locale codes. */
export const OG_LOCALE: Record<Lang, string> = { en: "en_US", am: "am_ET", om: "om_ET" };

/** URL path of a page in a language, e.g. ("am", "/products") → "/am/products". */
export function localePath(lang: Lang, path = "/"): string {
  const p = path.startsWith("/") ? path : `/${path}`;
  if (lang === DEFAULT_LANG) return p;
  return p === "/" ? `/${lang}` : `/${lang}${p}`;
}
