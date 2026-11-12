import { createClient } from "@neon/neon-js";
import { BetterAuthReactAdapter } from "@neon/neon-js/auth/react/adapters";

const env = import.meta.env as Record<string, string | undefined>;
const authUrl = env.VITE_NEON_AUTH_URL;

function getDataApiUrl(value: string) {
  const url = new URL(value);
  url.hostname = url.hostname.replace(".neonauth.", ".apirest.");
  url.pathname = url.pathname.replace(/\/auth\/?$/, "/rest/v1");
  url.search = "";
  url.hash = "";
  return url.toString().replace(/\/$/, "");
}

export const neon = authUrl
  ? createClient({
      auth: {
        url:
          import.meta.env.DEV && typeof window !== "undefined"
            ? new URL("/api/neon-auth", window.location.origin).toString()
            : authUrl,
        allowAnonymous: true,
        adapter: BetterAuthReactAdapter(),
      },
      dataApi: { url: getDataApiUrl(authUrl) },
    })
  : null;
