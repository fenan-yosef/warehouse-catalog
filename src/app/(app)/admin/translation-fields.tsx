"use client";

import { useId } from "react";
import { Languages } from "lucide-react";

type Values = Partial<Record<"am" | "om", Partial<Record<string, string>>>> | null | undefined;
type Field = { key: string; label: string; multiline?: boolean };

const LANGS = [
  { code: "am", label: "አማርኛ — Amharic" },
  { code: "om", label: "Afaan Oromoo — Oromo" },
] as const;

/**
 * Optional translations, posted as i18n.<lang>.<field> and read by readI18n() in actions.ts.
 * Empty fields fall back to the English text on the public site.
 */
export function TranslationFields({ fields, values }: { fields: Field[]; values?: Values }) {
  const id = useId();
  const filled = LANGS.filter((l) => fields.some((f) => values?.[l.code]?.[f.key]?.trim()));
  return (
    <details className="rounded-lg border border-border bg-surface" open={filled.length > 0}>
      <summary className="flex cursor-pointer items-center gap-2 p-3 text-sm font-medium">
        <Languages className="size-4 text-brand" aria-hidden />
        Amharic & Afaan Oromo (optional)
        {filled.length > 0 && (
          <span className="ml-auto rounded-full bg-ok-soft px-2 py-0.5 text-xs text-ok">
            {filled.map((l) => l.code.toUpperCase()).join(" + ")} filled
          </span>
        )}
      </summary>
      <div className="space-y-5 border-t border-border p-3">
        <p className="text-xs text-muted">
          Shown on the Amharic (/am) and Afaan Oromo (/om) versions of the website, and helps people find you when they
          search in those languages. Leave empty to show the English text.
        </p>
        {LANGS.map((l) => (
          <fieldset key={l.code} className="space-y-3">
            <legend className="mb-1 text-sm font-semibold">{l.label}</legend>
            {fields.map((f) => {
              const name = `i18n.${l.code}.${f.key}`;
              const inputId = `${id}-${l.code}-${f.key}`;
              const value = values?.[l.code]?.[f.key] ?? "";
              return (
                <div key={name}>
                  <label className="label" htmlFor={inputId}>{f.label}</label>
                  {f.multiline ? (
                    <textarea id={inputId} name={name} rows={4} defaultValue={value} lang={l.code} className="input" />
                  ) : (
                    <input id={inputId} name={name} defaultValue={value} lang={l.code} className="input" />
                  )}
                </div>
              );
            })}
          </fieldset>
        ))}
      </div>
    </details>
  );
}
