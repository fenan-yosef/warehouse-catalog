import type { ContactLink } from "@/lib/contact";

const style: Record<ContactLink["kind"], string> = {
  telegram: "bg-[#229ED9] text-white hover:bg-[#1b86b9]",
  whatsapp: "bg-[#1f9d55] text-white hover:bg-[#188046]",
  phone: "border border-border bg-surface text-foreground hover:bg-background",
};

export function ContactButtons({
  links,
  size = "md",
}: {
  links: ContactLink[];
  size?: "md" | "lg";
}) {
  if (links.length === 0) {
    return <p className="text-sm text-muted">Contact details coming soon.</p>;
  }
  return (
    <div className="flex flex-wrap gap-2">
      {links.map((l) => (
        <a
          key={l.kind}
          href={l.href}
          target={l.kind === "phone" ? undefined : "_blank"}
          rel="noopener noreferrer"
          className={`btn ${size === "lg" ? "px-5 py-3 text-base" : ""} ${style[l.kind]}`}
        >
          {l.label}
        </a>
      ))}
    </div>
  );
}
