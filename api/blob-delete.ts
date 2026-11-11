import { del } from "@vercel/blob";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { getRequestProfile } from "./_lib/neon-auth";

function isSafePathname(pathname: string) {
  return pathname.length > 0 && !pathname.startsWith("/") && !pathname.includes("..") && !pathname.includes("\\");
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return response.status(405).json({ error: "Method not allowed" });
  }

  const profile = await getRequestProfile(request);
  if (!profile) return response.status(401).json({ error: "Unauthorized" });

  const pathname = (request.body as { pathname?: unknown } | undefined)?.pathname;
  if (typeof pathname !== "string" || !isSafePathname(pathname)) {
    return response.status(400).json({ error: "Invalid file path" });
  }

  const isReceipt = pathname.startsWith(`receipts/${profile.id}/`);
  const isAdminAsset = pathname.startsWith("gallery/") || pathname.startsWith("packages/");
  if ((isReceipt && !isSafePathname(pathname)) || (!isReceipt && !(isAdminAsset && profile.role === "admin"))) {
    return response.status(403).json({ error: "File access denied" });
  }

  try {
    await del(pathname);
    return response.status(200).json({ success: true });
  } catch {
    return response.status(502).json({ error: "Could not delete file" });
  }
}
