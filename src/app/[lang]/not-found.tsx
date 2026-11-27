import Link from "next/link";
import { PackageSearch } from "lucide-react";

/** Shown inside the site layout. Kept trilingual because not-found pages don't receive the language. */
export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-3 px-4 py-24 text-center">
      <PackageSearch className="size-10 text-brand" strokeWidth={1.5} aria-hidden />
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="text-muted">ገጹ አልተገኘም · Fuulli hin argamne</p>
      <div className="mt-2 flex flex-wrap justify-center gap-2">
        <Link href="/" className="btn-primary">Home</Link>
        <Link href="/products" className="btn-secondary">Products</Link>
      </div>
    </div>
  );
}
