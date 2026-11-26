"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, LogIn, UserPlus } from "lucide-react";
import { authClient } from "@/lib/auth/client";

export function SignInForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"sign-in" | "create">("sign-in");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email")).trim().toLowerCase();
    const password = String(fd.get("password"));

    try {
      const res =
        mode === "sign-in"
          ? await authClient.signIn.email({ email, password })
          : await authClient.signUp.email({ email, password, name: String(fd.get("name") || email) });
      if (res.error) {
        setError(
          res.error.status === 401 || /invalid/i.test(res.error.message ?? "")
            ? "Wrong email or password."
            : (res.error.message ?? "Could not sign in."),
        );
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Network problem. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="card mt-6 space-y-4 p-5">
      {mode === "create" && (
        <div>
          <label className="label" htmlFor="name">Your name</label>
          <input id="name" name="name" autoComplete="name" className="input" />
        </div>
      )}
      <div>
        <label className="label" htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required autoComplete="email" className="input" />
      </div>
      <div>
        <label className="label" htmlFor="password">
          {mode === "create" ? "Choose a password" : "Password"}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete={mode === "create" ? "new-password" : "current-password"}
          className="input"
        />
      </div>
      {error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}
      <button disabled={pending} className="btn-primary w-full">
        {pending ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : mode === "create" ? (
          <UserPlus className="size-4" aria-hidden />
        ) : (
          <LogIn className="size-4" aria-hidden />
        )}
        {pending ? "Please wait…" : mode === "create" ? "Create password & sign in" : "Sign in"}
      </button>
      <button
        type="button"
        className="w-full text-center text-sm text-brand hover:underline"
        onClick={() => {
          setMode(mode === "sign-in" ? "create" : "sign-in");
          setError(null);
        }}
      >
        {mode === "sign-in" ? "First time here? Create your password" : "Already have a password? Sign in"}
      </button>
    </form>
  );
}
