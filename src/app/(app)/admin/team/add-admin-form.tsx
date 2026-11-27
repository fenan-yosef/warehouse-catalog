"use client";

import { useActionState } from "react";
import { UserPlus } from "lucide-react";
import { addAdmin, type FormState } from "../actions";
import { FormMessage } from "../form-message";

export function AddAdminForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(addAdmin, undefined);
  return (
    <form action={action} className="card space-y-3 p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label">Email</label>
          <input name="email" type="email" required className="input" />
        </div>
        <div>
          <label className="label">Name (optional)</label>
          <input name="name" className="input" />
        </div>
      </div>
      <FormMessage state={state} />
      <button disabled={pending} className="btn-primary">
        <UserPlus className="size-4" aria-hidden />
        {pending ? "Adding…" : "Give admin access"}
      </button>
    </form>
  );
}
