import type { Metadata } from "next";
import { LockKeyhole } from "lucide-react";
import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = { title: "Admin sign in", robots: { index: false } };

export default function SignInPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <span className="mb-4 flex size-11 items-center justify-center rounded-xl bg-brand text-white">
          <LockKeyhole className="size-5" aria-hidden />
        </span>
        <h1 className="text-2xl font-semibold">Admin sign in</h1>
        <p className="mt-1 text-sm text-muted">For staff only.</p>
        <SignInForm />
      </div>
    </div>
  );
}
