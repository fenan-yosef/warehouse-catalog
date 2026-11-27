import Link from "next/link";
import type { Settings } from "@/db/schema";
import { localePath, type Lang } from "@/i18n/config";
import type { Dict } from "@/i18n/en";
import type { PublicProduct } from "@/lib/queries";
import { getAvailability, getPriceText } from "@/lib/display";
import { AvailabilityBadge } from "./availability-badge";
import { ProductImage } from "./product-image";

/** Pass the product and settings already localized for `lang`. */
export function ProductCard({
  product,
  settings,
  t,
  lang,
}: {
  product: PublicProduct;
  settings: Settings;
  t: Dict;
  lang: Lang;
}) {
  const availability = getAvailability(product.quantity, product.unit, settings, t);
  return (
    <Link
      href={localePath(lang, `/products/${product.slug}`)}
      className="card group flex flex-col overflow-hidden transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-square overflow-hidden bg-background">
        <ProductImage
          url={product.imageUrl}
          name={product.name}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          emptyLabel={t.product.noPhoto}
        />
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <h3 className="line-clamp-2 text-sm font-medium group-hover:text-brand">{product.name}</h3>
        <p className="text-sm text-muted">{getPriceText(product.priceEtb, product.unit, settings, t)}</p>
        <div className="mt-auto pt-1">
          <AvailabilityBadge availability={availability} />
        </div>
      </div>
    </Link>
  );
}
