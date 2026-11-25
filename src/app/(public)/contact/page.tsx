import type { Metadata } from "next";
import { getSettings } from "@/lib/queries";
import { getContactLinks } from "@/lib/contact";
import { ContactButtons } from "@/components/contact-buttons";
import { MapEmbed } from "@/components/map-embed";

export const metadata: Metadata = { title: "Contact & location" };

export default async function ContactPage() {
  const s = await getSettings();
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-semibold">Contact & location</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-6">
          <div>
            <h2 className="font-semibold">Message or call us</h2>
            <div className="mt-3">
              <ContactButtons links={getContactLinks(s)} size="lg" />
            </div>
          </div>
          {s.phones.length > 0 && (
            <div>
              <h2 className="font-semibold">Phone</h2>
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
              <h2 className="font-semibold">Email</h2>
              <a href={`mailto:${s.email}`} className="mt-2 block text-brand hover:underline">
                {s.email}
              </a>
            </div>
          )}
          <div>
            <h2 className="font-semibold">Opening hours</h2>
            <p className="mt-2 text-muted">{s.openingHours}</p>
          </div>
        </div>
        <MapEmbed settings={s} />
      </div>
    </div>
  );
}
