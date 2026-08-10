import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BadgeDollarSign,
  Ban,
  BarChart3,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Edit3,
  ExternalLink,
  Eye,
  Film,
  ImageIcon,
  Loader2,
  LogOut,
  MessageCircle,
  Palmtree,
  Pencil,
  Plane,
  Plus,
  RotateCcw,
  Search,
  Send,
  ShieldAlert,
  Ticket,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { useStore } from '../lib/store';
import {
  PAYMENT_METHODS,
  fmt,
  fmtDate,
  fmtDateTime,
  methodMeta,
} from '../lib/data';
import type { Booking, Destination, Flight, PaymentMethodId } from '../lib/types';
import { MethodBadge, MethodIcon, StatusBadge } from '../components/ui';
import MediaUploader from '../components/MediaUploader';

type Tab = 'overview' | 'bookings' | 'flights' | 'destinations' | 'media' | 'chats';

const NAV: { id: Tab; label: string; short: string; desc: string; icon: typeof BarChart3 }[] = [
  { id: 'overview', label: 'Overview', short: 'Home', desc: 'Revenue, stats & recent activity', icon: BarChart3 },
  { id: 'bookings', label: 'Bookings', short: 'Bookings', desc: 'Approve or reject trip requests', icon: Ticket },
  { id: 'flights', label: 'Flights', short: 'Flights', desc: 'Add & edit flight deals', icon: Plane },
  { id: 'destinations', label: 'Destinations', short: 'Places', desc: 'Manage vacation packages', icon: Palmtree },
  { id: 'media', label: 'Media Gallery', short: 'Media', desc: 'Upload photos & videos', icon: ImageIcon },
  { id: 'chats', label: 'Messages', short: 'Chats', desc: 'Reply to traveler support chats', icon: MessageCircle },
];

