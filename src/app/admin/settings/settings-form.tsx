"use client";

import { useActionState } from "react";
import { Building2, Eye, MapPin, MessageCircle, Save, type LucideIcon } from "lucide-react";
import type { Settings } from "@/db/schema";
import { saveSettings, type FormState } from "../actions";
import { FormMessage } from "../form-message";

function Section({
  Icon,
  title,
  hint,
  children,
}: {
  Icon: LucideIcon;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="card space-y-4 p-4 sm:p-6">
      <div>
        <h2 className="flex items-center gap-2 font-semibold">
          <Icon className="size-4.5 text-brand" aria-hidden />
          {title}
        </h2>
        {hint && <p className="mt-0.5 text-sm text-muted">{hint}</p>}
      </div>
      {children}
    </section>
  );
}

function Toggle({ name, label, hint, defaultChecked }: { name: string; label: string; hint?: string; defaultChecked: boolean }) {
  return (
    <label className="flex items-start gap-3">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="mt-0.5 size-4 accent-brand" />
      <span>
        <span className="block text-sm font-medium">{label}</span>
        {hint && <span className="block text-xs text-muted">{hint}</span>}
      </span>
    </label>
  );
}

export function SettingsForm({ settings: s }: { settings: Settings }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveSettings, undefined);

  return (
    <form action={action} className="space-y-6">
      <Section Icon={Eye} title="Display rules" hint="Decide what customers can see. You can change these any time.">
        <Toggle
          name="showPrices"
          label="Show prices on the website"
          hint="Only products with a price filled in will show one."
          defaultChecked={s.showPrices}
        />
        <div>
          <label className="label" htmlFor="priceFallbackText">Text shown instead of a price</label>
          <input id="priceFallbackText" name="priceFallbackText" defaultValue={s.priceFallbackText} className="input" />
        </div>

        <fieldset>
          <legend className="label">How to show stock</legend>
          <div className="space-y-2">
            {[
              ["exact", "Exact quantity", "e.g. “240 pcs in stock”"],
              ["status", "Status only", "In stock / Limited stock / Out of stock"],
              ["hidden", "Don't show stock", "Customers ask you directly"],
            ].map(([value, label, hint]) => (
              <label key={value} className="flex items-start gap-3">
                <input
                  type="radio"
                  name="stockDisplay"
                  value={value}
                  defaultChecked={s.stockDisplay === value}
                  className="mt-0.5 size-4 accent-brand"
                />
                <span>
                  <span className="block text-sm font-medium">{label}</span>
                  <span className="block text-xs text-muted">{hint}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <div className="max-w-xs">
          <label className="label" htmlFor="lowStockThreshold">“Limited stock” at or below</label>
          <input
            id="lowStockThreshold"
            name="lowStockThreshold"
            type="number"
            inputMode="numeric"
            min={0}
            defaultValue={s.lowStockThreshold}
            className="input"
          />
        </div>
        <Toggle
          name="showOutOfStock"
          label="Keep out-of-stock products visible"
          hint="Untick to hide them from the website until restocked."
          defaultChecked={s.showOutOfStock}
        />
      </Section>

      <Section Icon={MessageCircle} title="Contact & ordering" hint="Customers order by messaging or calling you. These power the order buttons.">
        <div>
          <label className="label" htmlFor="phones">Phone numbers (one per line, first is the main one)</label>
          <textarea id="phones" name="phones" rows={2} defaultValue={s.phones.join("\n")} placeholder="+251 9..." className="input" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="telegramUsername">Telegram username</label>
            <input id="telegramUsername" name="telegramUsername" defaultValue={s.telegramUsername ?? ""} placeholder="@yourshop" className="input" />
          </div>
          <div>
            <label className="label" htmlFor="whatsappNumber">WhatsApp number</label>
            <input id="whatsappNumber" name="whatsappNumber" defaultValue={s.whatsappNumber ?? ""} placeholder="+2519..." className="input" />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="email">Email (optional)</label>
          <input id="email" name="email" type="email" defaultValue={s.email ?? ""} className="input" />
        </div>
        <div className="flex flex-wrap gap-6">
          <Toggle name="showTelegram" label="Telegram button" defaultChecked={s.showTelegram} />
          <Toggle name="showWhatsapp" label="WhatsApp button" defaultChecked={s.showWhatsapp} />
          <Toggle name="showPhone" label="Call button" defaultChecked={s.showPhone} />
        </div>
      </Section>

      <Section Icon={Building2} title="Business info">
        <div>
          <label className="label" htmlFor="businessName">Business name</label>
          <input id="businessName" name="businessName" required defaultValue={s.businessName} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="tagline">Tagline</label>
          <input id="tagline" name="tagline" defaultValue={s.tagline} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="aboutText">About the business</label>
          <textarea
            id="aboutText"
            name="aboutText"
            rows={6}
            defaultValue={s.aboutText}
            placeholder="Who you are, how long you've been importing, what you sell, who you sell to…"
            className="input"
          />
        </div>
      </Section>

      <Section Icon={MapPin} title="Warehouse location" hint="For an exact map pin, open Google Maps, long-press the warehouse, and copy the two numbers.">
        <div>
          <label className="label" htmlFor="warehouseAddress">Address</label>
          <input id="warehouseAddress" name="warehouseAddress" required defaultValue={s.warehouseAddress} className="input" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="mapLat">Latitude</label>
            <input id="mapLat" name="mapLat" inputMode="decimal" defaultValue={s.mapLat ?? ""} placeholder="9.03…" className="input" />
          </div>
          <div>
            <label className="label" htmlFor="mapLng">Longitude</label>
            <input id="mapLng" name="mapLng" inputMode="decimal" defaultValue={s.mapLng ?? ""} placeholder="38.6…" className="input" />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="openingHours">Opening hours</label>
          <input id="openingHours" name="openingHours" defaultValue={s.openingHours} className="input" />
        </div>
      </Section>

      <div className="sticky bottom-0 -mx-4 space-y-2 border-t border-border bg-background/95 px-4 py-3 backdrop-blur">
        <FormMessage state={state} />
        <button disabled={pending} className="btn-primary w-full sm:w-auto">
          <Save className="size-4" aria-hidden />
          {pending ? "Saving…" : "Save settings"}
        </button>
      </div>
    </form>
  );
}
