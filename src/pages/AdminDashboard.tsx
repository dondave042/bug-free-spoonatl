import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle2,
  Clock,
  DollarSign,
  Home,
  Image as ImageIcon,
  LayoutDashboard,
  MapPin,
  MessageCircle,
  Plane,
  Plus,
  ShieldAlert,
  Trash2,
  RotateCcw,
} from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { MediaUploader } from "../components/MediaUploader";
import { ModalShell, StatusPill } from "../components/ui";
import { useStore } from "../lib/store";
import { getPaymentMethod, PAYMENT_METHODS } from "../lib/data";
import { FIELD, formatDateTime, money } from "../lib/utils";
import type { Booking, Destination, Flight, TripRequest } from "../lib/types";

const TABS = [
  {
    id: "overview",
    label: "Overview",
    short: "Home",
    desc: "Revenue, stats & recent activity",
    icon: LayoutDashboard,
  },
  {
    id: "bookings",
    label: "Bookings",
    short: "Books",
    desc: "Approve or reject bookings",
    icon: Plane,
  },
  {
    id: "requests",
    label: "Trip Requests",
    short: "Asks",
    desc: "Quote availability & cost",
    icon: MapPin,
  },
  {
    id: "flights",
    label: "Flights",
    short: "Flights",
    desc: "Add & edit flight deals",
    icon: Plane,
  },
  {
    id: "destinations",
    label: "Destinations",
    short: "Places",
    desc: "Manage vacation packages",
    icon: MapPin,
  },
  {
    id: "media",
    label: "Media Gallery",
    short: "Media",
    desc: "Upload photos & videos",
    icon: ImageIcon,
  },
  {
    id: "chats",
    label: "Messages",
    short: "Chats",
    desc: "Reply to traveler support chats",
    icon: MessageCircle,
  },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function AdminDashboard() {
  const { user, isAdmin, signOut, bookings, tripRequests, resetAll } =
    useStore();
  const [tab, setTab] = useState<TabId>("overview");

  if (!user || !isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="max-w-sm text-center">
          <ShieldAlert className="mx-auto mb-4 h-14 w-14 text-red-500" />
          <h1 className="font-display text-3xl font-bold text-primary">
            Access Denied
          </h1>
          <p className="mt-2 text-sm font-medium text-slate-500">
            You do not have admin privileges.
            {!user && " Sign in with an admin account first."}
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

  const pendingBookings = bookings.filter((b) => b.status === "pending").length;
  const pendingReqs = tripRequests.filter((r) => r.status === "pending").length;

  return (
    <div className="min-h-screen w-full max-w-[100vw] bg-slate-50 lg:grid lg:grid-cols-[18rem_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="flex items-center gap-3 px-5 py-6">
          <img
            src="/logo.png"
            alt="ATL Travels logo"
            className="h-11 w-11 rounded-xl object-cover shadow-md ring-1 ring-slate-100"
          />
          <div>
            <p className="font-display text-lg leading-tight font-bold text-primary">
              ATL TRAVELS
            </p>
            <p className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase">
              Admin Panel
            </p>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-4">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-bold transition ${
                tab === t.id
                  ? "bg-primary text-white"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
              {t.id === "bookings" && pendingBookings > 0 && (
                <span className="ml-auto rounded-full bg-accent px-1.5 text-[10px] text-white">
                  {pendingBookings}
                </span>
              )}
              {t.id === "requests" && pendingReqs > 0 && (
                <span className="ml-auto rounded-full bg-accent px-1.5 text-[10px] text-white">
                  {pendingReqs}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="space-y-2 border-t border-slate-100 p-4">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-slate-500 hover:bg-slate-50"
          >
            <Home className="h-4 w-4" /> View site
          </Link>
          <button
            type="button"
            onClick={resetAll}
            className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-amber-700 hover:bg-amber-50"
          >
            <RotateCcw className="h-4 w-4" /> Reset demo data
          </button>
          <button
            type="button"
            onClick={signOut}
            className="flex w-full cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50"
          >
            Sign out
          </button>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
          <p className="font-display font-bold text-primary">Admin</p>
          <select
            value={tab}
            onChange={(e) => setTab(e.target.value as TabId)}
            className="rounded-full border border-slate-200 px-3 py-1.5 text-sm font-bold"
          >
            {TABS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.short}
              </option>
            ))}
          </select>
        </header>
        <div className="px-4 py-8 sm:px-8">
          {tab === "overview" && (
            <Overview
              onReview={() => setTab("bookings")}
            />
          )}
          {tab === "bookings" && <BookingsPanel />}
          {tab === "requests" && <RequestsPanel />}
          {tab === "flights" && <FlightsPanel />}
          {tab === "destinations" && <DestinationsPanel />}
          {tab === "media" && <MediaPanel />}
          {tab === "chats" && <ChatsPanel />}
        </div>
      </div>
    </div>
  );
}

function Overview({ onReview }: { onReview: () => void }) {
  const { bookings } = useStore();
  const pending = bookings.filter((b) => b.status === "pending");
  const approved = bookings.filter((b) => b.status === "approved");
  const revenue = approved.reduce((s, b) => s + b.total, 0);
  const cards = [
    {
      label: "Revenue",
      value: money(revenue),
      sub: "Approved bookings",
      icon: DollarSign,
      tint: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "All bookings",
      value: bookings.length,
      sub: "Lifetime",
      icon: Plane,
      tint: "bg-blue-50 text-blue-600",
    },
    {
      label: "Pending",
      value: pending.length,
      sub: "Awaiting review",
      icon: Clock,
      tint: "bg-amber-50 text-amber-600",
    },
    {
      label: "Approved",
      value: approved.length,
      sub: "Confirmed trips",
      icon: CheckCircle2,
      tint: "bg-orange-50 text-orange-600",
    },
  ];

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-primary">
        Dashboard Overview
      </h1>
      <p className="mt-1 text-sm font-medium text-slate-500">
        Revenue, bookings and traveler activity at a glance.
      </p>
      {pending.length > 0 && (
        <button
          type="button"
          onClick={onReview}
          className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-700 transition hover:bg-amber-100"
        >
          <Clock className="h-3.5 w-3.5" />
          {pending.length} booking{pending.length !== 1 ? "s" : ""} waiting for
          approval — tap to review
        </button>
      )}
      <div className="mt-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
          >
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-xl ${c.tint}`}
            >
              <c.icon className="h-5 w-5" />
            </span>
            <p className="font-display mt-3 text-2xl font-bold text-primary">
              {c.value}
            </p>
            <p className="text-xs font-bold text-slate-500">{c.label}</p>
            <p className="mt-0.5 text-[11px] font-medium text-slate-400">
              {c.sub}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h3 className="mb-5 text-sm font-bold tracking-wider text-slate-500 uppercase">
            Revenue Overview
          </h3>
          {approved.length === 0 ? (
            <p className="py-10 text-center text-sm font-medium text-slate-400">
              Revenue appears here once bookings are approved.
            </p>
          ) : (
            <ul className="space-y-3">
              {approved.slice(0, 6).map((b) => (
                <li
                  key={b.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="font-bold text-primary">{b.itemName}</span>
                  <span className="font-bold text-accent">{money(b.total)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h3 className="mb-5 text-sm font-bold tracking-wider text-slate-500 uppercase">
            Recent Bookings
          </h3>
          {bookings.length === 0 ? (
            <p className="py-10 text-center text-sm font-medium text-slate-400">
              No bookings yet — they will show up here as travelers book.
            </p>
          ) : (
            <ul className="space-y-3">
              {bookings.slice(0, 6).map((b) => (
                <li key={b.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-primary">{b.bookedBy}</p>
                    <p className="text-xs text-slate-400">{b.itemName}</p>
                  </div>
                  <StatusPill status={b.status} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function BookingsPanel() {
  const { bookings, approveBooking, rejectBooking } = useStore();
  const [filter, setFilter] = useState<"all" | Booking["status"]>("all");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<Booking | null>(null);
  const [note, setNote] = useState("");

  const list = useMemo(
    () =>
      bookings.filter((b) => {
        if (filter !== "all" && b.status !== filter) return false;
        const s = q.toLowerCase();
        if (!s) return true;
        return (
          b.id.toLowerCase().includes(s) ||
          b.bookedBy.toLowerCase().includes(s) ||
          b.itemName.toLowerCase().includes(s) ||
          b.userEmail.toLowerCase().includes(s)
        );
      }),
    [bookings, filter, q],
  );

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-primary">Bookings</h1>
      <p className="mt-1 text-sm font-medium text-slate-500">
        {bookings.length} bookings — each row shows the traveler&apos;s chosen
        payment method.
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        {(["all", "pending", "approved", "rejected"] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setFilter(s)}
            className={`cursor-pointer rounded-full px-4 py-1.5 text-xs font-bold capitalize ${
              filter === s
                ? "bg-primary text-white"
                : "border border-slate-200 bg-white text-slate-600"
            }`}
          >
            {s}
          </button>
        ))}
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search id, name, email…"
          className="ml-auto rounded-full border border-slate-200 px-4 py-1.5 text-xs font-bold"
        />
      </div>
      <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-100 bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-slate-100 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            <tr>
              <th className="px-4 py-3">Booking</th>
              <th className="px-4 py-3">Traveler</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Pay</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-400">
                  No bookings found
                </td>
              </tr>
            )}
            {list.map((b) => (
              <tr
                key={b.id}
                onClick={() => {
                  setOpen(b);
                  setNote(
                    getPaymentMethod(b.paymentMethod).template(b.id),
                  );
                }}
                className="cursor-pointer border-b border-slate-50 hover:bg-slate-50"
              >
                <td className="px-4 py-3">
                  <p className="font-bold text-primary">{b.itemName}</p>
                  <p className="text-xs text-slate-400">#{b.id}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="font-bold">{b.bookedBy}</p>
                  <p className="text-xs text-slate-400">{b.userEmail}</p>
                </td>
                <td className="px-4 py-3 font-bold text-accent">
                  {money(b.total)}
                </td>
                <td className="px-4 py-3 text-xs font-bold">
                  {getPaymentMethod(b.paymentMethod).name}
                </td>
                <td className="px-4 py-3">
                  <StatusPill status={b.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {open && (
          <ModalShell
            title={`Booking #${open.id}`}
            onClose={() => setOpen(null)}
            wide
          >
            <p className="text-sm font-medium text-slate-500">
              Booking Date: {formatDateTime(open.createdAt)}
            </p>
            <p className="mt-1 text-sm font-bold text-primary">{open.itemName}</p>
            <p className="text-xs font-medium text-slate-400">
              Traveler wants to pay with{" "}
              {getPaymentMethod(open.paymentMethod).name}
            </p>
            <dl className="mt-4 grid gap-2 sm:grid-cols-2">
              {[
                ["Traveler", open.traveler.fullName],
                ["DOB", open.traveler.dob],
                ["Phone", open.traveler.phone],
                ["Passport", open.traveler.passport || "—"],
                ["Country", open.traveler.country],
                ["State", open.traveler.state],
                ["Reason", open.traveler.reason],
                ["Address", open.traveler.address],
                [
                  "Emergency",
                  `${open.traveler.emergencyName} (${open.traveler.emergencyPhone})`,
                ],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                    {k}
                  </dt>
                  <dd className="text-sm font-bold text-primary">{v}</dd>
                </div>
              ))}
            </dl>
            {open.status === "pending" && (
              <div className="mt-5 space-y-3">
                <p className="text-xs font-medium text-slate-500">
                  Tip: use the highlighted template — it matches this
                  traveler&apos;s payment method, so the correct handle/account
                  always goes out.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {PAYMENT_METHODS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setNote(m.template(open.id))}
                      className={`cursor-pointer rounded-full px-3 py-1 text-[11px] font-bold ${
                        open.paymentMethod === m.id
                          ? "bg-accent text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {m.name}
                    </button>
                  ))}
                </div>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={4}
                  className={FIELD}
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      approveBooking(open.id, note);
                      setOpen(null);
                    }}
                    className="cursor-pointer rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white"
                  >
                    Approve & send
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      rejectBooking(open.id, note);
                      setOpen(null);
                    }}
                    className="cursor-pointer rounded-full bg-red-600 px-5 py-2.5 text-sm font-bold text-white"
                  >
                    Reject
                  </button>
                </div>
              </div>
            )}
            {open.status !== "pending" && open.paymentInstructions && (
              <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm whitespace-pre-wrap">
                {open.paymentInstructions}
              </p>
            )}
          </ModalShell>
        )}
      </AnimatePresence>
    </div>
  );
}

function RequestsPanel() {
  const { tripRequests, quoteTripRequest, declineTripRequest } = useStore();
  const [open, setOpen] = useState<TripRequest | null>(null);
  const [quote, setQuote] = useState("");
  const [note, setNote] = useState("");

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-primary">
        Trip Requests
      </h1>
      <p className="mt-1 text-sm font-medium text-slate-500">
        Travelers asking for a custom destination. Check availability, set the
        cost quote, and approve — or decline if it&apos;s not doable.
      </p>
      <div className="mt-6 space-y-3">
        {tripRequests.length === 0 && (
          <p className="rounded-2xl bg-white py-12 text-center text-sm font-medium text-slate-400">
            No custom requests yet.
          </p>
        )}
        {tripRequests.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => {
              setOpen(r);
              setQuote(r.quote ? String(r.quote) : "");
              setNote(r.adminNote);
            }}
            className="flex w-full cursor-pointer items-start justify-between gap-4 rounded-2xl border border-slate-100 bg-white px-5 py-4 text-left shadow-sm"
          >
            <div>
              <p className="text-sm font-bold text-primary">{r.destination}</p>
              <p className="text-xs font-medium text-slate-400">
                From {r.fromCity} · {r.travelers} traveler
                {r.travelers !== 1 ? "s" : ""} · {r.userName} · #{r.id}
              </p>
            </div>
            <StatusPill status={r.status} />
          </button>
        ))}
      </div>
      <AnimatePresence>
        {open && (
          <ModalShell title={`Request #${open.id}`} onClose={() => setOpen(null)}>
            <p className="text-sm font-bold text-primary">{open.destination}</p>
            <p className="text-xs text-slate-400">
              {open.fromCity} · {open.travelers} traveler
              {open.travelers !== 1 ? "s" : ""}
            </p>
            {open.notes && (
              <p className="mt-3 text-sm">
                <span className="font-bold">Traveler notes: </span>
                {open.notes}
              </p>
            )}
            {open.status === "pending" && (
              <div className="mt-4 space-y-3">
                <label className="block">
                  <span className="mb-1 block text-sm font-bold">Quote ($)</span>
                  <input
                    type="number"
                    value={quote}
                    onChange={(e) => setQuote(e.target.value)}
                    className={FIELD}
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-bold">
                    Note to traveler (what&apos;s included, availability window…)
                  </span>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className={FIELD}
                    rows={3}
                  />
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      quoteTripRequest(open.id, Number(quote) || 0, note);
                      setOpen(null);
                    }}
                    className="cursor-pointer rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white"
                  >
                    Send quote
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      declineTripRequest(open.id, note);
                      setOpen(null);
                    }}
                    className="cursor-pointer rounded-full bg-red-600 px-5 py-2.5 text-sm font-bold text-white"
                  >
                    Decline
                  </button>
                </div>
              </div>
            )}
            {open.status !== "pending" && (
              <p className="mt-4 text-sm font-medium text-slate-500">
                Decision sent to traveler
                {open.quote ? ` · ${money(open.quote)}` : ""}
              </p>
            )}
          </ModalShell>
        )}
      </AnimatePresence>
    </div>
  );
}

