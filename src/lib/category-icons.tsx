import {
  Award,
  Bath,
  Bolt,
  CircleDot,
  Cylinder,
  Droplets,
  Factory,
  Flame,
  Globe,
  Hammer,
  Layers,
  Package,
  ShowerHead,
  Truck,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";

/** Icons the admin can pick for a category. Keys are stored in categories.icon. */
export const CATEGORY_ICONS = {
  package: { label: "Box / general", Icon: Package },
  wrench: { label: "Fittings / wrench", Icon: Wrench },
  pipe: { label: "Pipe", Icon: Cylinder },
  droplets: { label: "Water / valves", Icon: Droplets },
  shower: { label: "Shower", Icon: ShowerHead },
  bath: { label: "Bathroom / sanitary", Icon: Bath },
  ring: { label: "Gaskets / seals", Icon: CircleDot },
  bolt: { label: "Bolts / fasteners", Icon: Bolt },
  layers: { label: "Metal sheets", Icon: Layers },
  hammer: { label: "Tools", Icon: Hammer },
  flame: { label: "Heating / gas", Icon: Flame },
  zap: { label: "Electrical", Icon: Zap },
  factory: { label: "Industrial", Icon: Factory },
  globe: { label: "Imported / country", Icon: Globe },
  award: { label: "Brand", Icon: Award },
  truck: { label: "Bulk / delivery", Icon: Truck },
} as const satisfies Record<string, { label: string; Icon: LucideIcon }>;

export type CategoryIconKey = keyof typeof CATEGORY_ICONS;

const GUESSES: Array<[RegExp, CategoryIconKey]> = [
  [/fitting|elbow|tee|coupl|union/i, "wrench"],
  [/pipe|tube|ppr|pvc/i, "pipe"],
  [/shower/i, "shower"],
  [/bath|toilet|sanit|basin|sink/i, "bath"],
  [/valve|tap|faucet|mixer|water/i, "droplets"],
  [/gasket|seal|packing|parking|o-?ring/i, "ring"],
  [/bolt|screw|nut|fasten/i, "bolt"],
  [/metal|steel|iron|sheet|alumin|copper/i, "layers"],
  [/tool|hardware/i, "hammer"],
  [/gas|heat|boiler/i, "flame"],
  [/electr|cable|wire/i, "zap"],
  [/turk|china|chinese|import|italy|india/i, "globe"],
  [/brand|dragon|gold/i, "award"],
];

export function guessCategoryIcon(name: string): CategoryIconKey {
  return GUESSES.find(([re]) => re.test(name))?.[1] ?? "package";
}

export function categoryIcon(key: string | null | undefined, name = ""): LucideIcon {
  const k = (key && key in CATEGORY_ICONS ? key : guessCategoryIcon(name)) as CategoryIconKey;
  return CATEGORY_ICONS[k].Icon;
}
