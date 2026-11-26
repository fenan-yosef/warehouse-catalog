import { Fog } from "three";
import { animateFloaters, layoutFloaters, makeFloaters } from "../floaters";
import { makeMaterials } from "../materials";
import { createStage, type MountScene } from "../stage";

/** Page banners: a loose cluster of fittings on the right, away from the title. */
export const mountFittings: MountScene = (canvas, opts) =>
  createStage(canvas, opts, (stage) => {
    const { scene, pointer } = stage;
    const m = makeMaterials();
    scene.fog = new Fog(0x0b0b0b, 8, 18);
    const floaters = makeFloaters(scene, m, stage, stage.quality === "low" ? 5 : 9, 23, {
      land: (r) => [0.2 + r() * 0.8, -0.75 + r() * 1.5, -5 + r() * 5],
      port: (r) => [0.35 + r() * 0.65, -0.7 + r() * 1.4, -5 + r() * 3],
    });
    stage.onResize((w, h) => layoutFloaters(stage, floaters, w / h < 1.6));
    return (t, dt) => {
      scene.rotation.y = pointer.x * 0.05;
      animateFloaters(floaters, t, dt);
    };
  });