function DestinationsPanel() {
  const { destinations, saveDestination, deleteDestination } = useStore();
  const [edit, setEdit] = useState<Destination | null>(null);

  const blank = (): Destination => ({
    id: Date.now(),
    name: "",
    location: "",
    description: "",
    price: 0,
    rating: "5.0",
    reviews: "",
    image: "/dest/dest-2.jpeg",
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-primary">
            Destinations
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Create and edit the vacation packages travelers can book. Tap a
            package to edit its price, details, or photo.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEdit(blank())}
          className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-bold text-white"
        >
          <Plus className="h-4 w-4" /> Add Destination
        </button>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {destinations.map((d) => (
          <article
            key={d.id}
            className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm"
          >
            <img src={d.image} alt="" className="h-36 w-full object-cover" />
            <div className="p-4">
              <p className="text-sm font-bold text-primary">{d.name}</p>
              <p className="text-xs text-slate-400">{d.location}</p>
              <p className="mt-1 font-display text-lg font-bold text-accent">
                {money(d.price)}
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEdit(d)}
                  className="cursor-pointer rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-white"
                >
                  Edit destination
                </button>
                <button
                  type="button"
                  onClick={() => deleteDestination(d.id)}
                  className="cursor-pointer rounded-full bg-red-50 px-3 py-1.5 text-xs font-bold text-red-600"
                >
                  Delete destination
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
      <AnimatePresence>
        {edit && (
          <ModalShell title="Edit Destination" onClose={() => setEdit(null)}>
            <DestForm
              value={edit}
              onChange={setEdit}
              onSave={() => {
                saveDestination(edit);
                setEdit(null);
              }}
            />
          </ModalShell>
        )}
      </AnimatePresence>
    </div>
  );
}

function DestForm({
  value,
  onChange,
  onSave,
}: {
  value: Destination;
  onChange: (d: Destination) => void;
  onSave: () => void;
}) {
  const p = (x: Partial<Destination>) => onChange({ ...value, ...x });
  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSave();
      }}
    >
      <input
        className={FIELD}
        placeholder="Name"
        value={value.name}
        onChange={(e) => p({ name: e.target.value })}
        required
      />
      <input
        className={FIELD}
        placeholder="Location"
        value={value.location}
        onChange={(e) => p({ location: e.target.value })}
        required
      />
      <textarea
        className={FIELD}
        placeholder="Description"
        value={value.description}
        onChange={(e) => p({ description: e.target.value })}
        rows={3}
      />
      <input
        type="number"
        className={FIELD}
        placeholder="Price"
        value={value.price}
        onChange={(e) => p({ price: Number(e.target.value) })}
      />
      <input
        className={FIELD}
        placeholder="Image URL"
        value={value.image}
        onChange={(e) => p({ image: e.target.value })}
      />
      <button
        type="submit"
        className="w-full cursor-pointer rounded-full bg-accent py-3 text-sm font-bold text-white"
      >
        Save
      </button>
    </form>
  );
}

