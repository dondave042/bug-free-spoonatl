import { upload } from "@vercel/blob/client";
import { neon } from "./neon";

export type BlobUploadKind = "gallery" | "package" | "receipt";

export interface UploadedBlob {
  pathname: string;
  url?: string;
}

function safeFilename(filename: string) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-160) || "upload";
}

export async function uploadBlob(
  file: File,
  kind: BlobUploadKind,
  bookingId?: string,
): Promise<UploadedBlob> {
  if (!neon) throw new Error("Neon is not configured");
  const session = await neon.auth.getSession();
  const token = session.data?.session?.token;
  const userId = session.data?.user?.id;
  if (!token || !userId) throw new Error("Please sign in again before uploading files");
  if (kind === "receipt" && !bookingId) throw new Error("A booking is required for receipt uploads");

  const prefix = kind === "receipt" ? `receipts/${userId}/${bookingId}` : `${kind === "gallery" ? "gallery" : "packages"}`;
  const pathname = `${prefix}/${crypto.randomUUID()}-${safeFilename(file.name)}`;
  const result = await upload(pathname, file, {
    access: "private",
    handleUploadUrl: "/api/blob-upload",
    clientPayload: JSON.stringify({ kind, bookingId }),
    headers: { Authorization: `Bearer ${token}` },
    contentType: file.type,
    multipart: file.size > 5 * 1024 * 1024,
  });

  return {
    pathname: result.pathname,
    ...(kind === "receipt"
      ? {}
      : { url: `/api/media?pathname=${encodeURIComponent(result.pathname)}` }),
  };
}

export async function deleteBlob(pathname: string): Promise<boolean> {
  if (!neon) return false;
  const session = await neon.auth.getSession();
  const token = session.data?.session?.token;
  if (!token) return false;

  const response = await fetch("/api/blob-delete", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ pathname }),
  });

  return response.ok;
}
