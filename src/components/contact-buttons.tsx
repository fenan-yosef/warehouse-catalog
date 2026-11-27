import { MessageCircle, Phone, Send, type LucideIcon } from "lucide-react";
import type { ContactLink } from "@/lib/contact";

const style: Record<ContactLink["kind"], string> = {
  telegram: "bg-[#229ED9] text-white hover:bg-[#1b86b9]",
  whatsapp: "bg-[#1f9d55] text-white hover:bg-[#188046]",
  phone: "border border-border bg-surface text-foreground hover:bg-background",
};

export const contactIcon: Record<ContactLink["kind"], LucideIcon> = {
  telegram: Send,
  whatsapp: MessageCircle,
  phone: Phone,
};

export function ContactButtons({
  links,
  emptyText,
  size = "md",
}: {
  links: ContactLink[];
  emptyText: string;
  size?: "md" | "lg";
}) {
  if (links.length === 0) {
    return <p className="text-sm text-muted">{emptyText}</p>;
  }
  return (
    <div className="flex flex-wrap gap-2">
      {links.map((l) => {
        const Icon = contactIcon[l.kind];
        return (
          <a
            key={l.kind}
            href={l.href}
            target={l.kind === "phone" ? undefined : "_blank"}
            rel="noopener noreferrer"
            className={`btn ${size === "lg" ? "px-5 py-3 text-base" : ""} ${style[l.kind]}`}
          >
            <Icon className={size === "lg" ? "size-5" : "size-4"} aria-hidden />
            {l.label}
          </a>
        );
      })}
    </div>
  );
}
