import { Clock, MapPin, Navigation } from "lucide-react";
import type { Settings } from "@/db/schema";
import { mapEmbedUrl, mapLinkUrl } from "@/lib/contact";

export function MapEmbed({ settings }: { settings: Settings }) {
  return (
    <div className="card overflow-hidden">
      <iframe
        title="Warehouse location"
        src={mapEmbedUrl(settings)}
        className="h-72 w-full border-0 sm:h-96"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      <div className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="space-y-1">
          <p className="flex items-center gap-2 font-medium">
            <MapPin className="size-4 shrink-0 text-brand" aria-hidden />
            {settings.warehouseAddress}
          </p>
          <p className="flex items-center gap-2 text-sm text-muted">
            <Clock className="size-4 shrink-0" aria-hidden />
            {settings.openingHours}
          </p>
        </div>
        <a href={mapLinkUrl(settings)} target="_blank" rel="noopener noreferrer" className="btn-secondary">
          <Navigation className="size-4" aria-hidden />
          Get directions
        </a>
      </div>
    </div>
  );
}
