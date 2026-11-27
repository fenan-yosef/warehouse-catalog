import {
  Material,
  Mesh,
  PerspectiveCamera,
  Scene,
  Texture,
  WebGLRenderer,
  type Object3D,
} from "three";

export type Quality = "low" | "high";
export type StageOptions = {
  quality: Quality;
  reduceMotion: boolean;
  /** Text drawn inside a scene (e.g. place names on the globe), in the page language. */
  labels?: Record<string, string>;
};
export type SceneHandle = { start(): void; stop(): void; dispose(): void };
export type MountScene = (canvas: HTMLCanvasElement, opts: StageOptions) => SceneHandle;

export type Stage = {
  scene: Scene;
  camera: PerspectiveCamera;
  quality: Quality;
  reduceMotion: boolean;
  /** Smoothed pointer position in -1..1 (0 when reduced motion). */
  pointer: { x: number; y: number };
  width: number;
  height: number;
  /** Visible world width/height at a given z (camera looks down -z). */
  viewSize(z?: number): { width: number; height: number };
  onResize(fn: (w: number, h: number) => void): void;
};

/** A frame callback: t = seconds since start, dt = seconds since last frame. */
export type Frame = (t: number, dt: number) => void;

/**
 * Shared renderer setup for every 3D scene: transparent canvas, capped pixel ratio,
 * optional 30fps cap on weak devices, render-on-demand when paused, full disposal.
 */
export function createStage(
  canvas: HTMLCanvasElement,
  opts: StageOptions,
  setup: (stage: Stage) => Frame,
): SceneHandle {
  const low = opts.quality === "low";
  const renderer = new WebGLRenderer({
    canvas,
    alpha: true,
    antialias: !low,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, low ? 1.25 : 1.75));
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const camera = new PerspectiveCamera(35, 1, 0.1, 100);
  camera.position.set(0, 0, 10);

  const target = { x: 0, y: 0 };
  const resizeFns: Array<(w: number, h: number) => void> = [];
  const stage: Stage = {
    scene,
    camera,
    quality: opts.quality,
    reduceMotion: opts.reduceMotion,
    pointer: { x: 0, y: 0 },
    width: 1,
    height: 1,
    viewSize(z = 0) {
      const dist = Math.max(0.001, camera.position.z - z);
      const height = 2 * Math.tan((camera.fov * Math.PI) / 360) * dist;
      return { width: height * camera.aspect, height };
    },
    onResize(fn) {
      resizeFns.push(fn);
    },
  };

  const frame = setup(stage);

  let t = 0;
  let raf = 0;
  let running = false;
  let lastNow = 0;
  const minFrameMs = low ? 1000 / 30 : 0;

  const render = (dt: number) => {
    frame(t, dt);
    renderer.render(scene, camera);
  };

  const resize = () => {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    stage.width = w;
    stage.height = h;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    for (const fn of resizeFns) fn(w, h);
    if (!running) render(0);
  };
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  const onPointer = (e: PointerEvent) => {
    target.x = (e.clientX / window.innerWidth) * 2 - 1;
    target.y = -((e.clientY / window.innerHeight) * 2 - 1);
  };
  if (!opts.reduceMotion) window.addEventListener("pointermove", onPointer, { passive: true });

  const tick = (now: number) => {
    raf = requestAnimationFrame(tick);
    const elapsed = now - lastNow;
    if (elapsed < minFrameMs - 1) return;
    lastNow = now;
    const dt = Math.min(elapsed, 100) / 1000;
    t += dt;
    const k = Math.min(1, dt * 3);
    stage.pointer.x += (target.x - stage.pointer.x) * k;
    stage.pointer.y += (target.y - stage.pointer.y) * k;
    render(dt);
  };

  resize();

  const stop = () => {
    running = false;
    cancelAnimationFrame(raf);
  };

  return {
    start() {
      if (running || opts.reduceMotion) return;
      running = true;
      lastNow = performance.now();
      raf = requestAnimationFrame(tick);
    },
    stop,
    dispose() {
      stop();
      ro.disconnect();
      window.removeEventListener("pointermove", onPointer);
      disposeTree(scene);
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}

function disposeTree(root: Object3D) {
  const materials = new Set<Material>();
  root.traverse((o) => {
    const m = o as Mesh;
    m.geometry?.dispose();
    if (m.material) for (const mat of [m.material].flat()) materials.add(mat);
  });
  for (const mat of materials) {
    for (const v of Object.values(mat)) if (v instanceof Texture) v.dispose();
    mat.dispose();
  }
}

/** Small deterministic PRNG so scene layouts are stable between visits. */
export function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let x = a;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}
