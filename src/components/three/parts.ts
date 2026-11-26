import {
  BoxGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  Group,
  LatheGeometry,
  Mesh,
  Shape,
  SphereGeometry,
  TorusGeometry,
  Vector2,
  type Material,
} from "three";
import { LOGO_SHAPES } from "@/components/logo";
import type { Materials } from "./materials";
import type { Quality } from "./stage";

/** Hollow tube: a rectangle profile spun around Y. */
function pipeGeometry(length: number, outer: number, inner: number, segs: number) {
  const h = length / 2;
  const profile = [
    new Vector2(inner, -h),
    new Vector2(outer, -h),
    new Vector2(outer, h),
    new Vector2(inner, h),
    new Vector2(inner, -h),
  ];
  return new LatheGeometry(profile, segs);
}

export const PART_KINDS = ["pipe", "elbow", "flange", "valve", "tee", "nut", "longPipe"] as const;
export type PartKind = (typeof PART_KINDS)[number];

/** Pipes and fittings, built from primitives. Each part is roughly 1–2 units across. */
export function makePart(kind: PartKind, m: Materials, quality: Quality): Group {
  const s = quality === "low" ? 12 : 24;
  const g = new Group();
  const add = (geo: ConstructorParameters<typeof Mesh>[0], mat: Material, fn?: (mesh: Mesh) => void) => {
    const mesh = new Mesh(geo, mat);
    fn?.(mesh);
    g.add(mesh);
    return mesh;
  };

  switch (kind) {
    case "pipe":
      add(pipeGeometry(2.2, 0.32, 0.25, s), m.steel);
      break;
    case "longPipe":
      add(pipeGeometry(3.4, 0.18, 0.13, s), m.steel);
      break;
    case "elbow":
      add(new TorusGeometry(0.6, 0.22, s / 2, s, Math.PI / 2), m.brass);
      add(pipeGeometry(0.18, 0.27, 0.2, s), m.brass, (x) => x.position.set(0.6, -0.09, 0));
      add(pipeGeometry(0.18, 0.27, 0.2, s), m.brass, (x) => {
        x.rotation.z = Math.PI / 2;
        x.position.set(-0.09, 0.6, 0);
      });
      break;
    case "flange": {
      const profile = [
        new Vector2(0.26, -0.12),
        new Vector2(0.72, -0.12),
        new Vector2(0.72, 0.02),
        new Vector2(0.4, 0.02),
        new Vector2(0.4, 0.32),
        new Vector2(0.26, 0.32),
        new Vector2(0.26, -0.12),
      ];
      add(new LatheGeometry(profile, s), m.steel);
      break;
    }
    case "valve":
      add(new SphereGeometry(0.42, s, s / 2), m.brass);
      add(pipeGeometry(1.5, 0.24, 0.17, s), m.brass, (x) => (x.rotation.z = Math.PI / 2));
      add(new CylinderGeometry(0.06, 0.06, 0.35, 8), m.steel, (x) => (x.position.y = 0.5));
      add(new BoxGeometry(0.9, 0.08, 0.16), m.red, (x) => x.position.set(0.3, 0.68, 0));
      break;
    case "tee":
      add(pipeGeometry(1.6, 0.26, 0.19, s), m.steel, (x) => (x.rotation.z = Math.PI / 2));
      add(pipeGeometry(0.8, 0.26, 0.19, s), m.steel, (x) => (x.position.y = 0.4));
      break;
    case "nut":
      add(new CylinderGeometry(0.38, 0.38, 0.3, 6), m.brass);
      break;
  }
  return g;
}

/** Logo artwork is 900×900; this maps it to ~5.7 world units wide, centred. */
const toWorld = (x: number, y: number) => new Vector2((x - 443.5) / 100, -(y - 448.5) / 100);
export const LOGO_WORLD_WIDTH = 5.7;

function shapesOf(polys: readonly (readonly number[])[]) {
  return polys.map((p) => {
    const pts: Vector2[] = [];
    for (let i = 0; i < p.length; i += 2) pts.push(toWorld(p[i], p[i + 1]));
    return new Shape(pts);
  });
}

/** The "T" mark, extruded. `darkMaterial` lets it read on black (steel) or white (dark). */
export function makeLogo(m: Materials, quality: Quality, darkMaterial: Material = m.steel): Group {
  const opts = {
    depth: 0.5,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.04,
    bevelSegments: quality === "low" ? 1 : 2,
    curveSegments: 1,
  };
  const red = new ExtrudeGeometry(shapesOf(LOGO_SHAPES.red), opts);
  const dark = new ExtrudeGeometry(shapesOf(LOGO_SHAPES.dark), opts);
  red.translate(0, 0, -0.25);
  dark.translate(0, 0, -0.25);
  const g = new Group();
  g.add(new Mesh(red, m.red), new Mesh(dark, darkMaterial));
  return g;
}