function FlightsPanel() {
  const { flights, saveFlight, deleteFlight } = useStore();
  const [edit, setEdit] = useState<Flight | null>(null);
  const blank = (): Flight => ({
    id: Date.now(),
    airline: "",
    departure_city: "ATL",
    arrival_city: "",
    departure_date: "",
    arrival_date: "",
    price: 0,
    available_seats: 20,
    duration: "",
    stops: "Non-stop",
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-primary">
            Flights
          </h1>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Find deals from ATL
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEdit(blank())}
          className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-bold text-white"
        >
          <Plus className="h-4 w-4" /> Add flight
        </button>
      </div>
      <div className="mt-6 space-y-2">
        {flights.map((f) => (
          <div
            key={f.id}
            className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-4 py-3"
          >
            <div>
              <p className="text-sm font-bold text-primary">
                {f.airline} · {f.departure_city} → {f.arrival_city}
              </p>
              <p className="text-xs text-slate-400">
                {money(f.price)} · {f.available_seats} seats
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setEdit(f)}
                className="cursor-pointer text-xs font-bold text-accent"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => deleteFlight(f.id)}
                className="cursor-pointer text-xs font-bold text-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
      <AnimatePresence>
        {edit && (
          <ModalShell title="Edit flight" onClose={() => setEdit(null)}>
            <FlightForm
              value={edit}
              onChange={setEdit}
              onSave={() => {
                saveFlight(edit);
                setEdit(null);
              }}
            />
          </ModalShell>
        )}
      </AnimatePresence>
    </div>
  );
}

function FlightForm({
  value,
  onChange,
  onSave,
}: {
  value: Flight;
  onChange: (f: Flight) => void;
  onSave: () => void;
}) {
  const p = (x: Partial<Flight>) => onChange({ ...value, ...x });
  return (
    <form
      className="grid gap-3 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        onSave();
      }}
    >
      {(
        [
          ["airline", "Airline"],
          ["departure_city", "From"],
          ["arrival_city", "To"],
          ["duration", "Duration"],
          ["stops", "Stops"],
        ] as const
      ).map(([k, label]) => (
        <label key={k} className="block">
          <span className="mb-1 block text-xs font-bold">{label}</span>
          <input
            className={FIELD}
            value={value[k]}
            onChange={(e) => p({ [k]: e.target.value })}
            required
          />
        </label>
      ))}
      <label className="block">
        <span className="mb-1 block text-xs font-bold">Price</span>
        <input
          type="number"
          className={FIELD}
          value={value.price}
          onChange={(e) => p({ price: Number(e.target.value) })}
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-bold">Seats</span>
        <input
          type="number"
          className={FIELD}
          value={value.available_seats}
          onChange={(e) => p({ available_seats: Number(e.target.value) })}
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-bold">Depart</span>
        <input
          type="datetime-local"
          className={FIELD}
          value={value.departure_date.slice(0, 16)}
          onChange={(e) => p({ departure_date: e.target.value })}
        />
      </label>
      <label className="block">
        <span className="mb-1 block text-xs font-bold">Arrive</span>
        <input
          type="datetime-local"
          className={FIELD}
          value={value.arrival_date.slice(0, 16)}
          onChange={(e) => p({ arrival_date: e.target.value })}
        />
      </label>
      <button
        type="submit"
        className="sm:col-span-2 cursor-pointer rounded-full bg-accent py-3 text-sm font-bold text-white"
      >
        Save
      </button>
    </form>
  );
}

