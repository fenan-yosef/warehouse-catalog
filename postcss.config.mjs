// Turbopack (default) runs Tailwind through @tailwindcss/turbopack (see next.config.ts).
// This PostCSS config only kicks in for `--webpack` builds, e.g. machines without native SWC bindings.
const config = {
  plugins: process.env.TURBOPACK ? {} : { "@tailwindcss/postcss": {} },
};

export default config;
