import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { SOCIALS } from "./socials";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-primary px-4 py-16 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="ATL Travels logo"
                className="h-12 w-12 rounded-2xl object-cover shadow-lg"
              />
              <span className="text-sm font-bold tracking-wide">ATL TRAVELS</span>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/70">
              Handpicked experiences and luxury travel curated for you.
            </p>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-bold tracking-wider uppercase">
              Quick Links
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link
                  to="/destinations"
                  className="text-white/70 transition hover:text-accent"
                >
                  Destinations
                </Link>
              </li>
              <li>
                <Link
                  to="/bookings"
                  className="text-white/70 transition hover:text-accent"
                >
                  Bookings
                </Link>
              </li>
              <li>
                <Link
                  to="/gallery"
                  className="text-white/70 transition hover:text-accent"
                >
                  Gallery
                </Link>
              </li>
              <li>
                <Link to="/" className="text-white/70 transition hover:text-accent">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/" className="text-white/70 transition hover:text-accent">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 text-sm font-bold tracking-wider uppercase">
              Follow Us
            </h4>
            <div className="flex gap-3">
              {SOCIALS.map(({ id, href, label, Icon }) => (
                <a
                  key={id}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  title={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 transition hover:bg-accent"
                >
                  <Icon className="h-4.5 w-4.5" />
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-xs text-white/60">
            © {year} ATL TRAVELS. All rights reserved.
          </p>
          <p className="flex items-center gap-1.5 text-xs text-white/60">
            Made with <Heart className="h-4 w-4 fill-accent text-accent" /> for
            luxury travelers
          </p>
        </div>
      </div>
    </footer>
  );
}
