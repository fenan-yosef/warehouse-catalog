import type { MetadataRoute } from "next";
import { LANGS, localePath } from "@/i18n/config";
import { getSitemapData } from "@/lib/queries";
import { SITE_URL } from "@/lib/site";

type Entry = MetadataRoute.Sitemap[number];

/** Every public page in every language, each listing its translations. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { products, categories } = await getSitemapData();

  const page = (
    path: string,
    priority: number,
    changeFrequency: Entry["changeFrequency"],
    lastModified?: Date,
  ): Entry[] =>
    LANGS.map((lang) => ({
      url: SITE_URL + localePath(lang, path),
      lastModified,
      changeFrequency,
      priority,
      alternates: {
        languages: Object.fromEntries(LANGS.map((l) => [l, SITE_URL + localePath(l, path)])),
      },
    }));

  const newest = products.reduce<Date | undefined>(
    (d, p) => (!d || p.updatedAt > d ? p.updatedAt : d),
    undefined,
  );

  return [
    ...page("/", 1, "daily", newest),
    ...page("/products", 0.9, "daily", newest),
    ...categories.flatMap((c) => page(`/categories/${c.slug}`, 0.8, "weekly")),
    ...products.flatMap((p) => page(`/products/${p.slug}`, 0.7, "weekly", p.updatedAt)),
    ...page("/about", 0.5, "monthly"),
    ...page("/contact", 0.6, "monthly"),
  ];
}
