"use client";

import { useActionState, useRef } from "react";
import { Equal, Minus, Plus } from "lucide-react";
import { adjustStock, type FormState } from "../actions";

/**
 * The core admin control: on a phone, type a number and tap Arrived or Sold.
 * Each tap writes a stock movement with who did it.
 */
export function QuickStock({ productId, showSet = false }: { productId: number; showSet?: boolean }) {
  const [state, action, pending] = useActionState<FormState, FormData>(adjustStock, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={async (fd) => {
        await action(fd);
        formRef.current?.reset();
      }}
      className="mt-3"
    >
      <input type="hidden" name="productId" value={productId} />
      <div className="flex gap-2">
        <input
          name="amount"
          type="number"
          inputMode="numeric"
          min={0}
          required
          placeholder="Qty"
          aria-label="Quantity"
          className="input w-24 shrink-0"
        />
        <button
          name="direction"
          value="in"
          disabled={pending}
          className="btn flex-1 bg-ok-soft text-ok hover:bg-ok hover:text-white"
        >
          <Plus className="size-4" aria-hidden />
          Arrived
        </button>
        <button
          name="direction"
          value="out"
          disabled={pending}
          className="btn flex-1 bg-brand-soft text-brand hover:bg-brand hover:text-white"
        >
          <Minus className="size-4" aria-hidden />
          Sold
        </button>
        {showSet && (
          <button name="direction" value="set" disabled={pending} className="btn-secondary flex-1">
            <Equal className="size-4" aria-hidden />
            Set to
          </button>
        )}
      </div>
      {showSet && (
        <input name="note" placeholder="Note (optional), e.g. customer name or container no." className="input mt-2" />
      )}
      {state?.error && <p className="mt-2 text-sm text-red-700">{state.error}</p>}
      {state?.message && <p className="mt-2 text-sm text-ok">{state.message}</p>}
    </form>
  );
}
