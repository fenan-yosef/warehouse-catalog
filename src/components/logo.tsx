/**
 * Tufte "T" mark, traced from the supplied logo. The red parts are fixed; the dark parts
 * use currentColor so the mark works on white (text-ink) and on black (text-white).
 */
export const LOGO_RED = "#f20000";

/** Polygons in the original 900×900 artwork space. Also used to extrude the 3D logo. */
export const LOGO_SHAPES = {
  red: [
    [160, 211, 727, 211, 690, 258, 207, 258],
    [213, 270, 462, 270, 372, 378, 372, 320, 262, 320],
  ],
  dark: [
    [376, 405, 433, 337, 433, 629, 376, 589],
    [475, 270, 680, 270, 640, 319, 512, 319, 512, 686, 449, 640, 449, 302],
  ],
} as const;

const pts = (p: readonly number[]) => p.join(",");

export function Logo({ className = "size-8", title }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="150 200 590 496"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <g fill={LOGO_RED}>
        {LOGO_SHAPES.red.map((p, i) => (
          <polygon key={i} points={pts(p)} />
        ))}
      </g>
      <g fill="currentColor">
        {LOGO_SHAPES.dark.map((p, i) => (
          <polygon key={i} points={pts(p)} />
        ))}
      </g>
    </svg>
  );
}
