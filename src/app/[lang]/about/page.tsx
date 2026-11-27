import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Package } from "lucide-react";
import { getDictionary, localePath, localizeSettings, toLang } from "@/i18n";
import { getSettings } from "@/lib/queries";
import { photos } from "@/lib/photos";
import { pageMetadata } from "@/lib/site";
import { PageBanner } from "@/components/page-banner";
import { ImportRoute } from "@/components/import-route";

export async function generateMetadata({ params }: PageProps<"/[lang]/about">): Promise<Metadata> {
  const lang = toLang((await params).lang);
  const t = getDictionary(lang);
  const s = await getSettings();
  return pageMetadata({
    lang,
    path: "/about",
    title: t.meta.aboutTitle,
    description: t.meta.aboutDescription,
    siteName: s.businessName,
  });
}

const GALLERY = [photos.pipeRacks, photos.fittingInstall, photos.bathroom];

export default async function AboutPage({ params }: PageProps<"/[lang]/about">) {
  const lang = toLang((await params).lang);
  const t = getDictionary(lang);
  const base = await getSettings();
  const s = localizeSettings(base, lang);
  return (
    <>
      <PageBanner image={photos.containerTrucks} title={t.about.title(base.businessName)} subtitle={s.tagline} scene="fittings" />
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="max-w-3xl whitespace-pre-line text-lg leading-relaxed">{s.aboutText || t.about.fallback}</div>
      </div>
      <ImportRoute t={t} />
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-3 sm:grid-cols-3">
          {GALLERY.map((image, i) => (
            <figure key={t.about.gallery[i]} className="overflow-hidden rounded-xl border border-border bg-surface">
              <div className="relative aspect-4/3 bg-neutral-200">
                <Image
                  src={image}
                  alt={t.about.gallery[i]}
                  fill
                  placeholder="blur"
                  quality={55}
                  sizes="(min-width: 640px) 33vw, 100vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="px-4 py-3 text-sm font-medium">{t.about.gallery[i]}</figcaption>
            </figure>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href={localePath(lang, "/products")} className="btn-primary">
            <Package className="size-4" aria-hidden />
            {t.about.browse}
          </Link>
          <Link href={localePath(lang, "/contact")} className="btn-secondary">
            <MapPin className="size-4" aria-hidden />
            {t.about.contactLink}
          </Link>
        </div>
      </div>
    </>
  );
}