export default function AdminDashboard() {
  const { user, isAdmin, signOut, bookings, resetAll } = useStore();
  const [tab, setTab] = useState<Tab>('overview');

  /* ===== access guard ===== */
  if (!user || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="max-w-sm text-center">
          <ShieldAlert className="mx-auto mb-4 h-14 w-14 text-red-500" />
          <h1 className="font-display text-3xl font-bold text-primary">Access Denied</h1>
          <p className="mt-2 text-sm font-medium text-slate-500">
            You do not have admin privileges.
            {!user && ' Sign in with an admin account first.'}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link
              to="/"
              className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-bold text-primary transition hover:bg-slate-100"
            >
              Go Home
            </Link>
            {!user && (
              <Link
                to="/login"
                className="rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-white transition hover:bg-accent-hover"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  const pendingCount = bookings.filter((b) => b.status === 'pending').length;

  return (
    <div className="min-h-screen w-full max-w-[100vw] bg-slate-50 lg:grid lg:grid-cols-[18rem_minmax(0,1fr)]">
      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="flex items-center gap-3 px-5 py-6">
          <img
            src="/logo.png"
            alt="ATL Travels logo"
            className="h-11 w-11 rounded-xl object-cover shadow-md ring-1 ring-slate-100"
          />
          <div>
            <p className="font-display text-lg leading-tight font-bold text-primary">ATL TRAVELS</p>
            <p className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase">
              Admin Panel
            </p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-4">
          {NAV.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => setTab(n.id)}
              className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-left transition ${
                tab === n.id
                  ? 'bg-accent text-white shadow-md shadow-orange-500/20'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <n.icon className="h-5 w-5 shrink-0" />
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold">{n.label}</span>
                <span
                  className={`block truncate text-[11px] font-medium ${
                    tab === n.id ? 'text-white/75' : 'text-slate-400'
                  }`}
                >
                  {n.desc}
                </span>
              </span>
              {n.id === 'bookings' && pendingCount > 0 && (
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    tab === n.id ? 'bg-white/25 text-white' : 'bg-accent/10 text-accent'
                  }`}
                >
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="border-t border-slate-100 px-4 py-4">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
          >
            <ExternalLink className="h-4.5 w-4.5" />
            View Site
          </Link>
          <button
            type="button"
            onClick={resetAll}
            className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
            title="Restore demo data"
          >
            <RotateCcw className="h-4.5 w-4.5" />
            Reset data
          </button>
          <button
            type="button"
            onClick={signOut}
            className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50"
          >
            <LogOut className="h-4.5 w-4.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ================= MAIN COLUMN ================= */}
      <div className="flex min-h-screen w-full min-w-0 flex-col">
        {/* mobile top bar */}
        <div className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
          <div className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt="ATL Travels logo"
              className="h-9 w-9 rounded-lg object-cover shadow ring-1 ring-slate-100"
            />
            <div>
              <p className="text-sm leading-tight font-bold text-primary">Admin Panel</p>
              <p className="text-[10px] font-bold text-slate-400">
                {pendingCount > 0 ? `${pendingCount} booking${pendingCount !== 1 ? 's' : ''} to review` : 'All caught up'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Link
              to="/"
              className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100"
              aria-label="View site"
              title="View site"
            >
              <ExternalLink className="h-4.5 w-4.5" />
            </Link>
            <button
              type="button"
              onClick={signOut}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-red-500 transition hover:bg-red-50"
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>

        {/* content */}
        <main className="min-w-0 flex-1 p-4 pb-28 sm:p-6 lg:p-8 lg:pb-8">
          {tab === 'overview' && <Overview goBookings={() => setTab('bookings')} />}
          {tab === 'bookings' && <BookingsTab />}
          {tab === 'flights' && <FlightsTab />}
          {tab === 'destinations' && <DestinationsTab />}
          {tab === 'media' && <MediaTab />}
          {tab === 'chats' && <ChatsTab />}
        </main>

        {/* mobile bottom tab bar */}
        <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-6 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
          {NAV.map((n) => {
            const active = tab === n.id;
            return (
              <button
                key={n.id}
                type="button"
                onClick={() => setTab(n.id)}
                className={`relative flex cursor-pointer flex-col items-center gap-1 py-2.5 text-[10px] font-bold transition ${
                  active ? 'text-accent' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {active && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-accent" />}
                <span className="relative">
                  <n.icon className="h-5 w-5" />
                  {n.id === 'bookings' && pendingCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[9px] text-white">
                      {pendingCount}
                    </span>
                  )}
                </span>
                {n.short}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

/* ============================== OVERVIEW ============================== */

function Overview({ goBookings }: { goBookings: () => void }) {
  const { bookings } = useStore();

  const approved = bookings.filter((b) => b.status === 'approved');
  const revenue = approved.reduce((s, b) => s + b.total, 0);
  const pending = bookings.filter((b) => b.status === 'pending');
  const uniqueTravelers = new Set(bookings.map((b) => b.userEmail)).size;

  const stats = [
    { label: 'Total Revenue', value: fmt(revenue), sub: '+12% vs last month', icon: BadgeDollarSign, tint: 'bg-emerald-50 text-emerald-600' },
    { label: 'Total Bookings', value: bookings.length, sub: `${approved.length} approved`, icon: Ticket, tint: 'bg-blue-50 text-blue-600' },
    { label: 'Pending Review', value: pending.length, sub: 'need your approval', icon: Clock3, tint: 'bg-amber-50 text-amber-600' },
    { label: 'Active users', value: uniqueTravelers, sub: 'with bookings', icon: Users, tint: 'bg-orange-50 text-orange-600' },
  ];

  // revenue by month (approved)
  const byMonth = useMemo(() => {
    const map = new Map<string, number>();
    approved.forEach((b) => {
      const key = new Date(b.createdAt).toLocaleString('en-US', { month: 'short' });
      map.set(key, (map.get(key) ?? 0) + b.total);
    });
    return Array.from(map.entries()).slice(-6);
  }, [bookings]);
  const maxMonth = Math.max(1, ...byMonth.map(([, v]) => v));

  const statusCounts = (['pending', 'approved', 'rejected'] as const).map((s) => ({
    status: s,
    count: bookings.filter((b) => b.status === s).length,
  }));
  const totalB = Math.max(1, bookings.length);

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-primary">Dashboard Overview</h1>
      <p className="mt-1 text-sm font-medium text-slate-500">
        Revenue, bookings and traveler activity at a glance.
      </p>
      {pending.length > 0 && (
        <button
          type="button"
          onClick={goBookings}
          className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-700 transition hover:bg-amber-100"
        >
          <Clock3 className="h-3.5 w-3.5" />
          {pending.length} booking{pending.length !== 1 ? 's' : ''} waiting for approval — tap to review
        </button>
      )}

      <div className="mt-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
            <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.tint}`}>
              <s.icon className="h-5 w-5" />
            </span>
            <p className="font-display mt-3 text-2xl font-bold text-primary">{s.value}</p>
            <p className="text-xs font-bold text-slate-500">{s.label}</p>
            <p className="mt-0.5 text-[11px] font-medium text-slate-400">{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Revenue overview */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h3 className="mb-5 text-sm font-bold tracking-wider text-slate-500 uppercase">
            Revenue Overview
          </h3>
          {byMonth.length === 0 ? (
            <p className="py-10 text-center text-sm font-medium text-slate-400">
              Revenue appears here once bookings are approved.
            </p>
          ) : (
            <div className="flex h-44 items-end gap-3">
              {byMonth.map(([month, val]) => (
                <div key={month} className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-500">{fmt(val)}</span>
                  <div
                    className="w-full rounded-t-lg bg-accent"
                    style={{ height: `${Math.max(8, (val / maxMonth) * 120)}px` }}
                  />
                  <span className="text-[11px] font-bold text-slate-400">{month}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Booking status */}
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h3 className="mb-5 text-sm font-bold tracking-wider text-slate-500 uppercase">
            Booking Status
          </h3>
          <div className="flex h-4 overflow-hidden rounded-full bg-slate-100">
            {statusCounts.map(
              (s) =>
                s.count > 0 && (
                  <div
                    key={s.status}
                    className={
                      s.status === 'approved'
                        ? 'bg-emerald-500'
                        : s.status === 'pending'
                          ? 'bg-amber-400'
                          : 'bg-red-400'
                    }
                    style={{ width: `${(s.count / totalB) * 100}%` }}
                  />
                ),
            )}
          </div>
          <ul className="mt-5 space-y-3">
            {statusCounts.map((s) => (
              <li key={s.status} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 font-bold capitalize text-slate-600">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${
                      s.status === 'approved'
                        ? 'bg-emerald-500'
                        : s.status === 'pending'
                          ? 'bg-amber-400'
                          : 'bg-red-400'
                    }`}
                  />
                  {s.status}
                </span>
                <span className="font-bold text-primary">{s.count}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Recent bookings */}
      <div className="mt-6 rounded-2xl border border-slate-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h3 className="text-sm font-bold tracking-wider text-slate-500 uppercase">
            Recent Bookings
          </h3>
          <button
            type="button"
            onClick={goBookings}
            className="cursor-pointer text-sm font-bold text-accent transition hover:text-accent-hover"
          >
            View All →
          </button>
        </div>
        {bookings.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm font-medium text-slate-400">
            No bookings yet — they will show up here as travelers book.
          </p>
        ) : (
          <ul className="divide-y divide-slate-50">
            {bookings.slice(0, 5).map((b) => (
              <li key={b.id} className="flex flex-wrap items-center gap-3 px-6 py-3.5">
                <span className="font-mono text-xs font-bold text-slate-400">#{b.id}</span>
                <span className="min-w-0 flex-1 truncate text-sm font-bold text-primary">
                  {b.itemName}
                </span>
                <MethodBadge id={b.paymentMethod} size="sm" />
                <StatusBadge status={b.status} />
                <span className="text-sm font-bold text-primary">
                  {b.total > 0 ? fmt(b.total) : 'On Request'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/* ============================== BOOKINGS ============================== */

function BookingsTab() {
  const { bookings, flights, destinations } = useStore();
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [methodFilter, setMethodFilter] = useState<'all' | PaymentMethodId>('all');
  const [query, setQuery] = useState('');
  const [active, setActive] = useState<Booking | null>(null);

  const q = query.trim().toLowerCase();
  const list = bookings.filter((b) => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    if (methodFilter !== 'all' && b.paymentMethod !== methodFilter) return false;
    if (
      q &&
      !b.id.toLowerCase().includes(q) &&
      !b.bookedBy.toLowerCase().includes(q) &&
      !b.itemName.toLowerCase().includes(q) &&
      !b.userEmail.toLowerCase().includes(q)
    )
      return false;
    return true;
  });

  void flights;
  void destinations;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-primary">Bookings</h1>
          <p className="mt-1 text-sm font-medium text-slate-500">
            {bookings.length} bookings — each row shows the traveler's chosen payment method.
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search booking, traveler, item…"
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pr-4 pl-10 text-sm font-bold text-slate-900 outline-none focus:border-accent sm:w-64"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            className="appearance-none rounded-xl border border-slate-200 bg-white py-3 pr-8 pl-10 text-sm font-bold text-slate-900 outline-none focus:border-accent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
          <CalendarClock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setMethodFilter('all')}
            className={`cursor-pointer rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
              methodFilter === 'all'
                ? 'bg-primary text-white'
                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            All methods
          </button>
          {PAYMENT_METHODS.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMethodFilter(methodFilter === m.id ? 'all' : m.id)}
              className={`flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                methodFilter === m.id
                  ? 'bg-primary text-white'
                  : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <MethodIcon id={m.id} className="h-3.5 w-3.5" />
              {m.name} ({bookings.filter((b) => b.paymentMethod === m.id).length})
            </button>
          ))}
        </div>
      </div>

      {/* mobile cards */}
      <div className="mt-5 space-y-3 md:hidden">
        {list.length === 0 ? (
          <div className="rounded-2xl border border-slate-100 bg-white py-16 text-center shadow-sm">
            <Ticket className="mx-auto mb-3 h-12 w-12 text-slate-300" />
            <p className="text-sm font-bold text-slate-400">No bookings found</p>
          </div>
        ) : (
          list.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setActive(b)}
              className="w-full cursor-pointer rounded-2xl border border-slate-100 bg-white p-4 text-left shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-xs font-bold text-slate-400">#{b.id}</span>
                <StatusBadge status={b.status} />
              </div>
              <p className="mt-2 text-sm font-bold text-primary">{b.itemName}</p>
              <p className="text-xs font-medium text-slate-500">
                {b.bookedBy} · {b.passengers} passenger{b.passengers !== 1 ? 's' : ''} ·{' '}
                {fmtDateTime(b.createdAt)}
              </p>
              <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                <MethodBadge id={b.paymentMethod} size="sm" />
                <span className="flex items-center gap-2 text-sm font-bold text-primary">
                  {b.total > 0 ? fmt(b.total) : 'On Request'}
                  <span className="flex items-center gap-1 text-xs font-bold text-accent">
                    Review <Eye className="h-3.5 w-3.5" />
                  </span>
                </span>
              </div>
            </button>
          ))
        )}
      </div>

      {/* desktop table */}
      <div className="mt-5 hidden overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm md:block">
        {list.length === 0 ? (
          <div className="py-16 text-center">
            <Ticket className="mx-auto mb-3 h-12 w-12 text-slate-300" />
            <p className="text-sm font-bold text-slate-400">No bookings found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                  <th className="px-5 py-3.5">Booking</th>
                  <th className="px-5 py-3.5">Traveler</th>
                  <th className="px-5 py-3.5">Payment Method</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Total</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {list.map((b) => (
                  <tr key={b.id} className="transition hover:bg-slate-50/60">
                    <td className="px-5 py-4">
                      <p className="font-mono text-xs font-bold text-primary">#{b.id}</p>
                      <p className="max-w-52 truncate text-xs font-medium text-slate-500">
                        {b.itemName}
                      </p>
                      <p className="text-[11px] font-medium text-slate-400">
                        {fmtDateTime(b.createdAt)}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm font-bold text-primary">{b.bookedBy}</p>
                      <p className="text-xs font-medium text-slate-400">{b.userEmail}</p>
                    </td>
                    <td className="px-5 py-4">
                      <MethodBadge id={b.paymentMethod} size="sm" />
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={b.status} />
                    </td>
                    <td className="px-5 py-4 text-right font-bold">{fmt(b.total)}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => setActive(b)}
                          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-slate-100 transition hover:bg-slate-200"
                          aria-label={`Review booking ${b.id}`}
                        >
                          <Eye className="h-4 w-4 text-slate-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <BookingReviewModal booking={active} onClose={() => setActive(null)} />
    </div>
  );
}

/** Admin review modal — shows the chosen payment method and sends the
 *  matching payment details to the traveler on approval. */
function BookingReviewModal({ booking, onClose }: { booking: Booking | null; onClose: () => void }) {
  const { approveBooking, rejectBooking } = useStore();
  const [instructions, setInstructions] = useState('');
  const lastBookingId = useRef<string | null>(null);

  if (booking && booking.id !== lastBookingId.current) {
    lastBookingId.current = booking.id;
    setInstructions(booking.paymentInstructions ?? '');
  }

  if (!booking) return null;
  const meta = methodMeta(booking.paymentMethod);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-[70] flex items-end justify-center bg-primary/60 backdrop-blur-sm sm:items-center sm:p-4"
      >
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-[2rem] bg-white shadow-2xl sm:rounded-[2rem]"
        >
          {/* header */}
          <div className="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-slate-100 bg-white px-7 py-5 sm:rounded-t-[2rem]">
            <div>
              <p className="font-mono text-xs font-bold text-slate-400">#{booking.id}</p>
              <h3 className="font-display mt-0.5 text-2xl font-bold text-primary">
                {booking.itemName}
              </h3>
              <p className="text-xs font-medium text-slate-500">
                Booking Date: {fmtDateTime(booking.createdAt)} · {booking.passengers} passenger
                {booking.passengers !== 1 ? 's' : ''} ·{' '}
                <span className="font-bold text-primary">{fmt(booking.total)}</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={booking.status} />
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="px-7 py-6">
            {/* chosen payment method — prominent so the right details go out */}
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3.5">
              <div>
                <p className="text-[11px] font-bold tracking-wider text-orange-900 uppercase">
                  Traveler wants to pay with
                </p>
                <div className="mt-1.5 flex items-center gap-2">
                  <MethodBadge id={booking.paymentMethod} />
                  <span className="text-xs font-medium text-orange-800">({meta.desc})</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-bold tracking-wider text-orange-900 uppercase">
                  Amount due
                </p>
                <p className="font-display text-xl font-bold text-primary">
                  {booking.total > 0 ? fmt(booking.total) : 'On Request'}
                </p>
              </div>
            </div>

            {/* traveler details */}
            <p className="mb-2 text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              Traveler Details
            </p>
            <dl className="mb-5 grid grid-cols-2 gap-x-4 gap-y-3 rounded-xl border border-slate-100 bg-slate-50 p-4 sm:grid-cols-3">
              {[
                ['Name', booking.traveler.fullName],
                ['DOB', booking.traveler.dob],
                ['Phone', booking.traveler.phone],
                ['Passport', booking.traveler.passport || '—'],
                ['Country', booking.traveler.country],
                ['State', booking.traveler.state],
                ['Reason', booking.traveler.reason],
                ['Address', booking.traveler.address],
                ['Emergency', `${booking.traveler.emergencyName} (${booking.traveler.emergencyPhone})`],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">{k}</dt>
                  <dd className="mt-0.5 text-xs font-bold break-words text-slate-800">{v}</dd>
                </div>
              ))}
              {booking.traveler.notes && (
                <div className="col-span-2 sm:col-span-3">
                  <dt className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                    Special Requests
                  </dt>
                  <dd className="mt-0.5 text-xs font-bold text-slate-800">{booking.traveler.notes}</dd>
                </div>
              )}
            </dl>

            {/* payment instructions composer */}
            <p className="mb-2 text-[11px] font-bold tracking-wider text-slate-500 uppercase">
              Payment details to send (Payment: {meta.name})
            </p>
            <div className="mb-2.5 flex flex-wrap gap-1.5">
              {PAYMENT_METHODS.map((m) => {
                const isChosen = m.id === booking.paymentMethod;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setInstructions(m.template(booking.id))}
                    className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-bold transition ${
                      isChosen
                        ? 'border-accent bg-accent text-white shadow-sm'
                        : 'border-orange-200 bg-white text-orange-800 hover:bg-orange-100'
                    }`}
                  >
                    <MethodIcon id={m.id} className="h-3 w-3" />
                    {m.templateLabel}
                    {isChosen && <span className="ml-1 rounded-full bg-white/25 px-1.5 text-[9px]">CHOSEN</span>}
                  </button>
                );
              })}
            </div>
            <textarea
              rows={4}
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Enter handles/accounts, wire details, or rejection notes..."
              className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 outline-none focus:border-accent"
            />
            <p className="mt-1.5 text-[11px] font-medium text-slate-400">
              Tip: use the highlighted template — it matches this traveler's payment method, so the
              correct handle/account always goes out.
            </p>

            {booking.status === 'pending' ? (
              <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
                <button
                  type="button"
                  disabled={!instructions.trim()}
                  onClick={() => {
                    approveBooking(booking.id, instructions.trim());
                    onClose();
                  }}
                  className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 font-bold text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <CheckCircle2 className="h-4.5 w-4.5" />
                  Approve &amp; Send Payment Details
                </button>
                <button
                  type="button"
                  onClick={() => {
                    rejectBooking(booking.id, instructions.trim());
                    onClose();
                  }}
                  className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-500 py-3 font-bold text-white transition hover:bg-red-600"
                >
                  <Ban className="h-4.5 w-4.5" />
                  Reject
                </button>
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                  Instructions sent to traveler
                </p>
                <p className="mt-1 text-sm font-medium whitespace-pre-wrap text-slate-700">
                  {booking.paymentInstructions || '—'}
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* ============================== FLIGHTS ============================== */

const EMPTY_FLIGHT: Flight = {
  id: 0,
  airline: '',
  departure_city: 'ATL',
  arrival_city: '',
  departure_date: '',
  arrival_date: '',
  price: 0,
  available_seats: 100,
  duration: '',
  stops: 'Non-stop',
};

function FlightsTab() {
  const { flights, saveFlight, deleteFlight } = useStore();
  const [editing, setEditing] = useState<Flight | null>(null);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-primary">
            Flights <span className="font-sans text-base font-bold text-slate-400">{flights.length} flights</span>
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Add and edit the flight deals shown on the site. Date, time and price are optional —
            leave empty for “On Request”.
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            setEditing({ ...EMPTY_FLIGHT, id: Math.max(0, ...flights.map((f) => f.id)) + 1 })
          }
          className="flex cursor-pointer items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition hover:bg-accent-hover"
        >
          <Plus className="h-4 w-4" />
          Add Flight
        </button>
      </div>

      {flights.length === 0 ? (
        <p className="py-16 text-center text-sm font-bold text-slate-400">No flights found</p>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {flights.map((f) => (
            <div key={f.id} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Plane className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-primary">{f.airline || 'Airline TBD'}</p>
                    <p className="text-[11px] font-medium text-slate-400">
                      {f.departure_date ? fmtDate(f.departure_date) : 'Date TBD'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setEditing(f)}
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-slate-100 transition hover:bg-slate-200"
                    aria-label="Edit flight"
                  >
                    <Edit3 className="h-4 w-4 text-slate-600" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteFlight(f.id)}
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-red-100 transition hover:bg-red-200"
                    aria-label="Delete flight"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </button>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="font-display text-xl font-bold text-primary">{f.departure_city}</span>
                <Plane className="h-4 w-4 rotate-45 text-accent" />
                <span className="font-display text-xl font-bold text-primary">{f.arrival_city}</span>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-bold">
                <span className="text-slate-500">
                  {f.available_seats} seats · {f.stops || 'Non-stop'}
                </span>
                <span className="text-accent">{f.price > 0 ? fmt(f.price) : 'On Request'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* editor modal */}
      <AnimatePresence>
        {editing && (
          <ModalShell onClose={() => setEditing(null)} title={flights.some((f) => f.id === editing.id) ? 'Edit Flight' : 'Add Flight'}>
            <FlightForm
              flight={editing}
              onCancel={() => setEditing(null)}
              onSave={(f) => {
                saveFlight(f);
                setEditing(null);
              }}
            />
          </ModalShell>
        )}
      </AnimatePresence>
    </div>
  );
}

function FlightForm({
  flight,
  onSave,
  onCancel,
}: {
  flight: Flight;
  onSave: (f: Flight) => void;
  onCancel: () => void;
}) {
  const [f, setF] = useState(flight);
  const set = (k: keyof Flight, v: string | number) => setF((x) => ({ ...x, [k]: v }));
  const ok = !!f.airline.trim() && !!f.arrival_city.trim();

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (ok) onSave(f);
      }}
    >
      <div className="grid grid-cols-2 gap-3">
        <label className="col-span-2 block">
          <span className="mb-1.5 block text-xs font-bold text-slate-500 uppercase">Airline *</span>
          <input required value={f.airline} onChange={(e) => set('airline', e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-accent" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold text-slate-500 uppercase">From</span>
          <input value={f.departure_city} onChange={(e) => set('departure_city', e.target.value.toUpperCase())} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-accent" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold text-slate-500 uppercase">To *</span>
          <input required value={f.arrival_city} onChange={(e) => set('arrival_city', e.target.value.toUpperCase())} placeholder="MIA" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-accent" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold text-slate-500 uppercase">Departure</span>
          <input type="datetime-local" value={f.departure_date ? f.departure_date.slice(0, 16) : ''} onChange={(e) => set('departure_date', e.target.value ? new Date(e.target.value).toISOString() : '')} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-accent" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold text-slate-500 uppercase">Arrival</span>
          <input type="datetime-local" value={f.arrival_date ? f.arrival_date.slice(0, 16) : ''} onChange={(e) => set('arrival_date', e.target.value ? new Date(e.target.value).toISOString() : '')} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-accent" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold text-slate-500 uppercase">Price (USD) — optional</span>
          <input type="number" min={0} value={f.price || ''} onChange={(e) => set('price', Number(e.target.value))} placeholder="Leave empty = On Request" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-accent" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold text-slate-500 uppercase">Seats</span>
          <input type="number" min={0} value={f.available_seats} onChange={(e) => set('available_seats', Number(e.target.value))} placeholder="Default: 100" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-accent" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold text-slate-500 uppercase">Duration</span>
          <input value={f.duration} onChange={(e) => set('duration', e.target.value)} placeholder="1h 45m" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-accent" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold text-slate-500 uppercase">Stops</span>
          <input value={f.stops} onChange={(e) => set('stops', e.target.value)} placeholder="Non-stop" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-accent" />
        </label>
      </div>
      <div className="flex gap-3 pt-1">
        <button type="submit" disabled={!ok} className="flex-1 cursor-pointer rounded-xl bg-accent py-3 font-bold text-white transition hover:bg-accent-hover disabled:opacity-50">
          Save Flight Changes
        </button>
        <button type="button" onClick={onCancel} className="flex-1 cursor-pointer rounded-xl border border-slate-200 py-3 font-bold text-primary transition hover:bg-slate-50">
          Cancel
        </button>
      </div>
    </form>
  );
}

/* ============================== DESTINATIONS ============================== */

const EMPTY_DEST: Omit<Destination, 'id'> = {
  name: '',
  location: '',
  description: '',
  price: 0,
  rating: '5.0',
  reviews: '',
  image: '',
};

function DestinationsTab() {
  const { destinations, saveDestination, deleteDestination } = useStore();
  const [editing, setEditing] = useState<Destination | null>(null);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-primary">
            Destinations{' '}
            <span className="font-sans text-base font-bold text-slate-400">
              {destinations.length} destinations
            </span>
          </h1>
          <p className="mt-1 max-w-xl text-sm font-medium text-slate-500">
            Create and edit the vacation packages travelers can book. Tap a package to edit its
            price, details, or photo.
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            setEditing({
              ...EMPTY_DEST,
              id: Math.max(0, ...destinations.map((d) => d.id)) + 1,
            })
          }
          className="flex cursor-pointer items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition hover:bg-accent-hover"
        >
          <Plus className="h-4 w-4" />
          Add Destination
        </button>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {destinations.map((d) => (
          <div key={d.id} className="group relative overflow-hidden rounded-2xl shadow-sm ring-1 ring-slate-100">
            <img src={d.image} alt={d.name} className="h-44 w-full object-cover" />
            <div className="absolute top-2 right-2 flex gap-1.5">
              <button
                type="button"
                onClick={() => setEditing(d)}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-white/90 shadow-sm backdrop-blur transition hover:bg-white"
                aria-label="Edit destination"
              >
                <Pencil className="h-3.5 w-3.5 text-slate-600" />
              </button>
              <button
                type="button"
                onClick={() => deleteDestination(d.id)}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-white/90 shadow-sm backdrop-blur transition hover:bg-white"
                aria-label="Delete destination"
              >
                <Trash2 className="h-3.5 w-3.5 text-red-600" />
              </button>
            </div>
            <div className="bg-white p-4">
              <p className="truncate text-sm font-bold text-primary">{d.name}</p>
              <p className="mt-0.5 flex items-center justify-between text-xs font-medium text-slate-500">
                {d.location}
                <span className="font-bold text-accent">{fmt(d.price)}</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {editing && (
          <ModalShell
            wide
            onClose={() => setEditing(null)}
            title={destinations.some((d) => d.id === editing.id) ? 'Edit Destination' : 'Add Destination'}
          >
            <DestinationForm
              dest={editing}
              onCancel={() => setEditing(null)}
              onSave={(d) => {
                saveDestination(d);
                setEditing(null);
              }}
            />
          </ModalShell>
        )}
      </AnimatePresence>
    </div>
  );
}

function DestinationForm({
  dest,
  onSave,
  onCancel,
}: {
  dest: Destination;
  onSave: (d: Destination) => void;
  onCancel: () => void;
}) {
  const { media } = useStore();
  const [d, setD] = useState(dest);
  const ok = d.name.trim() && d.location.trim() && d.price > 0 && d.image;

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (ok) onSave(d);
      }}
    >
      <div className="grid grid-cols-2 gap-3">
        <label className="col-span-2 block">
          <span className="mb-1.5 block text-xs font-bold text-slate-500 uppercase">Package name *</span>
          <input required value={d.name} onChange={(e) => setD({ ...d, name: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-accent" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold text-slate-500 uppercase">Location *</span>
          <input required value={d.location} onChange={(e) => setD({ ...d, location: e.target.value })} placeholder="Cancun, Mexico" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-accent" />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-bold text-slate-500 uppercase">Price (USD) *</span>
          <input type="number" min={0} required value={d.price || ''} onChange={(e) => setD({ ...d, price: Number(e.target.value) })} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-accent" />
        </label>
        <label className="col-span-2 block">
          <span className="mb-1.5 block text-xs font-bold text-slate-500 uppercase">Description</span>
          <textarea rows={3} value={d.description} onChange={(e) => setD({ ...d, description: e.target.value })} className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-accent" />
        </label>
      </div>

      <div>
        <span className="mb-1.5 block text-xs font-bold text-slate-500 uppercase">Image URL</span>
        <input
          value={d.image}
          onChange={(e) => setD({ ...d, image: e.target.value })}
          placeholder="https://… or pick / upload below"
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-accent"
        />
        {d.image && (
          <img src={d.image} alt="Preview" className="mt-3 h-40 w-full rounded-xl object-cover ring-1 ring-slate-200" />
        )}
      </div>

      <div>
        <span className="mb-1.5 block text-xs font-bold text-slate-500 uppercase">Or click from your Media Library:</span>
        <div className="grid max-h-44 grid-cols-4 gap-2 overflow-y-auto rounded-xl border border-slate-100 bg-slate-50 p-2 sm:grid-cols-6">
          {media.filter((m) => m.type === 'photo').map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setD({ ...d, image: m.url })}
              className={`overflow-hidden rounded-lg ring-2 transition ${
                d.image === m.url ? 'scale-105 border-accent ring-orange-200' : 'ring-transparent hover:ring-slate-300'
              }`}
            >
              <img src={m.url} alt={m.title} className="h-16 w-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-1">
        <button type="submit" disabled={!ok} className="flex-1 cursor-pointer rounded-xl bg-accent py-3 font-bold text-white transition hover:bg-accent-hover disabled:opacity-50">
          Save Changes
        </button>
        <button type="button" onClick={onCancel} className="flex-1 cursor-pointer rounded-xl border border-slate-200 py-3 font-bold text-primary transition hover:bg-slate-50">
          Cancel
        </button>
      </div>
    </form>
  );
}

/* ============================== MEDIA ============================== */

function MediaTab() {
  const { media, deleteMedia } = useStore();
  const [lightbox, setLightbox] = useState<string | null>(null);
  const photos = media.filter((m) => m.type === 'photo').length;
  const videos = media.filter((m) => m.type === 'video').length;

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-primary">
        Media Gallery{' '}
        <span className="font-sans text-base font-bold text-slate-400">
          {photos} Photos, {videos} Videos
        </span>
      </h1>
      <p className="mt-1 max-w-xl text-sm font-medium text-slate-500">
        Upload travel photos and videos (multiple files at once) — they appear instantly in the
        public gallery on the site.
      </p>

      <div className="mt-6">
        <p className="mb-2 text-xs font-bold tracking-wider text-slate-500 uppercase">
          Bulk Media Upload
        </p>
        <MediaUploader />
      </div>

      {media.length === 0 ? (
        <p className="py-16 text-center text-sm font-bold text-slate-400">No media files found</p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {media.map((m) => (
            <div key={m.id} className="group relative overflow-hidden rounded-2xl ring-1 ring-slate-100">
              {m.type === 'photo' ? (
                <button
                  type="button"
                  onClick={() => setLightbox(m.url)}
                  className="block w-full cursor-pointer"
                  aria-label={`View ${m.title}`}
                >
                  <img src={m.url} alt={m.title} className="h-44 w-full object-cover" />
                </button>
              ) : (
                <div className="relative">
                  <video src={m.url} className="h-44 w-full object-cover" muted preload="metadata" />
                  <span className="absolute top-2 left-2 rounded-full bg-primary/70 px-2 py-0.5 text-[10px] font-bold text-white uppercase">
                    Video
                  </span>
                </div>
              )}
              <button
                type="button"
                onClick={() => deleteMedia(m.id)}
                className="absolute top-2 right-2 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-red-500 text-white opacity-0 shadow-sm transition group-hover:opacity-100"
                aria-label="Delete media"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <div className="absolute right-0 bottom-0 left-0 bg-primary/85 px-3 py-1.5 text-[10px] font-bold text-white backdrop-blur">
                <span className="flex items-center gap-1 truncate">
                  {m.type === 'photo' ? <ImageIcon className="h-3 w-3 text-blue-300" /> : <Film className="h-3 w-3 text-purple-300" />}
                  {m.title}
                  {m.source === 'upload' && <span className="ml-auto shrink-0 opacity-70">uploaded by Admin</span>}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-primary/90 p-4"
          >
            <button
              type="button"
              onClick={() => setLightbox(null)}
              className="absolute top-4 right-4 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <img src={lightbox} alt="Media preview" className="max-h-[80vh] max-w-full rounded-lg" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ============================== CHATS ============================== */

function ChatsTab() {
  const { threads, sendMessage } = useStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const active = threads.find((t) => t.id === activeId) ?? threads[0] ?? null;

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-primary">Messages</h1>
      <p className="mt-1 text-sm font-medium text-slate-500">
        Support threads created when bookings are approved.
      </p>

      {threads.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-slate-100 bg-white py-16 text-center shadow-sm">
          <MessageCircle className="mx-auto mb-3 h-10 w-10 text-slate-200" />
          <p className="text-sm font-bold text-slate-400">
            No conversations yet — approve a booking to open one.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 lg:grid-cols-[300px_1fr]">
          <aside className="space-y-2">
            {threads.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveId(t.id)}
                className={`w-full cursor-pointer rounded-2xl border p-4 text-left transition ${
                  active?.id === t.id
                    ? 'border-l-4 border-l-accent border-slate-100 bg-blue-50 shadow-sm'
                    : 'border-slate-100 bg-white hover:bg-slate-50'
                }`}
              >
                <p className="text-sm font-bold text-primary">
                  {t.userName} <span className="font-mono text-xs font-bold text-slate-400">#{t.bookingId}</span>
                </p>
                <p className="mt-0.5 truncate text-xs font-medium text-slate-500">
                  {t.messages[t.messages.length - 1]?.text ?? ''}
                </p>
              </button>
            ))}
          </aside>

          <section className="flex h-[60vh] flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            {!active ? (
              <div className="flex flex-1 items-center justify-center text-sm font-bold text-slate-400">
                Select a conversation
              </div>
            ) : (
              <>
                <div className="border-b border-slate-100 px-5 py-3.5 text-sm font-bold text-primary">
                  Booking #{active.bookingId} · {active.userEmail}
                </div>
                <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 px-5 py-4">
                  {active.messages.map((m) => (
                    <div key={m.id} className={`flex ${m.from === 'admin' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm font-medium whitespace-pre-wrap shadow-sm ${
                          m.from === 'admin'
                            ? 'rounded-br-md bg-accent text-white'
                            : 'rounded-bl-md bg-white text-primary ring-1 ring-slate-100'
                        }`}
                      >
                        {m.text}
                        <span className={`mt-1 block text-[10px] ${m.from === 'admin' ? 'text-white/70' : 'text-slate-400'}`}>
                          {fmtDateTime(m.at)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <form
                  className="flex items-center gap-2 border-t border-slate-100 p-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!draft.trim() || !active) return;
                    sendMessage(active.id, 'admin', draft.trim());
                    setDraft('');
                  }}
                >
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Reply to traveler…"
                    className="flex-1 rounded-full border border-slate-200 px-4 py-2.5 text-sm font-bold outline-none focus:border-accent focus:ring-2 focus:ring-orange-100"
                  />
                  <button
                    type="submit"
                    className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-accent text-white transition hover:bg-accent-hover"
                    aria-label="Send reply"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

/* ============================== shared shell ============================== */

function ModalShell({
  children,
  onClose,
  title,
  wide = false,
}: {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
  wide?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[70] flex items-end justify-center bg-primary/60 backdrop-blur-sm sm:items-center sm:p-4"
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className={`max-h-[90vh] w-full overflow-y-auto rounded-t-[2rem] bg-white shadow-2xl sm:rounded-[2rem] ${
          wide ? 'max-w-3xl' : 'max-w-xl'
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-7 py-5">
          <h3 className="font-display text-2xl font-bold text-primary">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-7 py-6">{children}</div>
      </motion.div>
    </motion.div>
  );
}

/** loading spinner used while async data resolves */
export function Spinner() {
  return <Loader2 className="h-8 w-8 animate-spin text-primary" />;
}
