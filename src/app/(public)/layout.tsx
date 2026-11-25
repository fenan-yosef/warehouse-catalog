import Link from "next/link";
import { getSettings } from "@/lib/queries";
import { getContactLinks } from "@/lib/contact";
import { ContactButtons } from "@/components/contact-buttons";

export default async function PublicLayout({ children }: LayoutProps<"/">) {
  const s = await getSettings();
  const links = getContactLinks(s);
  const primary = links[0];

  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border bg-surface/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
          <Link href="/" className="truncate text-base font-semibold">
            {s.businessName}
          </Link>
          <nav className="ml-auto flex items-center gap-1 text-sm">
            <Link href="/products" className="rounded-md px-3 py-2 hover:bg-background">
              Products
            </Link>
            <Link href="/about" className="hidden rounded-md px-3 py-2 hover:bg-background sm:block">
              About
            </Link>
            <Link href="/contact" className="rounded-md px-3 py-2 hover:bg-background">
              Contact
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 pb-20 sm:pb-0">{children}</main>

      <footer className="border-t border-border bg-surface">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 text-sm sm:grid-cols-3">
          <div>
            <p className="font-semibold">{s.businessName}</p>
            <p className="mt-1 text-muted">{s.tagline}</p>
          </div>
          <div>
            <p className="font-medium">Warehouse</p>
            <p className="mt-1 text-muted">{s.warehouseAddress}</p>
            <p className="text-muted">{s.openingHours}</p>
          </div>
          <div>
            <p className="mb-2 font-medium">Get in touch</p>
            <ContactButtons links={links} />
          </div>
        </div>
      </footer>

      {/* Sticky contact on phones */}
      {primary && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface p-3 sm:hidden">
          <a
            href={primary.href}
            target={primary.kind === "phone" ? undefined : "_blank"}
            rel="noopener noreferrer"
            className="btn-primary w-full py-3 text-base"
          >
            {primary.kind === "phone" ? primary.label : `Contact us on ${primary.label}`}
          </a>
        </div>
      )}
    </>
  );
}
