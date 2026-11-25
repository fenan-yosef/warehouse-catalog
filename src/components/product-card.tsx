import Link from "next/link";
import type { Settings } from "@/db/schema";
import type { PublicProduct } from "@/lib/queries";
import { getAvailability, getPriceText } from "@/lib/display";
import { AvailabilityBadge } from "./availability-badge";
import { ProductImage } from "./product-image";

export function ProductCard({ product, settings }: { product: PublicProduct; settings: Settings }) {
  const availability = getAvailability(product.quantity, product.unit, settings);
  return (
    <Link
      href={`/products/${product.slug}`}
      className="card group flex flex-col overflow-hidden transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-square overflow-hidden bg-background">
        <ProductImage
          url={product.imageUrl}
          name={product.name}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <h3 className="line-clamp-2 text-sm font-medium group-hover:text-brand">{product.name}</h3>
        <p className="text-sm text-muted">{getPriceText(product.priceEtb, product.unit, settings)}</p>
        <div className="mt-auto pt-1">
          <AvailabilityBadge availability={availability} />
        </div>
      </div>
    </Link>
  );
}
