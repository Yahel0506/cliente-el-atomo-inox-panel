import "server-only";

import { randomUUID } from "crypto";
import type { createPrivilegedClient } from "@/lib/supabase/admin";

export const MEDIA_BUCKETS = {
  productImages: "catalog-product-images",
  branchImages: "branch-images",
  workResultImages: "work-result-images",
  workVideos: "work-videos",
} as const;

type PrivilegedClient = NonNullable<Awaited<ReturnType<typeof createPrivilegedClient>>>;
type MediaBucket = (typeof MEDIA_BUCKETS)[keyof typeof MEDIA_BUCKETS];

export function buildStoragePath(scope: string, extension: "webp" | "webm") {
  const safeScope = scope
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9/-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/\/+/g, "/");

  return `${safeScope || "media"}/${Date.now()}-${randomUUID()}.${extension}`;
}

export async function uploadPublicMedia({
  supabase,
  bucket,
  path,
  body,
  contentType,
}: {
  supabase: PrivilegedClient;
  bucket: MediaBucket;
  path: string;
  body: Buffer;
  contentType: "image/webp" | "video/webm";
}) {
  const { error } = await supabase.storage.from(bucket).upload(path, body, {
    cacheControl: "31536000",
    contentType,
    upsert: false,
  });

  if (error) throw new Error(error.message);

  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

export async function removePublicMedia(supabase: PrivilegedClient, bucket: MediaBucket, publicUrl?: string | null) {
  if (!publicUrl) return;

  try {
    const url = new URL(publicUrl);
    const marker = `/storage/v1/object/public/${bucket}/`;
    const index = url.pathname.indexOf(marker);
    if (index === -1) return;

    const objectPath = decodeURIComponent(url.pathname.slice(index + marker.length));
    if (!objectPath) return;

    await supabase.storage.from(bucket).remove([objectPath]);
  } catch {
    // Public URLs from older content can be external; ignore those during replacement.
  }
}
