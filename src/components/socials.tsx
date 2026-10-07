/* eslint-disable react-refresh/only-export-components */

export function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.26 16.1a6.34 6.34 0 0 0 6.33 6.37 6.34 6.34 0 0 0 6.33-6.37V10.74a8.04 8.04 0 0 0 4.78 1.53V9.02a4.83 4.83 0 0 1-3.77-1.33Z" />
    </svg>
  );
}

export function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.69-4.92-4.92-.06-1.27-.07-1.64-.07-4.85s.01-3.58.07-4.85c.15-3.23 1.66-4.77 4.92-4.92 1.27-.06 1.64-.07 4.85-.07zm0-2.16C8.74 0 8.31.01 7.05.07 3.61.27 1.27 2.61 1.07 6.05.01 7.31 0 7.74 0 12s.01 4.69.07 5.95c.2 3.44 2.54 5.78 5.98 5.98 1.26.06 1.69.07 5.95.07s4.69-.01 5.95-.07c3.44-.2 5.78-2.54 5.98-5.98.06-1.26.07-1.69.07-5.95s-.01-4.69-.07-5.95c-.2-3.44-2.54-5.78-5.98-5.98C16.69.01 16.26 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm4.965-10.322a1.44 1.44 0 1 1 0-2.88 1.44 1.44 0 0 1 0 2.88z" />
    </svg>
  );
}

export function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M24 12.07C24 5.41 18.63 0 12 0S0 5.41 0 12.07C0 18.1 4.39 23.09 10.13 24v-8.44H7.08v-3.49h3.04V9.41c0-3.02 1.8-4.7 4.54-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.89V15h3.32l-.53 3.49h-2.79V24c5.74-.91 10.13-5.9 10.13-11.93z" />
    </svg>
  );
}

export function XIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
    </svg>
  );
}

export const SOCIALS = [
  {
    id: "tiktok",
    label: "TikTok — @ashleytravelagent",
    href: "https://www.tiktok.com/@ashleytravelagent?_r=1&_t=ZS-98lNw7Nultf",
    Icon: TikTokIcon,
  },
  {
    id: "facebook",
    label: "Facebook",
    href: "https://www.facebook.com",
    Icon: FacebookIcon,
  },
];
