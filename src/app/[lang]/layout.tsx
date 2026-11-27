import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Clock, MapPin, Package, Phone, Send } from "lucide-react";
import "../globals.css";
import { LANGS, OG_LOCALE, getDictionary, isLang, localePath, localizeSettings } from "@/i18n";
import { getSettings } from "@/lib/queries";
import { getContactLinks } from "@/lib/contact";
import { DEFAULT_OG_IMAGE, IS_INDEXABLE, SITE_URL, alternates } from "@/lib/site";
import { businessLd } from "@/lib/structured-data";
import { ContactButtons, contactIcon } from "@/components/contact-buttons";
import { RedRule } from "@/components/brand-accents";
import { Logo } from "@/components/logo";
import { JsonLd } from "@/components/json-ld";
import { LanguageLinks, LanguageSwitcher } from "@/components/language-switcher";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export function generateStaticParams() {
  return LANGS.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang: raw } = await params;
  if (!isLang(raw)) return {};
  const t = getDictionary(raw);
  const s = await getSettings();
  const google = process.env.GOOGLE_SITE_VERIFICATION;
  const bing = process.env.BING_SITE_VERIFICATION;
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t.meta.siteTitle, template: t.meta.titleTemplate },
    description: t.meta.description,
    applicationName: s.businessName,
    alternates: alternates(raw, "/"),
    openGraph: {
      type: "website",
      siteName: s.businessName,
      locale: OG_LOCALE[raw],
      images: [{ ...DEFAULT_OG_IMAGE, alt: s.businessName }],
    },
    twitter: { card: "summary_large_image" },
    // Indexable is the default; only preview deployments say otherwise.
    ...(IS_INDEXABLE ? {} : { robots: { index: false, follow: false } }),
    verification: {
      ...(google ? { google } : {}),
      ...(bing ? { other: { "msvalidate.01": bing } } : {}),
    },
    formatDetection: { telephone: false },
  };
}

export default async function PublicLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  const t = getDictionary(lang);
  const base = await getSettings();
  const s = localizeSettings(base, lang);
  const links = getContactLinks(s, t);
  const primary = links[0];
  const PrimaryIcon = primary ? contactIcon[primary.kind] : null;
  const href = (path: string) => localePath(lang, path);
  const tg = base.telegramUsername?.replace(/^@/, "").trim();
  const social = [
    tg ? { href: `https://t.me/${tg}`, label: "Telegram", Icon: Send } : null,
    base.facebookUrl ? { href: base.facebookUrl, label: "Facebook", Icon: null } : null,
    base.tiktokUrl ? { href: base.tiktokUrl, label: "TikTok", Icon: null } : null,
  ].filter((x) => x !== null);

  return (
    <html lang={lang} className={`${geistSans.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">
        <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur">
          <RedRule />
          <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-4 sm:gap-4">
            <Link href={href("/")} className="flex min-w-0 items-center gap-2 font-semibold">
              <Logo className="h-8 w-auto shrink-0 text-ink" />
              <span className="hidden truncate text-sm min-[420px]:inline sm:text-base">{base.businessName}</span>
            </Link>
            <nav className="ml-auto flex items-center gap-0.5 text-sm sm:gap-1">
              <Link href={href("/products")} className="flex items-center gap-1.5 rounded-md px-2.5 py-2 hover:bg-background">
                <Package className="size-4 text-muted" aria-hidden />
                <span className="sr-only md:not-sr-only">{t.nav.products}</span>
              </Link>
              <Link href={href("/about")} className="hidden rounded-md px-2.5 py-2 hover:bg-background md:block">
                {t.nav.about}
              </Link>
              <Link href={href("/contact")} className="flex items-center gap-1.5 rounded-md px-2.5 py-2 hover:bg-background">
                <Phone className="size-4 text-muted" aria-hidden />
                <span className="sr-only md:not-sr-only">{t.nav.contact}</span>
              </Link>
            </nav>
            <Suspense fallback={<LanguageLinks lang={lang} label={t.nav.language} />}>
              <LanguageSwitcher lang={lang} label={t.nav.language} />
            </Suspense>
          </div>
        </header>

        <main className="flex-1 pb-20 sm:pb-0">{children}</main>

        <footer className="bg-ink text-white">
          <RedRule />
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 text-sm sm:grid-cols-3">
            <div className="space-y-3">
              <p className="flex items-center gap-2 font-semibold">
                <Logo className="h-6 w-auto text-white" />
                {base.businessName}
              </p>
              <p className="text-ink-muted">{s.tagline}</p>
              <nav className="flex flex-wrap gap-x-4 gap-y-1 text-ink-muted">
                <Link href={href("/products")} className="hover:text-white">{t.nav.products}</Link>
                <Link href={href("/about")} className="hover:text-white">{t.nav.about}</Link>
                <Link href={href("/contact")} className="hover:text-white">{t.nav.contact}</Link>
              </nav>
            </div>
            <div className="space-y-1.5">
              <p className="font-medium">{t.footer.warehouse}</p>
              <p className="flex items-start gap-2 text-ink-muted">
                <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
                {s.warehouseAddress}
              </p>
              <p className="flex items-start gap-2 text-ink-muted">
                <Clock className="mt-0.5 size-4 shrink-0" aria-hidden />
                {s.openingHours}
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <p className="mb-2 font-medium">{t.footer.getInTouch}</p>
                <ContactButtons links={links} emptyText={t.contactLinks.soon} />
              </div>
              {social.length > 0 && (
                <div>
                  <p className="mb-2 font-medium">{t.footer.follow}</p>
                  <div className="flex flex-wrap gap-3 text-ink-muted">
                    {social.map(({ href: url, label, Icon }) => (
                      <a key={label} href={url} target="_blank" rel="noopener noreferrer me" className="inline-flex items-center gap-1.5 hover:text-white">
                        {Icon && <Icon className="size-4" aria-hidden />}
                        {label}
                      </a>
                    ))}
                  </div>
                </div>
              )}
              <LanguageLinks lang={lang} label={t.nav.language} variant="footer" />
            </div>
          </div>
        </footer>

        {/* Sticky contact on phones */}
        {primary && PrimaryIcon && (
          <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface p-3 sm:hidden">
            <a
              href={primary.href}
              target={primary.kind === "phone" ? undefined : "_blank"}
              rel="noopener noreferrer"
              className="btn-primary w-full py-3 text-base"
            >
              <PrimaryIcon className="size-5" aria-hidden />
              {primary.kind === "phone" ? primary.label : t.contactLinks.contactOn(primary.label)}
            </a>
          </div>
        )}

        <JsonLd data={businessLd(base, lang, t.meta.description)} />
      </body>
    </html>
  );
}
