import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getRequestProfile, isBookingOwnedByUser } from "./_lib/neon-auth";

const MAX_MEDIA_BYTES = 50 * 1024 * 1024;
const MAX_RECEIPT_BYTES = 10 * 1024 * 1024;
const VALID_BOOKING_ID = /^[a-zA-Z0-9-]{1,64}$/;

interface UploadPayload {
  kind?: unknown;
  bookingId?: unknown;
}

function parsePayload(value: string | null) {
  if (!value) return null;
  try {
    return JSON.parse(value) as UploadPayload;
  } catch {
    return null;
  }
}

function isAllowedPathname(pathname: string, prefix: string) {
  return pathname.startsWith(`${prefix}/`) && !pathname.includes("..") && !pathname.includes("\\");
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
  }

  try {
    const result = await handleUpload({
      request,
      body: request.body as HandleUploadBody,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const payload = parsePayload(clientPayload);
        const profile = await getRequestProfile(request);
        if (!payload || !profile) throw new Error("Unauthorized");

        const kind = payload.kind;
        const isReceipt = kind === "receipt";
        const isAdminAsset = kind === "gallery" || kind === "package";
        if (!isReceipt && !isAdminAsset) throw new Error("Invalid upload type");
        if (isAdminAsset && profile.role !== "admin") throw new Error("Admin access required");

        const bookingId = typeof payload.bookingId === "string" ? payload.bookingId : "";
        let prefix = kind === "gallery" ? "gallery" : "packages";
        if (isReceipt) {
          if (!VALID_BOOKING_ID.test(bookingId)) throw new Error("Invalid booking");
          if (!(await isBookingOwnedByUser(request, profile.id, bookingId))) throw new Error("Booking access required");
          prefix = `receipts/${profile.id}/${bookingId}`;
        }
        if (!isAllowedPathname(pathname, prefix)) throw new Error("Invalid upload path");

        return {
          allowedContentTypes: isReceipt ? ["image/*"] : ["image/*", "video/*"],
          maximumSizeInBytes: isReceipt ? MAX_RECEIPT_BYTES : MAX_MEDIA_BYTES,
          validUntil: Date.now() + 5 * 60 * 1000,
          addRandomSuffix: false,
          tokenPayload: JSON.stringify({ userId: profile.id, kind }),
        };
      },
    });

    return response.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload could not be authorized";
    const status = message === "Unauthorized" ? 401 : message.includes("access") || message.includes("required") ? 403 : 400;
    return response.status(status).json({ error: message });
  }
}
