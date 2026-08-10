import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  BadgeDollarSign,
  CalendarCheck,
  Clock3,
  Compass,
  LogOut,
  MessageCircle,
  Plane,
  Ticket,
  User,
  X,
} from 'lucide-react';
import Header from '../components/Header';
import { MethodBadge, StatusBadge } from '../components/ui';
import { useStore } from '../lib/store';
import type { Booking } from '../lib/types';
import { fmt, fmtDate, fmtDateTime } from '../lib/data';

export default function UserDashboard() {
  const { user, myBookings, threads, signOut, isAdmin } = useStore();
  const [active, setActive] = useState<Booking | null>(null);

  if (!user) return <Navigate to="/login" replace />;

  const approved = myBookings.filter((b) => b.status === 'approved');
  const pending = myBookings.filter((b) => b.status === 'pending');
  const spent = approved.reduce((s, b) => s + b.total, 0);

  const stats = [
    { label: 'Total Bookings', value: myBookings.length, icon: Ticket, tint: 'bg-blue-50 text-blue-600' },
    { label: 'Approved Trips', value: approved.length, icon: CalendarCheck, tint: 'bg-emerald-50 text-emerald-600' },
    { label: 'Pending Review', value: pending.length, icon: Clock3, tint: 'bg-amber-50 text-amber-600' },
    { label: 'Total Spent', value: fmt(spent), icon: BadgeDollarSign, tint: 'bg-orange-50 text-orange-600' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Header />
      <main className="mx-auto max-w-7xl px-4 pt-28 sm:px-6 lg:px-8">
        {/* Welcome strip */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-primary p-7 text-white shadow-xl">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-lg font-bold">
              {user.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
            </span>
            <div>
              <h1 className="font-display text-2xl font-bold sm:text-3xl">
                Welcome back, {user.name.split(' ')[0]}
              </h1>
              <p className="text-sm font-medium text-white/60">Manage your bookings and profile</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/chat"
              className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-bold transition hover:bg-white/20"
            >
              <MessageCircle className="h-4 w-4" />
              Support Chat
              {threads.filter((t) => t.userEmail === user.email).length > 0 && (
                <span className="rounded-full bg-accent px-2 py-0.5 text-[10px]">
                  {threads.filter((t) => t.userEmail === user.email).length}
                </span>
              )}
            </Link>
            <Link
              to="/profile"
              className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-bold transition hover:bg-white/20"
            >
              <User className="h-4 w-4" />
              Profile
            </Link>
            {isAdmin && (
              <Link
                to="/admin/dashboard"
                className="flex items-center gap-2 rounded-xl bg-accent/20 px-4 py-2.5 text-sm font-bold text-accent transition hover:bg-accent/30"
              >
                Admin
              </Link>
            )}
            <button
              type="button"
              onClick={signOut}
              className="flex cursor-pointer items-center gap-2 rounded-xl bg-red-500/15 px-4 py-2.5 text-sm font-bold text-red-300 transition hover:bg-red-500/25"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.tint}`}>
                <s.icon className="h-5 w-5" />
              </span>
              <p className="font-display mt-3 text-2xl font-bold text-primary">{s.value}</p>
              <p className="text-xs font-bold text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Quick links */}
        <div className="mb-10 grid gap-4 sm:grid-cols-2">
          <Link
            to="/destinations"
            className="group flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Compass className="h-6 w-6" />
              </span>
              <div>
                <p className="font-bold text-primary">Explore Destinations</p>
                <p className="text-xs font-medium text-slate-500">Handpicked luxury escapes</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-slate-300 transition group-hover:translate-x-1 group-hover:text-accent" />
          </Link>
          <Link
            to="/bookings"
            className="group flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                <Plane className="h-6 w-6" />
              </span>
              <div>
                <p className="font-bold text-primary">Book a Flight</p>
                <p className="text-xs font-medium text-slate-500">Find deals from ATL</p>
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-slate-300 transition group-hover:translate-x-1 group-hover:text-accent" />
          </Link>
        </div>

        {/* Bookings */}
        <h2 className="font-display mb-5 text-2xl font-bold text-primary">
          Your Bookings{' '}
          <span className="text-base font-sans font-bold text-slate-400">
            {myBookings.length} total
          </span>
        </h2>
        {myBookings.length === 0 ? (
          <div className="rounded-3xl border border-slate-100 bg-white py-16 text-center shadow-sm">
            <Ticket className="mx-auto mb-4 h-16 w-16 text-slate-200" />
            <p className="font-display text-xl font-bold text-primary">No bookings yet</p>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Your trips will appear here once you book.
            </p>
            <Link
              to="/destinations"
              className="mt-6 inline-flex items-center rounded-full bg-accent px-6 py-3 font-bold text-white shadow-lg transition hover:bg-accent-hover"
            >
              Start Exploring
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {myBookings.map((b) => (
              <div
                key={b.id}
                className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition hover:shadow-md sm:flex-row sm:items-center"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-400">#{b.id}</span>
                    <StatusBadge status={b.status} />
                    <MethodBadge id={b.paymentMethod} size="sm" />
                  </div>
                  <h3 className="font-display mt-2 text-lg font-bold text-primary">{b.itemName}</h3>
                  <p className="text-xs font-medium text-slate-500">
                    Booked by: {b.bookedBy} · {b.passengers} passenger{b.passengers !== 1 ? 's' : ''} ·{' '}
                    {fmtDateTime(b.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-5">
                  <p className="font-display text-xl font-bold text-primary">{fmt(b.total)}</p>
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => setActive(b)}
                      className="cursor-pointer text-sm font-bold text-blue-600 transition hover:text-blue-700"
                    >
                      View Details
                    </button>
                    {b.status === 'approved' && (
                      <Link
                        to="/chat"
                        className="flex items-center gap-1 text-sm font-bold text-emerald-600 transition hover:text-emerald-700"
                      >
                        Chat Support
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Details modal */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
            className="fixed inset-0 z-[70] flex items-end justify-center bg-primary/60 backdrop-blur-sm sm:items-center sm:p-4"
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-t-[2rem] bg-white p-7 shadow-2xl sm:rounded-[2rem]"
            >
              <div className="mb-5 flex items-start justify-between">
                <div>
                  <p className="font-mono text-xs font-bold text-slate-400">#{active.id}</p>
                  <h3 className="font-display mt-1 text-2xl font-bold text-primary">
                    Booking Details
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActive(null)}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-4 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <div>
                  <p className="text-sm font-bold text-primary">{active.itemName}</p>
                  <p className="text-xs font-medium text-slate-500">
                    {fmt(active.unitPrice)} × {active.passengers} passenger{active.passengers !== 1 ? 's' : ''} ·{' '}
                    {fmtDate(active.createdAt)}
                  </p>
                </div>
                <StatusBadge status={active.status} />
              </div>

              {/* Payment method — clearly shown */}
              <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                  Selected Payment Method
                </p>
                <div className="mt-1.5">
                  <MethodBadge id={active.paymentMethod} />
                </div>
              </div>

              {active.status === 'approved' && active.paymentInstructions && (
                <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-[11px] font-bold tracking-wider text-emerald-700 uppercase">
                    Payment Instructions from Admin:
                  </p>
                  <p className="mt-1.5 text-sm font-medium whitespace-pre-wrap text-emerald-900">
                    {active.paymentInstructions}
                  </p>
                </div>
              )}
              {active.status === 'pending' && (
                <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-sm font-medium text-amber-800">
                    An admin is reviewing your booking. Payment instructions for your selected
                    method will appear here once approved.
                  </p>
                </div>
              )}
              {active.status === 'rejected' && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4">
                  <p className="text-sm font-medium whitespace-pre-wrap text-red-800">
                    {active.paymentInstructions || 'Booking rejected by admin'}
                  </p>
                </div>
              )}

              <p className="mb-2 text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                Your Travel Details
              </p>
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-xl border border-slate-100 p-4">
                {[
                  ['Full Name', active.traveler.fullName],
                  ['Date of Birth', active.traveler.dob],
                  ['Phone', active.traveler.phone],
                  ['Passport', active.traveler.passport || '—'],
                  ['Country', active.traveler.country],
                  ['State', active.traveler.state],
                  ['Reason for Trip', active.traveler.reason],
                  ['Emergency Contact', `${active.traveler.emergencyName} (${active.traveler.emergencyPhone})`],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">{k}</dt>
                    <dd className="mt-0.5 text-xs font-bold break-words text-slate-800">{v}</dd>
                  </div>
                ))}
                {active.traveler.notes && (
                  <div className="col-span-2">
                    <dt className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                      Special Requests
                    </dt>
                    <dd className="mt-0.5 text-xs font-bold text-slate-800">{active.traveler.notes}</dd>
                  </div>
                )}
              </dl>

              {active.status === 'approved' && (
                <Link
                  to="/chat"
                  onClick={() => setActive(null)}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3 text-center font-bold text-white transition hover:bg-emerald-600"
                >
                  <MessageCircle className="h-4 w-4" />
                  Open Chat Support
                </Link>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
