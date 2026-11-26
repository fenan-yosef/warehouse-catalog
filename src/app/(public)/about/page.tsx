import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Package } from "lucide-react";
import { getSettings } from "@/lib/queries";

export const metadata: Metadata = { title: "About us" };

export default async function AboutPage() {
  const s = await getSettings();
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-semibold">About {s.businessName}</h1>
      <p className="mt-3 text-lg text-muted">{s.tagline}</p>
      <div className="mt-8 whitespace-pre-line leading-relaxed">
        {s.aboutText ||
          "We import metals and sanitary materials directly from manufacturers and keep them in stock at our warehouse in Ashewa Meda. Contractors, shops and individual buyers can browse what we have, message us to confirm availability, and pick up from the warehouse."}
      </div>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link href="/products" className="btn-primary">
          <Package className="size-4" aria-hidden />
          Browse products
        </Link>
        <Link href="/contact" className="btn-secondary">
          <MapPin className="size-4" aria-hidden />
          Contact & location
        </Link>
      </div>
    </div>
  );
}
