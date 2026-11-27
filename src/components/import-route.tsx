import { Anchor, Factory, Truck } from "lucide-react";
import type { Dict } from "@/i18n/en";
import { ThreeScene } from "@/components/three/three-scene";

const ICONS = [Factory, Anchor, Truck];

/** Black band with the animated route globe: what "importer" means, at a glance. */
export function ImportRoute({ t }: { t: Dict }) {
  return (
    <section className="bg-ink text-white">
      <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-14 lg:grid-cols-2">
        <div>
          <h2 className="text-2xl font-semibold sm:text-3xl">{t.route.title}</h2>
          <ol className="mt-8 space-y-6">
            {t.route.steps.map(({ title, body }, i) => {
              const Icon = ICONS[i] ?? Truck;
              return (
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
              );
            })}
          </ol>
        </div>
        <div className="relative mx-auto aspect-square w-full max-w-md">
          <ThreeScene scene="route" labels={t.route.places} className="absolute inset-0 size-full" />
        </div>
      </div>
    </section>
  );
}
