import { Link, Navigate, useNavigate } from "react-router-dom";
import { getPaymentMethod } from "../lib/data";
import { CheckCircle2, Clock3, LogOut, Plane, UserRound } from "lucide-react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { StatusPill } from "../components/ui";
import { useStore } from "../lib/store";
import { money } from "../lib/utils";

export function NewUserDashboard() {
  const { user, myBookings, signOut } = useStore();
  const navigate = useNavigate();
  if (!user) return <Navigate to="/login" replace />;
  const pending = myBookings.filter((booking) => booking.status === "pending").length;
  const approved = myBookings.filter((booking) => booking.status === "approved").length;
  return <div className="min-h-screen bg-slate-50"><Header /><main className="mx-auto max-w-6xl px-4 pb-20 pt-28 sm:px-6">
    <section className="overflow-hidden rounded-[2rem] bg-primary p-7 text-white shadow-xl sm:p-10"><div className="flex flex-wrap items-end justify-between gap-6"><div><p className="mb-3 text-xs font-bold uppercase tracking-[0.25em] text-accent">Traveler workspace</p><h1 className="font-display text-3xl font-bold sm:text-5xl">Your next chapter starts here.</h1><p className="mt-3 max-w-xl text-sm leading-6 text-white/70">Welcome back, {user.name}. Track every booking, approval, and payment instruction in one calm place.</p></div><div className="flex gap-2"><Link to="/profile" className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2.5 text-sm font-bold hover:bg-white/20"><UserRound className="h-4 w-4" /> Profile</Link><button type="button" onClick={() => { signOut(); navigate("/"); }} className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2.5 text-sm font-bold"><LogOut className="h-4 w-4" /> Sign out</button></div></div></section>
    <div className="mt-6 grid gap-4 sm:grid-cols-3"><Metric label="All bookings" value={myBookings.length} icon={Plane} /><Metric label="Awaiting review" value={pending} icon={Clock3} /><Metric label="Approved trips" value={approved} icon={CheckCircle2} /></div>
    <section className="mt-10"><div className="flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Your itinerary</p><h2 className="font-display mt-1 text-3xl font-bold text-primary">Bookings</h2></div><Link to="/bookings" className="text-sm font-bold text-accent">Find another trip</Link></div><div className="mt-5 space-y-3">{myBookings.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center"><Plane className="mx-auto h-8 w-8 text-accent" /><p className="mt-3 font-bold text-primary">Your itinerary is empty</p><Link to="/bookings" className="mt-4 inline-flex rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-white">Explore trips</Link></div> : myBookings.map((booking) => <div key={booking.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"><div><p className="font-bold text-primary">{booking.itemName}</p><p className="mt-1 text-xs text-slate-400">Booking #{booking.id} · {booking.passengers} traveler{booking.passengers === 1 ? "" : "s"}</p>{booking.status === "approved" && <div className="mt-2 space-y-1 text-sm text-emerald-700"><p className="font-bold">Payment: {getPaymentMethod(booking.paymentMethod).name} · {booking.paymentStatus}</p>{booking.paymentInstructions && <p>{booking.paymentInstructions}</p>}{booking.paymentReference && <p>Reference: {booking.paymentReference}</p>}<Link to="/chat" className="inline-flex rounded-full bg-emerald-100 px-3 py-1 font-bold">Open booking chat</Link></div>}</div><div className="flex items-center gap-4"><span className="font-display text-xl font-bold text-accent">{money(booking.total)}</span><StatusPill status={booking.status} /></div></div>)}</div></section>
  </main><Footer /></div>;
}
function Metric({ label, value, icon: Icon }: { label: string; value: number; icon: typeof Plane }) { return <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"><Icon className="h-5 w-5 text-accent" /><p className="font-display mt-3 text-3xl font-bold text-primary">{value}</p><p className="text-sm font-bold text-slate-500">{label}</p></div>; }
