import { eq } from "drizzle-orm";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { requireAdminPage } from "@/lib/admin";
import { DEFAULT_SETTINGS } from "@/lib/queries";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  await requireAdminPage();
  // Read straight from the DB (not the public cache) so the form is always current.
  const s = (await db.query.settings.findFirst({ where: eq(settings.id, 1) })) ?? DEFAULT_SETTINGS;
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Settings</h1>
      <p className="text-sm text-muted">
        Everything here shows on the public website. Changes go live as soon as you save.
      </p>
      <SettingsForm settings={s} />
    </div>
  );
}
