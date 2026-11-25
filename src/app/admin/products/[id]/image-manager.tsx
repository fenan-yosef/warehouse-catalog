"use client";

import Image from "next/image";
import { startTransition, useActionState, useRef, useState } from "react";
import type { ProductImage } from "@/db/schema";
import { deleteProductImage, makeMainImage, uploadProductImages, type FormState } from "../../actions";

const MAX_SIDE = 1600;

/** Phone photos are often 3–8 MB; shrink them in the browser before upload. */
async function shrink(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.82));
    if (!blob) return file;
    return new File([blob], file.name.replace(/\.\w+$/, "") + ".jpg", { type: "image/jpeg" });
  } catch {
    return file;
  }
}

export function ImageManager({ productId, images }: { productId: number; images: ProductImage[] }) {
  const [state, upload, pending] = useActionState<FormState, FormData>(uploadProductImages, undefined);
  const [preparing, setPreparing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function onPick(files: FileList | null) {
    if (!files?.length) return;
    setPreparing(true);
    const fd = new FormData();
    fd.set("productId", String(productId));
    for (const f of Array.from(files)) fd.append("images", await shrink(f));
    setPreparing(false);
    startTransition(() => upload(fd));
    if (inputRef.current) inputRef.current.value = "";
  }

  const busy = pending || preparing;

  return (
    <div className="card space-y-3 p-4">
      {images.length > 0 ? (
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {images.map((img, i) => (
            <li key={img.id} className="space-y-1">
              <div className="relative aspect-square overflow-hidden rounded-lg border border-border">
                <Image src={img.url} alt="" fill sizes="160px" className="object-cover" />
                {i === 0 && (
                  <span className="absolute left-1 top-1 rounded bg-brand px-1.5 py-0.5 text-[10px] font-medium text-white">
                    Main
                  </span>
                )}
              </div>
              <div className="flex gap-1">
                {i > 0 && (
                  <form action={makeMainImage} className="flex-1">
                    <input type="hidden" name="imageId" value={img.id} />
                    <button className="w-full rounded border border-border py-1 text-xs hover:bg-background">Main</button>
                  </form>
                )}
                <form
                  action={deleteProductImage}
                  className="flex-1"
                  onSubmit={(e) => {
                    if (!confirm("Delete this photo?")) e.preventDefault();
                  }}
                >
                  <input type="hidden" name="imageId" value={img.id} />
                  <button className="w-full rounded border border-red-200 py-1 text-xs text-red-700 hover:bg-red-50">
                    Delete
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted">No photos yet. Products with photos get far more interest.</p>
      )}

      <label className={`btn-secondary w-full cursor-pointer sm:w-auto ${busy ? "pointer-events-none opacity-50" : ""}`}>
        {preparing ? "Preparing…" : pending ? "Uploading…" : "+ Add photos"}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="sr-only"
          onChange={(e) => onPick(e.target.files)}
        />
      </label>
      {state?.error && <p className="text-sm text-red-700">{state.error}</p>}
      {state?.message && <p className="text-sm text-ok">{state.message}</p>}
    </div>
  );
}
