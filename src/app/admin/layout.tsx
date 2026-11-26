import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ExternalLink, LayoutDashboard, Package, Settings, Tags, Users } from "lucide-react";
import { requireAdminPage } from "@/lib/admin";
import { RedRule } from "@/components/brand-accents";
import { Logo } from "@/components/logo";
import { SignOutButton } from "./sign-out-button";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };

const nav = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", Icon: Package },
  { href: "/admin/categories", label: "Categories", Icon: Tags },
  { href: "/admin/settings", label: "Settings", Icon: Settings },
];

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <Suspense fallback={<div className="p-8 text-muted">Loading…</div>}>
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}

async function AdminShell({ children }: { children: React.ReactNode }) {
  const admin = await requireAdminPage();
  const items = admin.role === "owner" ? [...nav, { href: "/admin/team", label: "Team", Icon: Users }] : nav;

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="sticky top-0 z-30 bg-ink text-white">
        <RedRule />
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-3 px-4">
          <Link href="/admin" className="flex items-center gap-2 font-semibold">
            <Logo className="h-7 w-auto text-white" />
            Admin
          </Link>
          <Link href="/" target="_blank" className="flex items-center gap-1 text-sm text-ink-muted hover:text-white">
            View site
            <ExternalLink className="size-3.5" aria-hidden />
          </Link>
          <div className="ml-auto flex items-center gap-3 text-sm">
            <span className="hidden text-ink-muted sm:inline">{admin.email}</span>
            <SignOutButton />
          </div>
        </div>
        <nav className="mx-auto flex max-w-5xl gap-1 overflow-x-auto px-2 pb-2 text-sm">
          {items.map((i) => (
            <Link
              key={i.href}
              href={i.href}
              className="flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-white/90 hover:bg-white/10"
            >
              <i.Icon className="size-4 text-ink-muted" aria-hidden />
              {i.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
