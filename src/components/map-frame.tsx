"use client";

import { useEffect, useRef, useState } from "react";
import { Map as MapIcon, MapPin } from "lucide-react";

type Nav = Navigator & { connection?: { saveData?: boolean; effectiveType?: string } };

/**
 * Google Maps costs ~1 MB of scripts and tiles. Show a light placeholder and load the
 * real map on tap, or automatically on fast connections once it scrolls into view.
 */
export function MapFrame({ src, address, showLabel }: { src: string; address: string; showLabel: string }) {
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const c = (navigator as Nav).connection;
    const fast = c ? !c.saveData && c.effectiveType === "4g" : false;
    if (!fast || !ref.current) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setShow(true);
        io.disconnect();
      }
    });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="relative h-72 w-full bg-neutral-100 sm:h-96">
      {show ? (
        <iframe
          title="Warehouse location"
          src={src}
          className="size-full border-0"
          referrerPolicy="no-referrer-when-downgrade"
        />
      ) : (
        <button
          type="button"
          onClick={() => setShow(true)}
          className="group flex size-full flex-col items-center justify-center gap-3 bg-[radial-gradient(#d4d4d4_1px,transparent_1px)] bg-size-[16px_16px] p-6 text-center"
        >
          <span className="flex size-14 items-center justify-center rounded-full bg-brand text-white shadow-lg transition-transform group-hover:-translate-y-1">
            <MapPin className="size-7" aria-hidden />
          </span>
          <span className="max-w-xs text-sm font-medium">{address}</span>
          <span className="btn-secondary pointer-events-none">
            <MapIcon className="size-4" aria-hidden />
            {showLabel}
          </span>
        </button>
      )}
    </div>
  );
}
