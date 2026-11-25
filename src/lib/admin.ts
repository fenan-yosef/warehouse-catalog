import "server-only";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { db } from "@/db";
import { admins } from "@/db/schema";
import { auth } from "@/lib/auth/server";

export type AdminRole = "owner" | "staff";

export interface AdminUser {
  email: string;
  name: string;
  role: AdminRole;
}

function ownerEmails(): string[] {
  return (process.env.ADMIN_OWNER_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export type AdminCheck =
  | { status: "signed-out" }
  | { status: "not-authorized"; email: string }
  | { status: "ok"; admin: AdminUser };

/**
 * Signed in AND on the allowlist. Owners come from ADMIN_OWNER_EMAILS;
 * staff come from the admins table (managed on /admin/team).
 */
export async function checkAdmin(): Promise<AdminCheck> {
  // Admin pages are always per-request; say so before the auth SDK touches cookies.
  await connection();
  const { data: session } = await auth.getSession();
  const user = session?.user;
  if (!user?.email) return { status: "signed-out" };

  const email = user.email.toLowerCase();
  const name = user.name ?? "";
  if (ownerEmails().includes(email)) return { status: "ok", admin: { email, name, role: "owner" } };

  const row = await db.query.admins.findFirst({ where: eq(admins.email, email) });
  if (row) return { status: "ok", admin: { email, name: row.name || name, role: "staff" } };

  return { status: "not-authorized", email };
}

/** For pages: redirects when not allowed. */
export async function requireAdminPage(): Promise<AdminUser> {
  const check = await checkAdmin();
  if (check.status === "signed-out") redirect("/auth/sign-in");
  if (check.status === "not-authorized") redirect("/auth/not-authorized");
  return check.admin;
}

/** For Server Actions: throws when not allowed, so direct POSTs are rejected too. */
export async function requireAdmin(role?: AdminRole): Promise<AdminUser> {
  const check = await checkAdmin();
  if (check.status !== "ok") throw new Error("Unauthorized");
  if (role === "owner" && check.admin.role !== "owner") throw new Error("Owner access required");
  return check.admin;
}
