import { Clock, MapPin, Navigation } from "lucide-react";
import type { Settings } from "@/db/schema";
import type { Dict } from "@/i18n/en";
import { mapEmbedUrl, mapLinkUrl } from "@/lib/contact";
import { MapFrame } from "./map-frame";

/**
 * `settings` = localized for display; `base` = original settings, so the map lookup always uses the
 * English address Google Maps understands.
 */
export function MapEmbed({ settings, base, t }: { settings: Settings; base: Settings; t: Dict }) {
  return (
    <div className="card overflow-hidden">
      <MapFrame src={mapEmbedUrl(base)} address={settings.warehouseAddress} showLabel={t.map.show} />
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
        <a href={mapLinkUrl(base)} target="_blank" rel="noopener noreferrer" className="btn-secondary">
          <Navigation className="size-4" aria-hidden />
          {t.map.directions}
        </a>
      </div>
    </div>
  );
}
