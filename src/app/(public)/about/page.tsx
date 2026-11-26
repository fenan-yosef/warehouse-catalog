import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MapPin, Package } from "lucide-react";
import { getSettings } from "@/lib/queries";
import { photos } from "@/lib/photos";
import { PageBanner } from "@/components/page-banner";
import { ImportRoute } from "@/components/import-route";

export const metadata: Metadata = { title: "About us" };

const GALLERY = [
  { image: photos.pipeRacks, caption: "Metal pipes and tubes" },
  { image: photos.fittingInstall, caption: "Fittings and valves" },
  { image: photos.bathroom, caption: "Sanitary materials" },
];

export default async function AboutPage() {
  const s = await getSettings();
  return (
    <>
      <PageBanner
        image={photos.containerTrucks}
        title={`About ${s.businessName}`}
        subtitle={s.tagline}
        scene="fittings"
      />
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="max-w-3xl whitespace-pre-line text-lg leading-relaxed">
          {s.aboutText ||
            "We import metals and sanitary materials directly from manufacturers and keep them in stock at our warehouse in Ashewa Meda. Contractors, shops and individual buyers can browse what we have, message us to confirm availability, and pick up from the warehouse."}
        </div>

      </div>
      <ImportRoute />
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-3 sm:grid-cols-3">
          {GALLERY.map(({ image, caption }) => (
            <figure key={caption} className="overflow-hidden rounded-xl border border-border bg-surface">
              <div className="relative aspect-4/3 bg-neutral-200">
                <Image
                  src={image}
                  alt={caption}
                  fill
                  placeholder="blur"
                  quality={55}
                  sizes="(min-width: 640px) 33vw, 100vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="px-4 py-3 text-sm font-medium">{caption}</figcaption>
            </figure>
          ))}
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
    </>
  );
}
