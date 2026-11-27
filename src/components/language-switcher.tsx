"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Languages } from "lucide-react";
import { LANGS, LANG_LABEL, LANG_SHORT, localePath, type Lang } from "@/i18n/config";

/** Strips a leading /am or /om so the same page can be linked in another language. */
function basePath(pathname: string): string {
  const m = pathname.match(/^\/(am|om)(\/.*)?$/);
  return m ? m[2] || "/" : pathname || "/";
}

export function LanguageSwitcher({
  lang,
  label,
  variant = "compact",
}: {
  lang: Lang;
  label: string;
  variant?: "compact" | "footer";
}) {
  const path = basePath(usePathname() ?? "/");
  return <LanguageLinks lang={lang} label={label} variant={variant} path={path} />;
}

/** Same links without the current path (used as the Suspense fallback): points at each home page. */
export function LanguageLinks({
  lang,
  label,
  variant = "compact",
  path = "/",
}: {
  lang: Lang;
  label: string;
  variant?: "compact" | "footer";
  path?: string;
}) {
  return (
    <nav aria-label={label} className={variant === "footer" ? "flex flex-wrap gap-2" : "flex items-center gap-0.5"}>
      {variant === "compact" && <Languages className="mr-1 hidden size-4 text-muted sm:block" aria-hidden />}
      {LANGS.map((l) => (
        <Link
          key={l}
          href={localePath(l, path)}
          hrefLang={l}
          lang={l}
          aria-current={l === lang ? "true" : undefined}
          className={
            variant === "footer"
              ? `rounded-md border px-2.5 py-1 text-xs ${l === lang ? "border-white bg-white text-ink" : "border-white/25 text-white/80 hover:border-white"}`
              : `rounded-md px-2 py-1.5 text-xs font-medium ${l === lang ? "bg-ink text-white" : "text-muted hover:bg-background hover:text-foreground"}`
          }
        >
          {variant === "footer" ? LANG_LABEL[l] : LANG_SHORT[l]}
        </Link>
      ))}
    </nav>
  );
}
