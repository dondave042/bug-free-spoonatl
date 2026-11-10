import { get } from "@vercel/blob";
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { Readable } from "node:stream";

function getQueryString(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function isPublicMediaPath(pathname: string) {
  return (
    (pathname.startsWith("gallery/") || pathname.startsWith("packages/")) &&
    !pathname.startsWith("/") &&
    !pathname.includes("..") &&
    !pathname.includes("\\")
  );
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).end();
  }

  const pathname = getQueryString(request.query.pathname);
  if (!pathname || !isPublicMediaPath(pathname)) return response.status(404).end();

  try {
    const ifNoneMatch = request.headers["if-none-match"];
    const blob = await get(pathname, {
      access: "private",
      ifNoneMatch: Array.isArray(ifNoneMatch) ? ifNoneMatch[0] : ifNoneMatch,
    });

    if (!blob) return response.status(404).end();
    response.setHeader("ETag", blob.blob.etag);
    response.setHeader("Cache-Control", "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800");
    response.setHeader("X-Content-Type-Options", "nosniff");

    if (blob.statusCode === 304) return response.status(304).end();

    response.setHeader("Content-Type", blob.blob.contentType);
    response.setHeader("Content-Disposition", "inline");
    response.status(200);
    Readable.fromWeb(blob.stream).pipe(response);
    return;
  } catch {
    return response.status(502).json({ error: "Could not load media" });
  }
}
