import { createAdminClient } from "@/lib/supabase/admin";

export const STORAGE_BUCKETS = {
  avatars: "avatars",
  kycDocuments: "kyc-documents",
  paymentProofs: "payment-proofs",
  deliveryEvidence: "delivery-evidence",
  supportEvidence: "support-evidence"
} as const;

export type StorageBucket = (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS];

const publicBuckets = new Set<StorageBucket>([STORAGE_BUCKETS.avatars]);

export function extensionForType(fileType: string): string {
  const map: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/webp": "webp",
    "image/gif": "gif"
  };
  return map[fileType.toLowerCase()] ?? "bin";
}

async function ensureBucket(bucket: StorageBucket) {
  const admin = createAdminClient();
  const { data } = await admin.storage.getBucket(bucket);
  if (!data) {
    await admin.storage.createBucket(bucket, {
      public: publicBuckets.has(bucket),
      fileSizeLimit: 5 * 1024 * 1024
    });
  }
}

export async function uploadFile(
  bucket: StorageBucket,
  path: string,
  file: ArrayBuffer | Uint8Array,
  contentType: string
): Promise<{ ok: true; publicUrl: string; path: string } | { ok: false; message: string }> {
  try {
    await ensureBucket(bucket);
    const admin = createAdminClient();
    const body = file instanceof Uint8Array ? file : new Uint8Array(file);
    const { error } = await admin.storage.from(bucket).upload(path, body, {
      contentType,
      upsert: true
    });

    if (error) {
      return { ok: false, message: error.message };
    }

    const { data } = admin.storage.from(bucket).getPublicUrl(path);
    return { ok: true, publicUrl: data.publicUrl, path };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "No se pudo subir el archivo." };
  }
}

export async function removeFile(bucket: StorageBucket, path: string): Promise<void> {
  try {
    const admin = createAdminClient();
    await admin.storage.from(bucket).remove([path]);
  } catch {
    // best-effort cleanup
  }
}
