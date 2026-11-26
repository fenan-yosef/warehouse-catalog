import Link from "next/link";
import { Clock, MapPin, Package, Phone, Warehouse } from "lucide-react";
import { getSettings } from "@/lib/queries";
import { getContactLinks } from "@/lib/contact";
import { ContactButtons, contactIcon } from "@/components/contact-buttons";

export default async function PublicLayout({ children }: LayoutProps<"/">) {
  const s = await getSettings();
  const links = getContactLinks(s);
  const primary = links[0];
  const PrimaryIcon = primary ? contactIcon[primary.kind] : null;

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
          <Link href="/" className="flex min-w-0 items-center gap-2 font-semibold">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand text-white">
              <Warehouse className="size-4.5" aria-hidden />
            </span>
            <span className="truncate">{s.businessName}</span>
          </Link>
          <nav className="ml-auto flex items-center gap-1 text-sm">
            <Link href="/products" className="flex items-center gap-1.5 rounded-md px-3 py-2 hover:bg-background">
              <Package className="size-4 text-muted" aria-hidden />
              <span>Products</span>
            </Link>
            <Link href="/about" className="hidden rounded-md px-3 py-2 hover:bg-background sm:block">
              About
            </Link>
            <Link href="/contact" className="flex items-center gap-1.5 rounded-md px-3 py-2 hover:bg-background">
              <Phone className="size-4 text-muted" aria-hidden />
              <span className="hidden sm:inline">Contact</span>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 pb-20 sm:pb-0">{children}</main>

      <footer className="border-t border-border bg-surface">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 text-sm sm:grid-cols-3">
          <div>
            <p className="flex items-center gap-2 font-semibold">
              <Warehouse className="size-4 text-brand" aria-hidden />
              {s.businessName}
            </p>
            <p className="mt-1 text-muted">{s.tagline}</p>
          </div>
          <div className="space-y-1.5">
            <p className="font-medium">Warehouse</p>
            <p className="flex items-start gap-2 text-muted">
              <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
              {s.warehouseAddress}
            </p>
            <p className="flex items-start gap-2 text-muted">
              <Clock className="mt-0.5 size-4 shrink-0" aria-hidden />
              {s.openingHours}
            </p>
          </div>
          <div>
            <p className="mb-2 font-medium">Get in touch</p>
            <ContactButtons links={links} />
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
            {primary.kind === "phone" ? primary.label : `Contact us on ${primary.label}`}
          </a>
        </div>
      )}
    </>
  );
}
