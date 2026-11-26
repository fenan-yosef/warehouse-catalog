import { Anchor, Factory, Truck } from "lucide-react";
import { ThreeScene } from "@/components/three/three-scene";

const STEPS = [
  { Icon: Factory, title: "Sourced from manufacturers", body: "We buy directly from factories in China and Turkey." },
  { Icon: Anchor, title: "Shipped to Djibouti", body: "Goods travel by sea to the port of Djibouti." },
  { Icon: Truck, title: "Stocked in Ashewa Meda", body: "Then by road to our warehouse, ready for you to collect." },
];

/** Black band with the animated route globe: what "importer" means, at a glance. */
export function ImportRoute() {
  return (
    <section className="bg-ink text-white">
      <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-14 lg:grid-cols-2">
        <div>
          <h2 className="text-2xl font-semibold sm:text-3xl">From the factory to Ashewa Meda</h2>
          <ol className="mt-8 space-y-6">
            {STEPS.map(({ Icon, title, body }, i) => (
              <li key={title} className="flex gap-4">
                <span className="relative flex size-11 shrink-0 items-center justify-center rounded-lg bg-brand">
                  <Icon className="size-5" aria-hidden />
                  <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-white text-xs font-semibold text-ink">
                    {i + 1}
                  </span>
                </span>
                <div>
                  <p className="font-semibold">{title}</p>
                  <p className="mt-1 text-sm text-ink-muted">{body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div className="relative mx-auto aspect-square w-full max-w-md">
          <ThreeScene scene="route" className="absolute inset-0 size-full" />
        </div>
      </div>
    </section>
  );
}
