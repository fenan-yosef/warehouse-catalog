import { redirect } from "next/navigation";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { admins } from "@/db/schema";
import { requireAdminPage } from "@/lib/admin";
import { removeAdmin } from "../actions";
import { ConfirmButton } from "../confirm-button";
import { AddAdminForm } from "./add-admin-form";

export default async function TeamPage() {
  const me = await requireAdminPage();
  if (me.role !== "owner") redirect("/admin");
  const staff = await db.select().from(admins).orderBy(asc(admins.email));
  const owners = (process.env.ADMIN_OWNER_EMAILS ?? "").split(",").map((e) => e.trim()).filter(Boolean);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Team</h1>
      <p className="text-sm text-muted">
        People listed here can sign in to the admin panel. They sign in at <code>/auth/sign-in</code>,
        and the first time they choose “Create password” with the same email.
      </p>

      <section>
        <h2 className="mb-2 font-semibold">Add a person</h2>
        <AddAdminForm />
      </section>

      <section className="card divide-y divide-border">
        {owners.map((email) => (
          <div key={email} className="flex items-center justify-between gap-3 p-4">
            <span className="truncate">{email}</span>
            <span className="rounded-full bg-brand-soft px-2 py-0.5 text-xs font-medium text-brand">Owner</span>
          </div>
        ))}
        {staff.map((a) => (
          <div key={a.email} className="flex items-center justify-between gap-3 p-4">
            <span className="min-w-0">
              <span className="block truncate">{a.name || a.email}</span>
              {a.name && <span className="block truncate text-xs text-muted">{a.email}</span>}
            </span>
            <form action={removeAdmin}>
              <input type="hidden" name="email" value={a.email} />
              <ConfirmButton message={`Remove ${a.email}'s admin access?`} className="btn-danger px-3 py-1.5">
                Remove
              </ConfirmButton>
            </form>
          </div>
        ))}
      </section>
      <p className="text-xs text-muted">Owners are set by the ADMIN_OWNER_EMAILS setting on the server.</p>
    </div>
  );
}
