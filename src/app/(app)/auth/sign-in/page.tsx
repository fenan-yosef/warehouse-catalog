import type { Metadata } from "next";
import Image from "next/image";
import { photos } from "@/lib/photos";
import { RedRule } from "@/components/brand-accents";
import { Logo } from "@/components/logo";
import { ThreeScene } from "@/components/three/three-scene";
import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = { title: "Admin sign in", robots: { index: false } };

export default function SignInPage() {
  return (
    <div className="flex flex-1">
      <div className="relative hidden w-1/2 bg-ink lg:block">
        <Image src={photos.pipeRacks} alt="" fill priority placeholder="blur" quality={55} sizes="50vw" className="object-cover opacity-70" />
        <div className="absolute inset-0 bg-black/40" />
        <ThreeScene scene="logo" className="absolute inset-0 size-full" />
        <RedRule className="absolute inset-x-0 top-0" />
      </div>
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <Logo className="mb-5 h-12 w-auto text-ink" />
          <h1 className="text-2xl font-semibold">Admin sign in</h1>
          <p className="mt-1 text-sm text-muted">For staff only.</p>
          <SignInForm />
        </div>
      </div>
    </div>
  );
}
