import { Fog, Group } from "three";
import { animateFloaters, layoutFloaters, makeFloaters } from "../floaters";
import { makeMaterials } from "../materials";
import { LOGO_WORLD_WIDTH, makeLogo } from "../parts";
import { createStage, type MountScene } from "../stage";

/** Home hero: the extruded logo on the right, pipes and fittings drifting around it. */
export const mountHero: MountScene = (canvas, opts) =>
  createStage(canvas, opts, (stage) => {
    const { scene, pointer } = stage;
    const m = makeMaterials();
    scene.fog = new Fog(0x0b0b0b, 9, 21);

    const logo = makeLogo(m, stage.quality);
    scene.add(logo);

    const parts = new Group();
    scene.add(parts);
    const floaters = makeFloaters(parts, m, stage, stage.quality === "low" ? 6 : 12, 7, {
      // Wide screens: mostly right of the headline, some far back for depth.
      land: (r) => [0.08 + r() * 0.8, -0.8 + r() * 1.6, -8 + r() * 7.5],
      // Phones: hug the edges, pushed back so they stay behind the text.
      port: (r, i) => [(i % 2 ? 1 : -1) * (0.55 + r() * 0.45), -0.95 + r() * 1.9, -6 + r() * 4],
    });

    let portrait = false;
    stage.onResize((w, h) => {
      portrait = w / h < 1.1;
      const v = stage.viewSize(0);
      logo.visible = !portrait;
      logo.scale.setScalar(Math.min(v.width * 0.26, v.height * 0.62 * 1.2) / LOGO_WORLD_WIDTH);
      logo.position.set(v.width * 0.27, 0, 0);
      layoutFloaters(stage, floaters, portrait);
    });

    return (t, dt) => {
      logo.rotation.y = Math.sin(t * 0.45) * 0.5 + pointer.x * 0.35;
      logo.rotation.x = Math.sin(t * 0.3) * 0.06 - pointer.y * 0.15;
      logo.position.y = Math.sin(t * 0.8) * 0.12;
      parts.rotation.y = pointer.x * 0.06;
      parts.rotation.x = -pointer.y * 0.04;
      animateFloaters(floaters, t, dt);
    };
  });

/** Sign-in panel: the logo on its own with a few fittings. */
export const mountLogo: MountScene = (canvas, opts) =>
  createStage(canvas, opts, (stage) => {
    const { scene, pointer } = stage;
    const m = makeMaterials();
    scene.fog = new Fog(0x0b0b0b, 9, 20);
    const logo = makeLogo(m, stage.quality);
    scene.add(logo);
    const floaters = makeFloaters(scene, m, stage, stage.quality === "low" ? 3 : 5, 11, {
      land: (r, i) => [(i % 2 ? 1 : -1) * (0.45 + r() * 0.4), -0.85 + r() * 1.7, -5 + r() * 3],
      port: (r, i) => [(i % 2 ? 1 : -1) * (0.45 + r() * 0.4), -0.85 + r() * 1.7, -5 + r() * 3],
    });
    stage.onResize(() => {
      const v = stage.viewSize(0);
      logo.scale.setScalar(Math.min(v.width * 0.6, v.height * 0.5 * 1.2) / LOGO_WORLD_WIDTH);
      layoutFloaters(stage, floaters, false);
    });
    return (t, dt) => {
      logo.rotation.y = t * 0.5 + pointer.x * 0.3;
      logo.position.y = Math.sin(t * 0.8) * 0.12;
      animateFloaters(floaters, t, dt);
    };
  });
