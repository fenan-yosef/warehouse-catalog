import {
  BackSide,
  BufferGeometry,
  CanvasTexture,
  CatmullRomCurve3,
  Color,
  Float32BufferAttribute,
  Group,
  Mesh,
  MeshBasicMaterial,
  Points,
  PointsMaterial,
  Quaternion,
  RingGeometry,
  ShaderMaterial,
  SphereGeometry,
  Sprite,
  SpriteMaterial,
  SRGBColorSpace,
  TubeGeometry,
  Vector3,
} from "three";
import { LAND_MASK_B64 } from "../land-mask";
import { createStage, type MountScene } from "../stage";

const R = 0.85;
const DEG = Math.PI / 180;
const RED = 0xf20000;

function latLng(lat: number, lng: number, r = R) {
  const phi = (90 - lat) * DEG;
  const theta = (lng + 180) * DEG;
  return new Vector3(-Math.sin(phi) * Math.cos(theta), Math.cos(phi), Math.sin(phi) * Math.sin(theta)).multiplyScalar(r);
}

/** Label anchor: [x, y] of the sprite's "center" (0..1), so text sits beside the dot. */
const PLACES = {
  china: { lat: 31.2, lng: 121.5, label: "China", anchor: [0.5, -0.45] },
  turkey: { lat: 41, lng: 29, label: "Turkey", anchor: [0.5, -0.45] },
  djibouti: { lat: 11.6, lng: 43.1, label: "Djibouti", anchor: [-0.12, 0.5] },
  ashewa: { lat: 9.0, lng: 38.6, label: "Ashewa Meda", anchor: [1.1, 0.5] },
} as const;

