import { ChevronDown, CircleHelp } from "lucide-react";
import type { Dict } from "@/i18n/en";
import { faqLd } from "@/lib/structured-data";
import { JsonLd } from "./json-ld";

/**
 * Common questions, readable by people and (via FAQPage markup) search engines.
 * `markup`: emit FAQPage data. Google wants it on one page only (we use the contact page).
 */
export function Faq({ t, address, hours, markup = true }: { t: Dict; address: string; hours: string; markup?: boolean }) {
  const items = t.faq.items({ address, hours });
  return (
    <section className="mx-auto max-w-3xl px-4 py-12">
      <h2 className="flex items-center gap-2 text-xl font-semibold">
        <CircleHelp className="size-5 text-brand" aria-hidden />
        {t.faq.title}
      </h2>
      <div className="mt-5 divide-y divide-border rounded-xl border border-border bg-surface">
        {items.map((it) => (
          <details key={it.q} className="group p-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-medium">
              {it.q}
              <ChevronDown className="size-4 shrink-0 text-muted transition-transform group-open:rotate-180" aria-hidden />
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-muted">{it.a}</p>
          </details>
        ))}
      </div>
      {markup && <JsonLd data={faqLd(items)} />}
    </section>
  );
}
