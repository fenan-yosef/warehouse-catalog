import { CanvasTexture, MeshMatcapMaterial, SRGBColorSpace } from "three";

/**
 * Matcaps drawn on a tiny canvas: lit-looking metal without lights, shadows or env maps.
 * Stops are [highlight, body, shadow, rim].
 */
function matcap([hi, body, shadow, rim]: [string, string, string, string]) {
  const size = 128;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(size * 0.36, size * 0.3, size * 0.02, size / 2, size / 2, size / 2);
  grad.addColorStop(0, hi);
  grad.addColorStop(0.3, body);
  grad.addColorStop(0.82, shadow);
  grad.addColorStop(1, rim);
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  // Soft horizon band: the reflection that makes metal read as metal.
  const band = g.createLinearGradient(0, size * 0.55, 0, size * 0.75);
  band.addColorStop(0, "rgba(255,255,255,0)");
  band.addColorStop(0.5, "rgba(255,255,255,0.18)");
  band.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = band;
  g.fillRect(0, 0, size, size);
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  return tex;
}

export function makeMaterials() {
  return {
    steel: new MeshMatcapMaterial({ matcap: matcap(["#ffffff", "#aab1b9", "#2b3036", "#7d8690"]) }),
    brass: new MeshMatcapMaterial({ matcap: matcap(["#fff4c8", "#cfa64a", "#4a3610", "#a07c2c"]) }),
    red: new MeshMatcapMaterial({ matcap: matcap(["#ff9c94", "#f20000", "#560000", "#b00000"]) }),
    dark: new MeshMatcapMaterial({ matcap: matcap(["#9a9a9a", "#2e2e2e", "#0b0b0b", "#444444"]) }),
  };
}

export type Materials = ReturnType<typeof makeMaterials>;