function landMask() {
  const bin = atob(LAND_MASK_B64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return (lat: number, lng: number) => {
    const row = Math.min(179, Math.max(0, Math.floor(90 - lat)));
    const col = (((Math.floor(lng + 180) % 360) + 360) % 360);
    const i = row * 360 + col;
    return (bytes[i >> 3] >> (i & 7)) & 1;
  };
}

/** Great-circle arc lifted off the surface; higher for longer routes. */
function arc(a: Vector3, b: Vector3, lift: number) {
  const pts: Vector3[] = [];
  const ua = a.clone().normalize();
  const q = new Quaternion().setFromUnitVectors(ua, b.clone().normalize());
  const id = new Quaternion();
  for (let i = 0; i <= 40; i++) {
    const t = i / 40;
    const p = ua.clone().applyQuaternion(id.clone().slerp(q, t));
    pts.push(p.multiplyScalar(R * (1.004 + Math.sin(Math.PI * t) * lift)));
  }
  return new CatmullRomCurve3(pts);
}

function label(text: string) {
  const scale = 2; // draw at 2× for crisp text
  const h = 44 * scale;
  const c = document.createElement("canvas");
  const g = c.getContext("2d")!;
  const font = `600 ${26 * scale}px system-ui, -apple-system, "Segoe UI", sans-serif`;
  g.font = font;
  const w = Math.ceil(g.measureText(text).width) + 28 * scale;
  c.width = w;
  c.height = h;
  g.font = font;
  g.fillStyle = "rgba(255,255,255,0.95)";
  g.beginPath();
  g.roundRect(0, 0, w, h, 10 * scale);
  g.fill();
  g.fillStyle = "#111111";
  g.textBaseline = "middle";
  g.fillText(text, 14 * scale, h / 2 + scale);
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  const sprite = new Sprite(new SpriteMaterial({ map: tex, depthTest: false, depthWrite: false }));
  sprite.renderOrder = 10;
  const worldH = 0.075;
  sprite.scale.set((w / h) * worldH, worldH, 1);
  return sprite;
}

/** Fresnel-shaded ocean: dark centre, bright rim. */
function oceanMaterial() {
  return new ShaderMaterial({
    uniforms: { base: { value: new Color("#2a2d31") }, rim: { value: new Color("#9aa3ad") } },
    vertexShader: /* glsl */ `
      varying vec3 vN; varying vec3 vV;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 base; uniform vec3 rim;
      varying vec3 vN; varying vec3 vV;
      void main() {
        float f = pow(1.0 - max(dot(vN, vV), 0.0), 2.2);
        gl_FragColor = vec4(mix(base, rim, f), 1.0);
      }`,
  });
}

const HALO = 1.18; // halo radius relative to the globe

/** Soft halo just outside the globe: brightest at the globe's edge, fading to nothing. */
function atmosphereMaterial() {
  // On the halo's back faces, -dot(n, v) runs 0 at its outer edge → this value at the globe's edge.
  const edge = Math.sqrt(1 - 1 / (HALO * HALO)).toFixed(4);
  return new ShaderMaterial({
    side: BackSide,
    transparent: true,
    depthWrite: false,
    vertexShader: /* glsl */ `
      varying vec3 vN; varying vec3 vV;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vN = normalize(normalMatrix * normal);
        vV = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      varying vec3 vN; varying vec3 vV;
      void main() {
        float f = pow(clamp(-dot(vN, vV) / ${edge}, 0.0, 1.0), 2.5);
        gl_FragColor = vec4(1.0, 0.95, 0.93, f * 0.38);
      }`,
  });
}

/** Globe with live shipping routes: China & Turkey → Djibouti → Ashewa Meda. */
export const mountRoute: MountScene = (canvas, opts) =>
  createStage(canvas, opts, (stage) => {
    const { scene, camera, pointer } = stage;
    const low = stage.quality === "low";
    camera.position.set(0, 0, 3.4);

    // tilt (X) > globe (Y): keeps north up while it turns.
    const CENTRE = { lat: 20, lng: 64 };
    const tilt = new Group();
    tilt.rotation.x = CENTRE.lat * DEG;
    const globe = new Group();
    const baseY = -(CENTRE.lng + 90) * DEG;
    globe.rotation.y = baseY;
    tilt.add(globe);
    scene.add(tilt);

    const seg = low ? 32 : 48;
    globe.add(new Mesh(new SphereGeometry(R * 0.992, seg, seg / 2), oceanMaterial()));
    scene.add(new Mesh(new SphereGeometry(R * HALO, seg, seg / 2), atmosphereMaterial()));

    // Land: an even spread of points (Fibonacci sphere), kept only where there's land.
    const isLand = landMask();
    const n = low ? 9000 : 16000;
    const golden = Math.PI * (3 - Math.sqrt(5));
    const pos: number[] = [];
    for (let i = 0; i < n; i++) {
      const y = 1 - (i / (n - 1)) * 2;
      const lat = Math.asin(y) / DEG;
      const lng = ((((golden * i) / DEG) % 360) + 540) % 360 - 180;
      if (!isLand(lat, lng)) continue;
      const p = latLng(lat, lng);
      pos.push(p.x, p.y, p.z);
    }
    const dots = new BufferGeometry();
    dots.setAttribute("position", new Float32BufferAttribute(pos, 3));
    globe.add(
      new Points(dots, new PointsMaterial({ color: 0xeeeeee, size: low ? 0.013 : 0.011, sizeAttenuation: true })),
    );

    // Places: dot, pulse ring, label.
    const at = Object.fromEntries(
      Object.entries(PLACES).map(([k, p]) => [k, latLng(p.lat, p.lng)]),
    ) as Record<keyof typeof PLACES, Vector3>;
    const red = new MeshBasicMaterial({ color: RED });
    const pulses: Mesh[] = [];
    for (const [key, p] of Object.entries(PLACES) as [keyof typeof PLACES, (typeof PLACES)[keyof typeof PLACES]][]) {
      const v = at[key];
      const dot = new Mesh(new SphereGeometry(key === "ashewa" ? 0.022 : 0.016, 12, 8), red);
      dot.position.copy(v);
      const ring = new Mesh(
        new RingGeometry(0.024, 0.032, 32),
        new MeshBasicMaterial({ color: RED, transparent: true, depthWrite: false }),
      );
      ring.position.copy(v).multiplyScalar(1.003);
      ring.lookAt(v.clone().multiplyScalar(2));
      pulses.push(ring);
      const tag = label(opts.labels?.[key] ?? p.label);
      tag.center.set(p.anchor[0], p.anchor[1]);
      tag.position.copy(v).multiplyScalar(1.02);
      globe.add(dot, ring, tag);
    }

    // Routes: a dim permanent line, plus a bright pulse with a white head travelling along it.
    const radial = low ? 4 : 6;
    const SEGS = 80;
    const TRAIL = 0.28;
    const routes = [
      { curve: arc(at.china, at.djibouti, 0.24), offset: 0, dur: 3.6 },
      { curve: arc(at.turkey, at.djibouti, 0.14), offset: 1.3, dur: 2.8 },
      { curve: arc(at.djibouti, at.ashewa, 0.06), offset: 0.6, dur: 1.6 },
    ].map((r) => {
      globe.add(
        new Mesh(
          new TubeGeometry(r.curve, SEGS, 0.0045, radial, false),
          new MeshBasicMaterial({ color: RED, transparent: true, opacity: 0.35, depthWrite: false }),
        ),
      );
      const geo = new TubeGeometry(r.curve, SEGS, 0.0075, radial, false);
      const trail = new Mesh(geo, red);
      const head = new Mesh(new SphereGeometry(0.014, 12, 8), new MeshBasicMaterial({ color: 0xffffff }));
      globe.add(trail, head);
      return { ...r, geo, trail, head };
    });

    stage.onResize((w, h) => {
      camera.position.z = w / h < 1 ? 3.4 / Math.max(0.6, w / h) : 3.4;
    });

    const per = radial * 6; // indices per tube segment
    return (t) => {
      globe.rotation.y = baseY + Math.sin(t * 0.22) * 0.2 + pointer.x * 0.2;
      tilt.rotation.x = CENTRE.lat * DEG - pointer.y * 0.1;

      for (const r of routes) {
        if (stage.reduceMotion) {
          r.trail.visible = r.head.visible = false;
          continue;
        }
        // Head runs from just before the start to just past the end, so the trail eases in and out.
        const u = (((t + r.offset) / r.dur) % (1 + TRAIL)) - TRAIL / 2;
        const head = Math.min(1, Math.max(0, u));
        const tail = Math.min(1, Math.max(0, u - TRAIL));
        const a = Math.floor(tail * SEGS);
        const b = Math.ceil(head * SEGS);
        r.geo.setDrawRange(a * per, Math.max(0, b - a) * per);
        r.head.visible = u >= 0 && u <= 1;
        if (r.head.visible) r.head.position.copy(r.curve.getPointAt(head));
      }

      pulses.forEach((ring, i) => {
        const k = stage.reduceMotion ? 0.3 : (t * 0.6 + i * 0.25) % 1;
        ring.scale.setScalar(1 + k * 1.8);
        (ring.material as MeshBasicMaterial).opacity = (1 - k) * 0.9;
      });
    };
  });
