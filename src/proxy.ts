import { auth } from "@/lib/auth/server";

// Only the admin panel needs a session; the public site never runs this.
// Allowlist checks happen server-side in requireAdminPage()/requireAdmin().
export default auth.middleware({
  loginUrl: "/auth/sign-in",
});

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
