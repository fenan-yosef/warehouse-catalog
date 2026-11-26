import { Vector3, type Group, type Object3D } from "three";
import type { Materials } from "./materials";
import { makePart, PART_KINDS } from "./parts";
import { seeded, type Stage } from "./stage";

type Spot = [fx: number, fy: number, z: number];

export type Floater = {
  obj: Group;
  base: Vector3;
  spin: Vector3;
  phase: number;
  speed: number;
  amp: number;
  land: Spot;
  port: Spot;
};

/**
 * Pipes and fittings drifting in place. Positions are stored as fractions of the visible
 * area so they re-flow on resize: `land` for wide canvases, `port` for tall/narrow ones.
 */
export function makeFloaters(
  parent: Object3D,
  m: Materials,
  stage: Stage,
  count: number,
  seed: number,
  spots: { land: (r: () => number, i: number) => Spot; port: (r: () => number, i: number) => Spot },
  size = 1,
): Floater[] {
  const r = seeded(seed);
  return Array.from({ length: count }, (_, i) => {
    const obj = makePart(PART_KINDS[i % PART_KINDS.length], m, stage.quality);
    obj.scale.setScalar(size * (0.75 + r() * 0.45));
    obj.rotation.set(r() * Math.PI, r() * Math.PI, r() * Math.PI);
    parent.add(obj);
    return {
      obj,
      base: new Vector3(),
      spin: new Vector3(r() - 0.5, r() - 0.5, r() - 0.5).multiplyScalar(0.7),
      phase: r() * Math.PI * 2,
      speed: 0.4 + r() * 0.5,
      amp: 0.12 + r() * 0.18,
      land: spots.land(r, i),
      port: spots.port(r, i),
    };
  });
}

export function layoutFloaters(stage: Stage, floaters: Floater[], portrait: boolean) {
  for (const f of floaters) {
    const [fx, fy, z] = portrait ? f.port : f.land;
    const v = stage.viewSize(z);
    f.base.set((fx * v.width) / 2, (fy * v.height) / 2, z);
    f.obj.position.copy(f.base);
  }
}

export function animateFloaters(floaters: Floater[], t: number, dt: number) {
  for (const f of floaters) {
    f.obj.rotation.x += f.spin.x * dt;
    f.obj.rotation.y += f.spin.y * dt;
    f.obj.rotation.z += f.spin.z * dt;
    f.obj.position.y = f.base.y + Math.sin(t * f.speed + f.phase) * f.amp;
  }
}
