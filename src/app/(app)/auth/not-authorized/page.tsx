import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { SignOutButton } from "@/app/(app)/admin/sign-out-button";

export default function NotAuthorizedPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="card w-full max-w-sm space-y-4 p-6 text-center">
        <ShieldAlert className="mx-auto size-10 text-brand" strokeWidth={1.5} aria-hidden />
        <h1 className="text-xl font-semibold">No admin access</h1>
        <p className="text-sm text-muted">
          You&apos;re signed in, but this account isn&apos;t on the admin team. Ask the owner to add your
          email on the Team page.
        </p>
        <div className="flex justify-center gap-2">
          <Link href="/" className="btn-secondary">Go to website</Link>
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}
