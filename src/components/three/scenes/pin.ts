import {
  CircleGeometry,
  ConeGeometry,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  RingGeometry,
  SphereGeometry,
} from "three";
import { makeMaterials } from "../materials";
import { createStage, type MountScene } from "../stage";

/** Contact banner: a red map pin hovering over its spot, with ripples on the ground. */
export const mountPin: MountScene = (canvas, opts) =>
  createStage(canvas, opts, (stage) => {
    const { scene, pointer } = stage;
    const m = makeMaterials();
    const s = stage.quality === "low" ? 16 : 32;

    const root = new Group();
    root.rotation.x = 0.35;
    scene.add(root);

    const pin = new Group();
    const head = new Mesh(new SphereGeometry(0.5, s, s / 2), m.red);
    head.position.y = 1.25;
    const tip = new Mesh(new ConeGeometry(0.43, 1.05, s), m.red);
    tip.rotation.x = Math.PI;
    tip.position.y = 0.6;
    const hole = new Mesh(new SphereGeometry(0.19, s / 2, s / 4), new MeshBasicMaterial({ color: 0xffffff }));
    hole.position.set(0, 1.27, 0.4);
    hole.scale.z = 0.35;
    pin.add(head, tip, hole);
    root.add(pin);

    const shadow = new Mesh(
      new CircleGeometry(0.45, s),
      new MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.45, depthWrite: false }),
    );
    shadow.rotation.x = -Math.PI / 2;
    root.add(shadow);

    const ringMat = () =>
      new MeshBasicMaterial({ color: 0xf20000, transparent: true, depthWrite: false, side: DoubleSide });
    const rings = Array.from({ length: 3 }, () => {
      const ring = new Mesh(new RingGeometry(0.92, 1, s * 2), ringMat());
      ring.rotation.x = -Math.PI / 2;
      root.add(ring);
      return ring;
    });

    stage.onResize(() => {
      const v = stage.viewSize(0);
      // Pin + bob is ~2.3 units tall; keep it inside the banner with room to spare.
      root.scale.setScalar(Math.min(v.height * 0.25, v.width * 0.2));
      root.position.set(v.width * 0.3, -v.height * 0.36, 0);
    });

    return (t) => {
      const bob = (Math.sin(t * 2) + 1) / 2;
      pin.position.y = 0.15 + bob * 0.35;
      pin.rotation.y = Math.sin(t * 0.9) * 0.6 + pointer.x * 0.3;
      shadow.scale.setScalar(1 - bob * 0.35);
      (shadow.material as MeshBasicMaterial).opacity = 0.45 - bob * 0.2;
      rings.forEach((ring, i) => {
        const k = (t * 0.45 + i / rings.length) % 1;
        ring.scale.setScalar(0.25 + k * 1.6);
        (ring.material as MeshBasicMaterial).opacity = stage.reduceMotion ? (i === 0 ? 0.6 : 0) : (1 - k) * 0.7;
      });
    };
  });