function MediaPanel() {
  const { media, addMedia, deleteMedia } = useStore();
  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-primary">
        Media Gallery
      </h1>
      <p className="mt-1 mb-6 text-sm font-medium text-slate-500">
        Upload travel photos and videos (multiple files at once) — they appear
        instantly in the public gallery on the site.
      </p>
      <MediaUploader onAdd={addMedia} />
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {media.map((m) => (
          <div
            key={m.id}
            className="group relative overflow-hidden rounded-2xl bg-slate-100"
          >
            {m.type === "video" ? (
              <video src={m.url} className="aspect-square w-full object-cover" />
            ) : (
              <img
                src={m.url}
                alt={m.title}
                className="aspect-square w-full object-cover"
              />
            )}
            <button
              type="button"
              onClick={() => deleteMedia(m.id)}
              className="absolute top-2 right-2 hidden h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-red-600 text-white group-hover:flex"
              aria-label="Delete"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChatsPanel() {
  const { threads, chatMedia, sendMessage } = useStore();
  const [active, setActive] = useState<string | null>(threads[0]?.id ?? null);
  const [text, setText] = useState("");
  const t = threads.find((x) => x.id === active) ?? null;

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-primary">Messages</h1>
      <p className="mt-1 text-sm font-medium text-slate-500">
        Support threads created when bookings are approved.
      </p>
      {threads.length === 0 ? (
        <p className="mt-10 rounded-2xl bg-white py-16 text-center text-sm font-medium text-slate-400">
          No conversations yet — approve a booking to open one.
        </p>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-[260px_1fr]">
          <aside className="space-y-2">
            {threads.map((th) => (
              <button
                key={th.id}
                type="button"
                onClick={() => setActive(th.id)}
                className={`w-full cursor-pointer rounded-2xl border px-4 py-3 text-left ${
                  t?.id === th.id
                    ? "border-accent bg-orange-50"
                    : "border-slate-100 bg-white"
                }`}
              >
                <p className="text-sm font-bold">{th.userName}</p>
                <p className="text-xs text-slate-400">#{th.bookingId}</p>
              </button>
            ))}
          </aside>
          {t && (
            <section className="flex min-h-[50vh] flex-col rounded-2xl border border-slate-100 bg-white">
              <div className="flex-1 space-y-2 overflow-y-auto p-4">
                {t.messages.map((m) => (
                  <div
                    key={m.id}
                    className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                      m.from === "admin"
                        ? "ml-auto bg-primary text-white"
                        : "bg-slate-100"
                    }`}
                  >
                    {m.imageId && chatMedia[m.imageId] && (
                      <img
                        src={chatMedia[m.imageId]}
                        alt=""
                        className="mb-1 max-h-40 rounded-lg"
                      />
                    )}
                    <p className="whitespace-pre-wrap">{m.text}</p>
                  </div>
                ))}
              </div>
              <form
                className="flex gap-2 border-t p-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!text.trim()) return;
                  sendMessage(t.id, "admin", text.trim());
                  setText("");
                }}
              >
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Reply to traveler…"
                  className="flex-1 rounded-full border border-slate-200 px-4 py-2 text-sm outline-none"
                />
                <button
                  type="submit"
                  className="cursor-pointer rounded-full bg-accent px-4 py-2 text-sm font-bold text-white"
                >
                  Send
                </button>
              </form>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

