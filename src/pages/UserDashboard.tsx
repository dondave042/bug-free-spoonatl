import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Clock,
  DollarSign,
  MessageCircle,
  Plane,
  User,
} from "lucide-react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { StatusPill } from "../components/ui";
import { useStore } from "../lib/store";
import { getPaymentMethod } from "../lib/data";
import { formatDateTime, initials, money } from "../lib/utils";
import type { Booking } from "../lib/types";

export function UserDashboard() {
  const {
    user,
    myBookings,
    myTripRequests,
    threads,
    signOut,
    isAdmin,
  } = useStore();
  const nav = useNavigate();
  const [open, setOpen] = useState<Booking | null>(null);

  if (!user) return <Navigate to="/login" replace />;

  const approved = myBookings.filter((b) => b.status === "approved");
  const pending = myBookings.filter((b) => b.status === "pending");
  const spent = approved.reduce((s, b) => s + b.total, 0);
  const stats = [
    {
      label: "Total Bookings",
      value: myBookings.length,
      icon: Plane,
      tint: "bg-blue-50 text-blue-600",
    },
    {
      label: "Approved Trips",
      value: approved.length,
      icon: CheckCircle2,
      tint: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Pending Review",
      value: pending.length,
      icon: Clock,
      tint: "bg-amber-50 text-amber-600",
    },
    {
      label: "Total Spent",
      value: money(spent),
      icon: DollarSign,
      tint: "bg-orange-50 text-orange-600",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Header />
      <main className="mx-auto max-w-7xl px-4 pt-28 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-primary p-7 text-white shadow-xl">
          <div className="flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-lg font-bold">
              {initials(user.name)}
            </span>
            <div>
              <h1 className="font-display text-2xl font-bold sm:text-3xl">
                Welcome back, {user.name.split(" ")[0]}
              </h1>
              <p className="text-sm font-medium text-white/60">
                Manage your bookings and profile
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/profile"
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2.5 text-xs font-bold hover:bg-white/20"
            >
              <User className="h-4 w-4" /> Profile
            </Link>
            <Link
              to="/chat"
              className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2.5 text-xs font-bold hover:bg-white/20"
            >
              <MessageCircle className="h-4 w-4" /> Messages
            </Link>
            {isAdmin && (
              <Link
                to="/admin/dashboard"
                className="rounded-full bg-accent px-4 py-2.5 text-xs font-bold"
              >
                Admin
              </Link>
            )}
            <button
              type="button"
              onClick={() => {
                signOut();
                nav("/");
              }}
              className="cursor-pointer rounded-full bg-red-500 px-4 py-2.5 text-xs font-bold"
            >
              Sign Out
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.tint}`}
              >
                <s.icon className="h-5 w-5" />
              </span>
              <p className="font-display mt-3 text-2xl font-bold text-primary">
                {s.value}
              </p>
              <p className="text-xs font-bold text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>

        <h2 className="font-display mt-10 mb-4 text-2xl font-bold text-primary">
          Your Bookings
        </h2>
        {myBookings.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white py-16 text-center">
            <p className="font-bold text-primary">No bookings yet</p>
            <p className="mt-1 text-sm font-medium text-slate-400">
              Your trips will appear here once you book.
            </p>
            <Link
              to="/bookings"
              className="mt-5 inline-flex rounded-full bg-accent px-6 py-2.5 text-sm font-bold text-white"
            >
              Book a Flight
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {myBookings.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setOpen(b)}
                className="flex w-full cursor-pointer items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-white px-5 py-4 text-left shadow-sm transition hover:border-accent/40"
              >
                <div>
                  <p className="text-sm font-bold text-primary">{b.itemName}</p>
                  <p className="text-xs font-medium text-slate-400">
                    #{b.id} · {formatDateTime(b.createdAt)} · Booked by: {b.bookedBy}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-display text-lg font-bold text-accent">
                    {money(b.total)}
                  </p>
                  <StatusPill status={b.status} />
                </div>
              </button>
            ))}
          </div>
        )}

        <h2 className="font-display mt-10 mb-4 text-2xl font-bold text-primary">
          Trip Requests
        </h2>
        {myTripRequests.length === 0 ? (
          <p className="rounded-2xl border border-slate-100 bg-white px-5 py-8 text-center text-sm font-medium text-slate-400">
            No custom trip requests yet.
          </p>
        ) : (
          <div className="space-y-3">
            {myTripRequests.map((r) => (
              <div
                key={r.id}
                className="rounded-2xl border border-slate-100 bg-white px-5 py-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-primary">
                      {r.destination}
                    </p>
                    <p className="text-xs font-medium text-slate-400">
                      From {r.fromCity} · {r.travelers} traveler
                      {r.travelers !== 1 ? "s" : ""} · #{r.id}
                    </p>
                  </div>
                  <StatusPill status={r.status} />
                </div>
                {r.status === "approved" && (
                  <p className="mt-2 text-sm font-bold text-emerald-700">
                    Quote: {money(r.quote)}
                    {r.adminNote ? ` — ${r.adminNote}` : ""}
                  </p>
                )}
                {r.status === "rejected" && r.adminNote && (
                  <p className="mt-2 text-sm font-medium text-red-600">
                    {r.adminNote}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {threads.some((t) => t.userEmail === user.email) && (
          <p className="mt-8 text-center text-sm font-medium text-slate-500">
            Need help?{" "}
            <Link to="/chat" className="font-bold text-accent">
              Open support chat
            </Link>
          </p>
        )}
      </main>
      <Footer />

      {open && (
        <div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-primary/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={() => setOpen(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-[2rem] bg-white p-7 shadow-2xl sm:rounded-[2rem]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-2xl font-bold text-primary">
              Booking Details
            </h3>
            <p className="mt-1 text-sm font-medium text-slate-400">
              #{open.id} · {open.itemName}
            </p>
            <div className="mt-4 flex items-center justify-between">
              <StatusPill status={open.status} />
              <p className="font-display text-2xl font-bold text-accent">
                {money(open.total)}
              </p>
            </div>
            {open.status === "pending" && (
              <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">
                An admin is reviewing your booking. Payment instructions for your
                selected method will appear here once approved.
              </p>
            )}
            {open.status === "approved" && open.paymentInstructions && (
              <div className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                <p className="font-bold">
                  Pay via {getPaymentMethod(open.paymentMethod).name}
                </p>
                <p className="mt-1 whitespace-pre-wrap">
                  {open.paymentInstructions}
                </p>
              </div>
            )}
            <h4 className="mt-6 mb-2 text-sm font-bold text-primary">
              Your Travel Details
            </h4>
            <dl className="space-y-1.5 text-sm">
              {[
                ["Name", open.traveler.fullName],
                ["Phone", open.traveler.phone],
                ["Passport", open.traveler.passport || "—"],
                ["Country", open.traveler.country],
                ["State", open.traveler.state],
                ["Reason", open.traveler.reason],
                [
                  "Emergency",
                  `${open.traveler.emergencyName} (${open.traveler.emergencyPhone})`,
                ],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <dt className="font-medium text-slate-400">{k}</dt>
                  <dd className="font-bold text-primary">{v}</dd>
                </div>
              ))}
            </dl>
            <button
              type="button"
              onClick={() => setOpen(null)}
              className="mt-6 w-full cursor-pointer rounded-full bg-primary py-3 text-sm font-bold text-white"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}