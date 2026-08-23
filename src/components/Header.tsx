import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Menu, User, X } from "lucide-react";
import { useStore } from "../lib/store";
import { NAV_LINKS } from "../lib/data";

export function Header() {
  const { user, isAdmin, signOut } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const jump = (href: string) => {
    if (!href.startsWith("/#")) return;
    const id = href.slice(2);
    if (loc.pathname !== "/") {
      nav("/");
      window.setTimeout(
        () => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }),
        120,
      );
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }
    setOpen(false);
  };

  const logout = async () => {
    signOut();
    nav("/");
  };

  return (
    <header
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-slate-200/60 bg-white/90 backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="ATL Travels logo"
            className="h-12 w-12 rounded-2xl object-cover shadow-lg ring-1 ring-slate-900/10"
          />
          <span className="hidden leading-tight sm:block">
            <span className="font-display block text-xs text-accent italic">
              Luxury Escapes
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map((l) =>
            l.href.startsWith("/#") ? (
              <button
                key={l.href}
                type="button"
                onClick={() => jump(l.href)}
                className="nav-link cursor-pointer transition-colors hover:text-accent"
              >
                {l.label}
              </button>
            ) : (
              <NavLink
                key={l.href}
                to={l.href}
                className={({ isActive }) =>
                  `nav-link transition-colors hover:text-accent ${isActive ? "font-bold text-accent" : ""}`
                }
              >
                {l.label}
              </NavLink>
            ),
          )}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {user ? (
            <>
              {isAdmin && (
                <Link
                  to="/admin/dashboard"
                  className="inline-flex items-center rounded-full bg-accent/10 px-4 py-2.5 text-xs font-bold text-accent transition hover:bg-accent/20"
                >
                  Admin Dashboard
                </Link>
              )}
              <Link
                to={isAdmin ? "/admin/dashboard" : "/user/dashboard"}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800"
              >
                <User className="h-4 w-4" />
                {user.name.split(" ")[0]}
                <span className="rounded-full bg-white/15 px-1.5 py-0.5 text-[9px] font-bold tracking-wide uppercase">
                  {isAdmin ? "Admin" : "User"}
                </span>
              </Link>
              <button
                type="button"
                onClick={logout}
                className="inline-flex cursor-pointer items-center rounded-full bg-red-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-red-700"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="inline-flex items-center rounded-full border-2 border-slate-800 px-5 py-2.5 text-xs font-bold text-slate-800 transition hover:bg-slate-800 hover:text-white"
              >
                Login / Sign Up
              </Link>
              <Link
                to="/bookings"
                className="inline-flex justify-center rounded-full bg-accent px-6 py-3 font-bold text-white shadow-lg transition-colors hover:bg-accent-hover"
              >
                Book Now
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white/90 text-primary shadow-md lg:hidden"
          aria-label="Menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-100 bg-white px-4 py-5 shadow-xl lg:hidden">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((l) =>
              l.href.startsWith("/#") ? (
                <button
                  key={l.href}
                  type="button"
                  onClick={() => jump(l.href)}
                  className="rounded-xl px-3 py-3 text-left text-sm font-bold text-primary hover:bg-slate-50"
                >
                  {l.label}
                </button>
              ) : (
                <Link
                  key={l.href}
                  to={l.href}
                  className="rounded-xl px-3 py-3 text-sm font-bold text-primary hover:bg-slate-50"
                >
                  {l.label}
                </Link>
              ),
            )}
          </nav>
          <div className="mt-4 flex flex-col gap-2">
            {user ? (
              <>
                <Link
                  to={isAdmin ? "/admin/dashboard" : "/user/dashboard"}
                  className="rounded-full bg-primary py-3 text-center text-sm font-bold text-white"
                >
                  {isAdmin ? "Admin Dashboard" : "My Dashboard"}
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-full bg-red-600 py-3 text-sm font-bold text-white"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-full border-2 border-slate-800 py-3 text-center text-sm font-bold"
                >
                  Login / Sign Up
                </Link>
                <Link
                  to="/bookings"
                  className="rounded-full bg-accent py-3 text-center text-sm font-bold text-white"
                >
                  Book Now
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
