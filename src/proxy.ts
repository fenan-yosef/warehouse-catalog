import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth/server";

/**
 * 1. /admin needs a session (the allowlist check happens server-side in requireAdminPage()/requireAdmin()).
 * 2. Language routing for the public site: English has no prefix, Amharic is /am, Afaan Oromo is /om.
 *    Unprefixed paths are rewritten to the internal /en route; /en/... is redirected to the clean URL
 *    so each page has exactly one English address.
 */
const adminAuth = auth.middleware({ loginUrl: "/auth/sign-in" });

export default async function proxy(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;

  if (pathname === "/admin" || pathname.startsWith("/admin/")) return adminAuth(req);
  if (pathname === "/auth" || pathname.startsWith("/auth/")) return NextResponse.next();

  const m = pathname.match(/^\/(en|am|om)(\/.*)?$/);
  const prefix = m?.[1];
  const rest = m ? m[2] || "/" : pathname;

  // Old filter links (/products?category=x) → the real category page.
  const category = searchParams.get("category");
  if (rest === "/products" && category && !searchParams.get("q")) {
    const url = req.nextUrl.clone();
    url.pathname = `${prefix && prefix !== "en" ? `/${prefix}` : ""}/categories/${encodeURIComponent(category)}`;
    url.search = "";
    return NextResponse.redirect(url, 308);
  }

  if (prefix === "en") {
    const url = req.nextUrl.clone();
    url.pathname = rest;
    return NextResponse.redirect(url, 308);
  }
  if (prefix) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = `/en${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Everything except API routes, Next internals and files (anything with a dot: robots.txt, icon.svg…).
  matcher: ["/((?!api/|_next/|.*\\..*).*)"],
};
