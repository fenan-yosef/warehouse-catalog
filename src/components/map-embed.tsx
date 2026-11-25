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
      <div className="flex flex-wrap items-center justify-between gap-2 p-4">
        <div>
          <p className="font-medium">{settings.warehouseAddress}</p>
          <p className="text-sm text-muted">{settings.openingHours}</p>
        </div>
        <a href={mapLinkUrl(settings)} target="_blank" rel="noopener noreferrer" className="btn-secondary">
          Get directions
        </a>
      </div>
    </div>
  );
}
