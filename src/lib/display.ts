import type { Settings } from "@/db/schema";
import type { Dict } from "@/i18n/en";

export type DisplaySettings = Pick<
  Settings,
  "showPrices" | "priceFallbackText" | "stockDisplay" | "lowStockThreshold" | "showOutOfStock"
>;

export type StockTone = "ok" | "low" | "out";

export interface Availability {
  tone: StockTone;
  /** What the public sees, or null when stock display is hidden. */
  label: string | null;
}

/**
 * The single place that decides what the public sees for stock.
 * Every public page goes through this so the admin's display rules apply everywhere.
 */
export function getAvailability(
  quantity: number,
  unit: string,
  s: DisplaySettings,
  t: Dict,
): Availability {
  const tone: StockTone =
    quantity <= 0 ? "out" : quantity <= s.lowStockThreshold ? "low" : "ok";

  switch (s.stockDisplay) {
    case "hidden":
      return { tone, label: null };
    case "exact":
      return {
        tone,
        label: tone === "out" ? t.stock.out : t.stock.exact(formatNumber(quantity), unitLabel(unit, t)),
      };
    case "status":
    default:
      return {
        tone,
        label: tone === "out" ? t.stock.out : tone === "low" ? t.stock.limited : t.stock.in,
      };
  }
}

/** What the public sees for price. Pass settings already localized (priceFallbackText). */
export function getPriceText(priceEtb: number | null, unit: string, s: DisplaySettings, t: Dict): string {
  if (s.showPrices && priceEtb != null) return t.price.perUnit(formatNumber(priceEtb), unitLabel(unit, t));
  return s.priceFallbackText;
}

/** Unit in the page language; falls back to what the admin typed. */
export function unitLabel(unit: string, t: Dict): string {
  return t.units[unit.toLowerCase()] ?? unit;
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}

export function slugify(input: string): string {
  return (
    input
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "item"
  );
}
