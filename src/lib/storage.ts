import "server-only";
import { AwsClient } from "aws4fetch";

/**
 * Neon Object Storage (S3-compatible, path-style, SigV4).
 * Uses STORAGE_* env names (Vercel rejects AWS_*). The AWS_* fallback only exists so the app
 * keeps working if `neon env pull`/`neon checkout` rewrites .env.local with Neon's default names.
 */
const env = {
  accessKeyId: process.env.STORAGE_ACCESS_KEY_ID ?? process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY ?? process.env.AWS_SECRET_ACCESS_KEY,
  endpoint: process.env.STORAGE_ENDPOINT_URL ?? process.env.AWS_ENDPOINT_URL_S3,
  region: process.env.STORAGE_REGION ?? process.env.AWS_REGION ?? "auto",
};

export const BUCKET = process.env.STORAGE_BUCKET ?? "product-images";

let client: AwsClient | null = null;
function s3(): AwsClient {
  if (!env.accessKeyId || !env.secretAccessKey || !env.endpoint) {
    throw new Error("Object storage is not configured (missing STORAGE_*/AWS_* env vars).");
  }
  client ??= new AwsClient({
    accessKeyId: env.accessKeyId,
    secretAccessKey: env.secretAccessKey,
    region: env.region,
    service: "s3",
  });
  return client;
}

function objectUrl(key: string): string {
  const base = env.endpoint!.replace(/\/+$/, "");
  const path = key.split("/").map(encodeURIComponent).join("/");
  return `${base}/${BUCKET}/${path}`;
}

/** Uploads to the public_read bucket and returns the public URL. Keys are unique, so cache forever. */
export async function putObject(key: string, body: Uint8Array, contentType: string): Promise<string> {
  const url = objectUrl(key);
  const init = {
    method: "PUT",
    body: body as BodyInit,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  };
  // Sign, then send the original bytes ourselves. Passing the signed Request object to
  // fetch makes Next's patched fetch re-stream the body without a Content-Length, and
  // the storage API rejects chunked uploads (501 NotImplemented).
  const signed = await s3().sign(url, init);
  const res = await fetch(url, { method: "PUT", headers: signed.headers, body: init.body, cache: "no-store" });
  if (!res.ok) throw new Error(`Upload failed (${res.status}): ${(await res.text()).slice(0, 200)}`);
  return url;
}

export async function deleteObject(key: string): Promise<void> {
  const res = await s3().fetch(objectUrl(key), { method: "DELETE" });
  if (!res.ok && res.status !== 404) throw new Error(`Delete failed (${res.status})`);
}

/** Host of the storage endpoint, for next/image remotePatterns. */
export function storageHostname(): string | null {
  try {
    return env.endpoint ? new URL(env.endpoint).hostname : null;
  } catch {
    return null;
  }
}
