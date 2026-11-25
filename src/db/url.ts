/**
 * Neon connection strings use `sslmode=require`. node-postgres already treats that as
 * `verify-full` but warns that the meaning changes in pg v9. Ask for `verify-full`
 * explicitly: same (strict) behaviour today, no warning, no surprise on upgrade.
 * Done in code because `neon env pull` rewrites .env.local.
 */
export function pgConnectionString(url: string | undefined): string | undefined {
  if (!url) return url;
  return url.replace(/([?&])sslmode=(prefer|require|verify-ca)\b/, "$1sslmode=verify-full");
}
