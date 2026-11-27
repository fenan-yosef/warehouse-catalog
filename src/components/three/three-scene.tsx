"use client";

import { useEffect, useRef } from "react";
import type { MountScene, SceneHandle } from "./stage";

// Each scene (and three.js itself) is a separate chunk, fetched only when the canvas is near view.
const loaders = {
  hero: () => import("./scenes/hero").then((m) => m.mountHero),
  logo: () => import("./scenes/hero").then((m) => m.mountLogo),
  fittings: () => import("./scenes/fittings").then((m) => m.mountFittings),
  pin: () => import("./scenes/pin").then((m) => m.mountPin),
  route: () => import("./scenes/route").then((m) => m.mountRoute),
} satisfies Record<string, () => Promise<MountScene>>;

export type SceneName = keyof typeof loaders;

type NetworkInfo = { saveData?: boolean; effectiveType?: string };
type Nav = Navigator & { connection?: NetworkInfo; deviceMemory?: number };

// Safari has no requestIdleCallback.
const whenIdle = (fn: () => void) =>
  typeof window.requestIdleCallback === "function"
    ? window.requestIdleCallback(fn, { timeout: 2000 })
    : setTimeout(fn, 300);

/**
 * Decorative WebGL scene. Renders nothing until loaded, so the page never waits on it.
 * Skipped on data-saver / 2G, simplified on phones and weak devices, paused off-screen,
 * and drawn as a single still frame for reduced-motion users.
 */
export function ThreeScene({
  scene,
  className = "",
  labels,
}: {
  scene: SceneName;
  className?: string;
  /** Text drawn inside the scene, in the page language. Read once when the scene mounts. */
  labels?: Record<string, string>;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const labelsRef = useRef(labels);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const nav = navigator as Nav;
    const net = nav.connection?.effectiveType ?? "";
    if (nav.connection?.saveData || /2g$/.test(net)) return;
    // On 3G, let photos and everything else finish before fetching three.js.
    const afterPageLoad = (fn: () => void) =>
      net === "3g" && document.readyState !== "complete"
        ? window.addEventListener("load", () => whenIdle(fn), { once: true })
        : whenIdle(fn);

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const weak =
      (nav.hardwareConcurrency ?? 8) <= 4 ||
      (nav.deviceMemory ?? 8) <= 4 ||
      window.matchMedia("(pointer: coarse)").matches;

    let handle: SceneHandle | null = null;
    let visible = false;
    let requested = false;
    let cancelled = false;

    const sync = () => {
      if (!handle) return;
      if (visible && !document.hidden) handle.start();
      else handle.stop();
    };

    const load = async () => {
      try {
        const mount = await loaders[scene]();
        if (cancelled) return;
        handle = mount(canvas, { quality: weak ? "low" : "high", reduceMotion, labels: labelsRef.current });
        canvas.dataset.ready = "true";
        sync();
      } catch {
        // No WebGL or chunk failed to load: the page is complete without it.
      }
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !requested) {
          requested = true;
          afterPageLoad(() => void load());
        }
        sync();
      },
      { rootMargin: "200px" },
    );
    io.observe(canvas);
    document.addEventListener("visibilitychange", sync);

    return () => {
      cancelled = true;
      io.disconnect();
      document.removeEventListener("visibilitychange", sync);
      handle?.dispose();
    };
  }, [scene]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className={`pointer-events-none opacity-0 transition-opacity duration-1000 data-[ready=true]:opacity-100 ${className}`}
    />
  );
}
