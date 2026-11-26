/** Thin solid red line: the brand edge on headers, footers and banners. */
export function RedRule({ className = "" }: { className?: string }) {
  return <div aria-hidden className={`h-1 w-full shrink-0 bg-brand ${className}`} />;
}

/** Two slanted red bars, echoing the top of the logo's "T". */
export function LogoBars({ className = "h-4 w-auto" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 22" aria-hidden className={`text-brand ${className}`}>
      <polygon points="0,0 120,0 112,8 8,8" fill="currentColor" />
      <polygon points="10,12 72,12 65,20 18,20" fill="currentColor" />
    </svg>
  );
}
