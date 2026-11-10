import type { VercelRequest } from "@vercel/node";

export interface NeonProfile {
  id: string;
  role: string;
}

function getDataApiUrl() {
  const authUrl = process.env.VITE_NEON_AUTH_URL ?? process.env.NEON_AUTH_BASE_URL;
  if (!authUrl) return null;

  const url = new URL(authUrl);
  url.hostname = url.hostname.replace(".neonauth.", ".apirest.");
  url.pathname = url.pathname.replace(/\/auth\/?$/, "/rest/v1");
  url.search = "";
  url.hash = "";
  return url.toString().replace(/\/$/, "");
}

function getBearerToken(request: VercelRequest) {
  const authorization = request.headers.authorization;
  if (!authorization?.startsWith("Bearer ")) return null;
  return authorization.slice("Bearer ".length).trim() || null;
}

function getSubject(token: string) {
  try {
    const encodedPayload = token.split(".")[1];
    if (!encodedPayload) return null;
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as {
      sub?: unknown;
    };
    return typeof payload.sub === "string" && payload.sub.length > 0 ? payload.sub : null;
  } catch {
    return null;
  }
}

export async function getRequestProfile(request: VercelRequest): Promise<NeonProfile | null> {
  const token = getBearerToken(request);
  const subject = token ? getSubject(token) : null;
  const dataApiUrl = getDataApiUrl();
  if (!token || !subject || !dataApiUrl) return null;

  const url = new URL(`${dataApiUrl}/profiles`);
  url.searchParams.set("select", "id,role");
  url.searchParams.set("id", `eq.${subject}`);

  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    if (!response.ok) return null;
    const rows = (await response.json()) as NeonProfile[];
    return rows.find((row) => row.id === subject) ?? null;
  } catch {
    return null;
  }
}

export async function isBookingOwnedByUser(
  request: VercelRequest,
  userId: string,
  bookingId: string,
) {
  const token = getBearerToken(request);
  const dataApiUrl = getDataApiUrl();
  if (!token || !dataApiUrl) return false;

  const url = new URL(`${dataApiUrl}/bookings`);
  url.searchParams.set("select", "id");
  url.searchParams.set("id", `eq.${bookingId}`);
  url.searchParams.set("user_id", `eq.${userId}`);

  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
    });
    if (!response.ok) return false;
    const rows = (await response.json()) as Array<{ id: string }>;
    return rows.some((row) => row.id === bookingId);
  } catch {
    return false;
  }
}
