import type { Metadata } from "next";
import { Clock, Mail, MessageCircle, Phone } from "lucide-react";
import { getDictionary, localizeSettings, toLang } from "@/i18n";
import { getSettings } from "@/lib/queries";
import { getContactLinks } from "@/lib/contact";
import { photos } from "@/lib/photos";
import { pageMetadata } from "@/lib/site";
import { ContactButtons } from "@/components/contact-buttons";
import { MapEmbed } from "@/components/map-embed";
import { PageBanner } from "@/components/page-banner";
import { Faq } from "@/components/faq";

export async function generateMetadata({ params }: PageProps<"/[lang]/contact">): Promise<Metadata> {
  const lang = toLang((await params).lang);
  const t = getDictionary(lang);
  const s = await getSettings();
  return pageMetadata({
    lang,
    path: "/contact",
    title: t.meta.contactTitle,
    description: t.meta.contactDescription,
    siteName: s.businessName,
  });
}

export default async function ContactPage({ params }: PageProps<"/[lang]/contact">) {
  const lang = toLang((await params).lang);
  const t = getDictionary(lang);
  const base = await getSettings();
  const s = localizeSettings(base, lang);
  return (
    <>
      <PageBanner image={photos.warehouseAisle} title={t.contact.title} subtitle={t.contact.subtitle} scene="pin" />
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
          <div className="space-y-6">
            <div>
              <h2 className="flex items-center gap-2 font-semibold">
                <MessageCircle className="size-4 text-brand" aria-hidden />
                {t.contact.messageUs}
              </h2>
              <div className="mt-3">
                <ContactButtons links={getContactLinks(s, t)} emptyText={t.contactLinks.soon} size="lg" />
              </div>
            </div>
            {s.phones.length > 0 && (
              <div>
                <h2 className="flex items-center gap-2 font-semibold">
                  <Phone className="size-4 text-brand" aria-hidden />
                  {t.contact.phone}
                </h2>
                <ul className="mt-2 space-y-1">
                  {s.phones.map((p) => (
                    <li key={p}>
                      <a href={`tel:${p.replace(/\s+/g, "")}`} className="text-brand hover:underline">
                        {p}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {s.email && (
              <div>
                <h2 className="flex items-center gap-2 font-semibold">
                  <Mail className="size-4 text-brand" aria-hidden />
                  {t.contact.email}
                </h2>
                <a href={`mailto:${s.email}`} className="mt-2 block text-brand hover:underline">
                  {s.email}
                </a>
              </div>
            )}
            <div>
              <h2 className="flex items-center gap-2 font-semibold">
                <Clock className="size-4 text-brand" aria-hidden />
                {t.contact.hours}
              </h2>
              <p className="mt-2 text-muted">{s.openingHours}</p>
            </div>
          </div>
          <MapEmbed settings={s} base={base} t={t} />
        </div>
      </div>
      <Faq t={t} address={s.warehouseAddress} hours={s.openingHours} />
    </>
  );
}
