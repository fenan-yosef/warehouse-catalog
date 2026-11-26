import { CircleAlert, CircleCheck, CircleX, type LucideIcon } from "lucide-react";
import type { Availability } from "@/lib/display";

const tone: Record<Availability["tone"], { cls: string; Icon: LucideIcon }> = {
  ok: { cls: "bg-ok-soft text-ok", Icon: CircleCheck },
  low: { cls: "bg-low-soft text-low", Icon: CircleAlert },
  out: { cls: "bg-out-soft text-out", Icon: CircleX },
};

export function AvailabilityBadge({ availability }: { availability: Availability }) {
  if (!availability.label) return null;
  const { cls, Icon } = tone[availability.tone];
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
      <Icon className="size-3.5" aria-hidden />
      {availability.label}
    </span>
  );
}
