import type { Metadata } from "next";
import { LANGS, OG_LOCALE, localePath, type Lang } from "@/i18n/config";

/** The public address. Switching to a custom domain later = set NEXT_PUBLIC_SITE_URL. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://tuftetrading.vercel.app").replace(/\/+$/, "");

export const absoluteUrl = (path: string) => (/^https?:\/\//.test(path) ? path : `${SITE_URL}${path}`);

/** Preview deployments (and anything that isn't production on Vercel) must never be indexed. */
export const IS_INDEXABLE = process.env.VERCEL_ENV ? process.env.VERCEL_ENV === "production" : true;

/** Branded share card, used when a page has no photo of its own. */
export const DEFAULT_OG_IMAGE = { url: "/api/og", width: 1200, height: 630 };

/** Canonical URL + hreflang alternates for the same page in every language. */
export function alternates(lang: Lang, path: string): NonNullable<Metadata["alternates"]> {
  return {
    canonical: localePath(lang, path),
    languages: {
      ...Object.fromEntries(LANGS.map((l) => [l, localePath(l, path)])),
      "x-default": localePath("en", path),
    },
  };
}

/** Full page metadata: title, description, canonical/hreflang and share card. */
export function pageMetadata(opts: {
  lang: Lang;
  path: string;
  title: string | { absolute: string };
  description: string;
  siteName: string;
  image?: { url: string; width?: number; height?: number; alt?: string } | null;
  type?: "website" | "article";
  noindex?: boolean;
}): Metadata {
  const image = opts.image ?? { ...DEFAULT_OG_IMAGE, alt: opts.siteName };
  const ogTitle = typeof opts.title === "string" ? opts.title : opts.title.absolute;
  return {
    title: opts.title,
    description: opts.description,
    alternates: alternates(opts.lang, opts.path),
    openGraph: {
      type: opts.type ?? "website",
      url: localePath(opts.lang, opts.path),
      siteName: opts.siteName,
      title: ogTitle,
      description: opts.description,
      locale: OG_LOCALE[opts.lang],
      alternateLocale: LANGS.filter((l) => l !== opts.lang).map((l) => OG_LOCALE[l]),
      images: [image],
    },
    twitter: { card: "summary_large_image", title: ogTitle, description: opts.description, images: [image.url] },
    ...(opts.noindex ? { robots: { index: false, follow: true } } : {}),
  };
}

/** Meta descriptions read best at ≤160 characters. */
export function clip(text: string, max = 160): string {
  const t = text.replace(/\s+/g, " ").trim();
  return t.length <= max ? t : `${t.slice(0, max - 1).replace(/\s+\S*$/, "")}…`;
}
