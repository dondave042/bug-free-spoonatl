import { defineConfig, loadEnv, type ProxyOptions } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(async ({ mode }) => {
  const plugins = [react(), tailwindcss()];
  try {
    // @ts-expect-error Optional Vercel source-tag helper is generated outside this repo.
    const m = await import('./.vite-source-tags.js');
    plugins.push(m.sourceTags());
  } catch {
    // Optional source tags are unavailable in local builds.
  }

  const env = loadEnv(mode, process.cwd(), ['VITE_', 'NEXT_PUBLIC_']);
  const processEnvDefines: Record<string, string> = {};
  for (const [key, value] of Object.entries(env)) {
    processEnvDefines[`process.env.${key}`] = JSON.stringify(value);
  }

  const neonAuthProxyPath = '/api/neon-auth';
  const authUrl = env.VITE_NEON_AUTH_URL ? new URL(env.VITE_NEON_AUTH_URL) : null;
  const authPath = authUrl?.pathname.replace(/\/+$/, '') ?? '';
  const authProxy: ProxyOptions | null = authUrl
    ? {
        target: authUrl.origin,
        changeOrigin: true,
        secure: true,
        rewrite: (path: string) =>
          `${authPath}${path.slice(neonAuthProxyPath.length)}` || '/',
        cookieDomainRewrite: '',
        cookiePathRewrite: '/',
        bypass: (request, response) => {
          const origin = request.headers.origin;
          const isSafeRead = request.method === 'GET' || request.method === 'HEAD';
          if (
            (!origin && isSafeRead) ||
            isSameOriginRequest(
              origin,
              request.headers.host,
              request.headers['x-forwarded-host'],
              request.headers['x-forwarded-proto'],
            )
          ) {
            return;
          }

          response?.writeHead(403, { 'content-type': 'application/json' });
          response?.end(JSON.stringify({ error: 'Forbidden' }));
          return request.url ?? neonAuthProxyPath;
        },
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyRequest) => {
            proxyRequest.removeHeader('forwarded');
            proxyRequest.removeHeader('x-forwarded-host');
            proxyRequest.removeHeader('x-forwarded-port');
            proxyRequest.removeHeader('x-forwarded-proto');
            proxyRequest.setHeader('origin', authUrl.origin);
            proxyRequest.setHeader('referer', `${authUrl.origin}/`);
            proxyRequest.setHeader('host', authUrl.host);
          });
          proxy.on('proxyRes', (proxyResponse) => {
            const cookies = proxyResponse.headers['set-cookie'];
            if (!cookies) return;

            proxyResponse.headers['set-cookie'] = cookies.map((cookie) => {
              const withoutSameSite = cookie.replace(/;\s*SameSite=[^;]*/gi, '');
              const secureCookie = /;\s*Secure(?:;|$)/i.test(withoutSameSite)
                ? withoutSameSite
                : `${withoutSameSite}; Secure`;
              return `${secureCookie}; SameSite=None`;
            });
          });
        },
      }
    : null;

  return {
    plugins,
    envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
    define: processEnvDefines,
    ...(authProxy
      ? { server: { proxy: { [neonAuthProxyPath]: authProxy } } }
      : {}),
  };
})

function isSameOriginRequest(
  origin: string | undefined,
  host: string | undefined,
  forwardedHost: string | string[] | undefined,
  forwardedProtocol: string | string[] | undefined,
) {
  const forwardedHostValue = Array.isArray(forwardedHost)
    ? forwardedHost[0]
    : forwardedHost?.split(',')[0];
  const requestHost = forwardedHostValue?.trim() || host;
  if (!origin || !requestHost) return false;

  try {
    const originUrl = new URL(origin);
    if (
      originUrl.host.toLowerCase() !== requestHost.toLowerCase() ||
      originUrl.username ||
      originUrl.password ||
      originUrl.pathname !== '/' ||
      originUrl.search ||
      originUrl.hash
    ) {
      return false;
    }

    const forwarded = Array.isArray(forwardedProtocol)
      ? forwardedProtocol[0]
      : forwardedProtocol?.split(',')[0];
    const normalizedForwarded = forwarded?.trim().toLowerCase();
    if (normalizedForwarded && normalizedForwarded !== originUrl.protocol.slice(0, -1)) {
      return false;
    }

    if (originUrl.protocol === 'https:') return true;

    const hostname = new URL(`http://${requestHost}`).hostname.toLowerCase();
    return (
      originUrl.protocol === 'http:' &&
      ['localhost', '127.0.0.1', '::1', '[::1]'].includes(hostname)
    );
  } catch {
    return false;
  }
}
