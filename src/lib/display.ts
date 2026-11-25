import type { Settings } from "@/db/schema";

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
): Availability {
  const tone: StockTone =
    quantity <= 0 ? "out" : quantity <= s.lowStockThreshold ? "low" : "ok";

  switch (s.stockDisplay) {
    case "hidden":
      return { tone, label: null };
    case "exact":
      return {
        tone,
        label: tone === "out" ? "Out of stock" : `${formatNumber(quantity)} ${unit} in stock`,
      };
    case "status":
    default:
      return {
        tone,
        label: tone === "out" ? "Out of stock" : tone === "low" ? "Limited stock" : "In stock",
      };
  }
}

/** What the public sees for price. */
export function getPriceText(priceEtb: number | null, unit: string, s: DisplaySettings): string {
  if (s.showPrices && priceEtb != null) return `ETB ${formatNumber(priceEtb)} / ${unit}`;
  return s.priceFallbackText;
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
