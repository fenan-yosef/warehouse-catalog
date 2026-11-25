import type { Settings } from "@/db/schema";

export type ContactSettings = Pick<
  Settings,
  | "phones"
  | "telegramUsername"
  | "whatsappNumber"
  | "showPhone"
  | "showTelegram"
  | "showWhatsapp"
>;

export interface ContactLink {
  kind: "telegram" | "whatsapp" | "phone";
  label: string;
  href: string;
}

/** Builds the order/contact buttons, optionally prefilled with a product name. */
export function getContactLinks(s: ContactSettings, productName?: string): ContactLink[] {
  const message = productName
    ? `Hello, I'm interested in "${productName}". Is it available?`
    : "Hello, I'd like to ask about your products.";
  const links: ContactLink[] = [];

  const tg = s.telegramUsername?.replace(/^@/, "").trim();
  if (s.showTelegram && tg) {
    links.push({
      kind: "telegram",
      label: productName ? "Order on Telegram" : "Telegram",
      href: `https://t.me/${encodeURIComponent(tg)}?text=${encodeURIComponent(message)}`,
    });
  }

  const wa = s.whatsappNumber?.replace(/[^\d]/g, "");
  if (s.showWhatsapp && wa) {
    links.push({
      kind: "whatsapp",
      label: productName ? "Order on WhatsApp" : "WhatsApp",
      href: `https://wa.me/${wa}?text=${encodeURIComponent(message)}`,
    });
  }

  const phone = s.phones[0]?.trim();
  if (s.showPhone && phone) {
    links.push({ kind: "phone", label: `Call ${phone}`, href: `tel:${phone.replace(/\s+/g, "")}` });
  }

  return links;
}

export function mapEmbedUrl(s: Pick<Settings, "mapLat" | "mapLng" | "warehouseAddress">): string {
  const q =
    s.mapLat != null && s.mapLng != null ? `${s.mapLat},${s.mapLng}` : s.warehouseAddress;
  return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&z=15&output=embed`;
}

export function mapLinkUrl(s: Pick<Settings, "mapLat" | "mapLng" | "warehouseAddress">): string {
  const q =
    s.mapLat != null && s.mapLng != null ? `${s.mapLat},${s.mapLng}` : s.warehouseAddress;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
}
