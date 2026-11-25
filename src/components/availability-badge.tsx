import type { Availability } from "@/lib/display";

const toneClass: Record<Availability["tone"], string> = {
  ok: "bg-ok-soft text-ok",
  low: "bg-low-soft text-low",
  out: "bg-out-soft text-out",
};

export function AvailabilityBadge({ availability }: { availability: Availability }) {
  if (!availability.label) return null;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${toneClass[availability.tone]}`}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {availability.label}
    </span>
  );
}
