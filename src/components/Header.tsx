import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Menu, User, X } from 'lucide-react';
import { useStore } from '../lib/store';

const LINKS = [
  { href: '/destinations', label: 'Destinations' },
  { href: '/bookings', label: 'Bookings' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/#testimonials', label: 'Reviews' },
  { href: '/#contact', label: 'Contact' },
];

export default function Header() {
  const { user, isAdmin, signOut } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => setOpen(false), [location.pathname]);

  const anchorNav = (href: string) => {
    if (!href.startsWith('/#')) return;
    const id = href.slice(2);
    if (location.pathname !== '/') {
      navigate('/');
      window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }), 120);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
    setOpen(false);
  };

  const logout = async () => {
    signOut();
    navigate('/');
  };

  return (
    <header
      className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
        scrolled ? 'border-b border-slate-200/60 bg-white/90 backdrop-blur-md' : 'bg-transparent'
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
            <span className="font-display block text-xs text-accent italic">Luxury Escapes</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {LINKS.map((l) =>
            l.href.startsWith('/#') ? (
              <button
                key={l.href}
                type="button"
                onClick={() => anchorNav(l.href)}
                className="nav-link cursor-pointer transition-colors hover:text-accent"
              >
                {l.label}
              </button>
            ) : (
              <NavLink
                key={l.href}
                to={l.href}
                className={({ isActive }) =>
                  `nav-link transition-colors hover:text-accent ${isActive ? 'font-bold text-accent' : ''}`
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
                to="/user/dashboard"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800"
              >
                <User className="h-4 w-4" />
                {user.name.split(' ')[0]}
              </Link>
              <button
                type="button"
                onClick={logout}
                className="inline-flex cursor-pointer items-center rounded-full bg-red-600 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-red-700"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="inline-flex items-center rounded-full bg-slate-800 px-5 py-2.5 text-xs font-bold text-white transition hover:bg-slate-900"
              >
                Sign Up
              </Link>
              <Link
                to="/bookings"
                className="inline-flex items-center rounded-full bg-accent px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition hover:bg-accent-hover"
              >
                BOOK NOW
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-slate-300 transition-colors hover:bg-slate-100 lg:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5 text-slate-800" /> : <Menu className="h-5 w-5 text-slate-800" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-slate-100 bg-white px-5 pt-2 pb-6 lg:hidden">
          {LINKS.map((l) =>
            l.href.startsWith('/#') ? (
              <button
                key={l.href}
                type="button"
                onClick={() => anchorNav(l.href)}
                className="block w-full border-b border-slate-100 py-3 text-left font-medium text-primary transition-colors hover:text-accent"
              >
                {l.label}
              </button>
            ) : (
              <Link
                key={l.href}
                to={l.href}
                className="block border-b border-slate-100 py-3 font-medium text-primary transition-colors hover:text-accent"
              >
                {l.label}
              </Link>
            ),
          )}
          <div className="mt-4 flex flex-col gap-2">
            {user ? (
              <>
                <Link
                  to="/user/dashboard"
                  className="inline-flex justify-center rounded-full border-2 border-slate-800 px-6 py-3 font-bold text-slate-800 transition-colors hover:bg-slate-800 hover:text-white"
                >
                  Dashboard
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin/dashboard"
                    className="inline-flex justify-center rounded-full bg-accent px-6 py-3 font-bold text-white transition-colors hover:bg-accent-hover"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setOpen(false);
                  }}
                  className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-red-600 px-6 py-3 font-bold text-white transition-colors hover:bg-red-700"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="inline-flex justify-center rounded-full border-2 border-slate-800 px-6 py-3 font-bold text-slate-800 transition-colors hover:bg-slate-800 hover:text-white"
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
        </div>
      )}
    </header>
  );
}
