import type { Settings } from "@/db/schema";
import { localePath, type Lang } from "@/i18n/config";
import type { StockTone } from "./display";
import { SITE_URL, absoluteUrl } from "./site";

/** schema.org JSON-LD builders. Rendered with <JsonLd>. */

const BUSINESS_ID = `${SITE_URL}/#business`;
const WEBSITE_ID = `${SITE_URL}/#website`;

function sameAs(s: Settings): string[] {
  const tg = s.telegramUsername?.replace(/^@/, "").trim();
  return [tg ? `https://t.me/${tg}` : null, s.facebookUrl, s.tiktokUrl].filter((v): v is string => !!v);
}

/** The business (a local store) and the website. Uses the English settings for consistency. */
export function businessLd(s: Settings, lang: Lang, description: string) {
  const geo =
    s.mapLat != null && s.mapLng != null
      ? { "@type": "GeoCoordinates", latitude: s.mapLat, longitude: s.mapLng }
      : undefined;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "HardwareStore",
        "@id": BUSINESS_ID,
        name: s.businessName,
        alternateName: "Tufte General Trading",
        description,
        url: absoluteUrl(localePath(lang, "/")),
        logo: absoluteUrl("/apple-icon.png"),
        image: absoluteUrl("/api/og"),
        telephone: s.phones[0] || undefined,
        email: s.email || undefined,
        address: {
          "@type": "PostalAddress",
          streetAddress: s.warehouseAddress,
          addressLocality: "Addis Ababa",
          addressCountry: "ET",
        },
        geo,
        areaServed: { "@type": "Country", name: "Ethiopia" },
        knowsLanguage: ["en", "am", "om"],
        sameAs: sameAs(s),
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: SITE_URL,
        name: s.businessName,
        inLanguage: ["en", "am", "om"],
        publisher: { "@id": BUSINESS_ID },
      },
    ],
  };
}

const AVAILABILITY: Record<StockTone, string> = {
  ok: "https://schema.org/InStock",
  low: "https://schema.org/LimitedAvailability",
  out: "https://schema.org/OutOfStock",
};

export function productLd(p: {
  name: string;
  description: string;
  path: string;
  images: string[];
  category?: string | null;
  sku: string;
  tone: StockTone;
  /** Only set when prices are shown publicly. */
  priceEtb: number | null;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description || undefined,
    sku: p.sku,
    category: p.category || undefined,
    image: p.images.length ? p.images : [absoluteUrl("/api/og")],
    url: absoluteUrl(p.path),
    // Google requires a price for Offer; without one we describe the product only.
    offers:
      p.priceEtb != null
        ? {
            "@type": "Offer",
            price: p.priceEtb,
            priceCurrency: "ETB",
            availability: AVAILABILITY[p.tone],
            itemCondition: "https://schema.org/NewCondition",
            url: absoluteUrl(p.path),
            seller: { "@id": BUSINESS_ID },
          }
        : undefined,
  };
}

export function breadcrumbLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: absoluteUrl(it.path),
    })),
  };
}

export function itemListLd(paths: string[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: paths.map((path, i) => ({ "@type": "ListItem", position: i + 1, url: absoluteUrl(path) })),
  };
}

export function faqLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((it) => ({
      "@type": "Question",
      name: it.q,
      acceptedAnswer: { "@type": "Answer", text: it.a },
    })),
  };
}
