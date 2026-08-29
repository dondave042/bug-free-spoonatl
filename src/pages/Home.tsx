import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Compass,
  Mail,
  MapPin,
  Minus,
  Phone,
  Plane,
  Plus,
  Star,
} from "lucide-react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { BookingModal } from "../components/BookingModal";
import { SectionTitle } from "../components/ui";
import { SOCIALS } from "../components/socials";
import { useStore } from "../lib/store";
import {
  CONTACT_EMAIL,
  CONTACT_OFFICE,
  CONTACT_PHONE,
  EXCURSIONS,
  TESTIMONIALS,
} from "../lib/data";
import type { BookableItem, Flight, ItemType } from "../lib/types";
import { formatDate, formatTime, money } from "../lib/utils";

export function Home() {
  const { destinations, flights, user, notify } = useStore();
  const nav = useNavigate();
  const [item, setItem] = useState<BookableItem | null>(null);
  const [itemType, setItemType] = useState<ItemType>("destination");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [sent, setSent] = useState(false);

  const book = (it: BookableItem, type: ItemType) => {
    if (!user) {
      notify("Please login to book", "error");
      nav("/login");
      return;
    }
    setItemType(type);
    setItem(it);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />

      <section className="relative z-20 mx-auto -mt-10 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: Compass,
              title: "Top Destinations",
              sub: "Explore our favorites",
              to: "/destinations",
            },
            {
              icon: Plane,
              title: "View All Flights",
              sub: "Browse flight deals",
              to: "/bookings",
            },
            {
              icon: Phone,
              title: "Talk to an Expert",
              sub: CONTACT_PHONE,
              to: `tel:${CONTACT_PHONE.replace(/[^+0-9]/g, "")}`,
            },
          ].map((c) => (
            <Link
              key={c.title}
              to={c.to}
              className="card-hover group flex items-center justify-between rounded-3xl border border-slate-100 bg-white p-5 shadow-lg shadow-slate-200/50"
            >
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                  <c.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-bold text-primary">{c.title}</p>
                  <p className="text-xs font-medium text-slate-400">{c.sub}</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-1 group-hover:text-accent" />
            </Link>
          ))}
        </div>
      </section>

      <section
        id="destinations"
        className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"
      >
        <SectionTitle
          title="Top Rated Destinations"
          sub="Curated excursions with instant confirmation"
        />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {EXCURSIONS.map((ex) => (
            <article
              key={ex.title}
              className="card-hover group overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-lg shadow-slate-200/40"
            >
              <div className="relative h-52 overflow-hidden">
                <img
                  src={ex.image}
                  alt={ex.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <span className="absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-primary backdrop-blur">
                  {ex.location}
                </span>
              </div>
              <div className="p-5">
                <h3 className="font-display text-xl font-bold text-primary">
                  {ex.title}
                </h3>
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-sm font-bold text-accent">
                    From {money(ex.price)}
                  </p>
                  <span className="flex items-center gap-1 text-xs font-bold text-slate-500">
                    <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                    {ex.rating} ({ex.reviews})
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-4xl font-bold text-primary sm:text-5xl">
              Luxury Packages
            </h2>
            <p className="mt-2 text-base font-bold text-primary/70">
              Complete getaways with stays, cruises and resorts
            </p>
          </div>
          <Link
            to="/destinations"
            className="flex items-center gap-1.5 text-sm font-bold text-accent transition hover:opacity-70"
          >
            View all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {destinations.slice(0, 6).map((d) => (
            <article
              key={d.id}
              className="card-hover overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-lg shadow-slate-200/40"
            >
              <div className="relative h-52 overflow-hidden">
                <img
                  src={d.image}
                  alt={d.name}
                  className="h-full w-full object-cover"
                />
                <span className="absolute top-4 right-4 rounded-full bg-primary/85 px-3 py-1 text-xs font-bold text-white backdrop-blur">
                  {money(d.price)}
                </span>
              </div>
              <div className="p-5">
                <p className="text-[11px] font-bold tracking-wider text-accent uppercase">
                  {d.location}
                </p>
                <h3 className="font-display mt-1 text-xl font-bold text-primary">
                  {d.name}
                </h3>
                <p className="mt-2 line-clamp-2 text-sm font-medium text-slate-500">
                  {d.description}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="flex items-center gap-1 text-xs font-bold text-slate-500">
                    <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                    {d.rating}
                    {d.reviews && (
                      <span className="font-medium text-slate-400">
                        ({d.reviews})
                      </span>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      book({ id: d.id, name: d.name, price: d.price }, "destination")
                    }
                    className="cursor-pointer rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-white transition hover:bg-accent"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section
        id="flights"
        className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8"
      >
        <SectionTitle
          title="Flight Deals"
          sub="Best flight deals for your next adventure"
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {flights.slice(0, 4).map((f) => (
            <FlightCard
              key={f.id}
              f={f}
              onBook={() =>
                book(
                  {
                    id: f.id,
                    name: `${f.airline} — ${f.departure_city} to ${f.arrival_city}`,
                    price: f.price,
                  },
                  "flight",
                )
              }
            />
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link
            to="/bookings"
            className="inline-flex items-center gap-2 rounded-full border-2 border-slate-800 px-8 py-3 font-bold text-slate-800 transition-colors hover:bg-slate-800 hover:text-white"
          >
            View all {flights.length} flight deals
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <CustomTrip />

      <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="grid gap-5 md:grid-cols-2">
          <a
            href="https://www.viator.com"
            target="_blank"
            rel="noreferrer"
            className="group flex items-center justify-between rounded-[2rem] bg-primary p-8 text-white transition hover:no-underline"
          >
            <div>
              <p className="text-[11px] font-bold tracking-[0.2em] text-accent uppercase">
                Viator Partner
              </p>
              <h3 className="font-display mt-2 text-2xl font-bold">
                Over 400,000 experiences worldwide
              </h3>
              <p className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-accent">
                Explore Viator{" "}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </p>
            </div>
            <Plane className="h-12 w-12 text-white/20" />
          </a>
          <a
            href="https://www.airbnb.com"
            target="_blank"
            rel="noreferrer"
            className="group flex items-center justify-between rounded-[2rem] bg-[#ff5a5f] p-8 text-white transition hover:no-underline"
          >
            <div>
              <p className="text-[11px] font-bold tracking-[0.2em] text-white/80 uppercase">
                Airbnb Partner
              </p>
              <h3 className="font-display mt-2 text-2xl font-bold">
                Unique stays around the globe
              </h3>
              <p className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-white">
                Browse Homes{" "}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </p>
            </div>
            <Compass className="h-12 w-12 text-white/30" />
          </a>
        </div>
      </section>

      <section
        id="testimonials"
        className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8"
      >
        <SectionTitle
          title="What Our Travelers Say"
          sub="Real experiences from real travelers"
        />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {TESTIMONIALS.map((t) => (
            <blockquote
              key={t.id}
              className="flex flex-col rounded-3xl border border-slate-100 bg-white p-6 shadow-lg shadow-slate-200/40"
            >
              <div className="mb-3 flex gap-0.5">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <p className="flex-1 text-sm leading-relaxed font-medium text-slate-600">
                “{t.text}”
              </p>
              <div className="mt-5 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                  {t.initials}
                </span>
                <div>
                  <p className="text-sm font-bold text-primary">{t.name}</p>
                  <p className="text-xs font-medium text-slate-400">
                    {t.location}
                  </p>
                </div>
              </div>
            </blockquote>
          ))}
        </div>
      </section>

      <section
        id="contact"
        className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8"
      >
        <SectionTitle
          center
          title="Get In Touch"
          sub="We'd love to hear from you and help plan your dream vacation"
        />
        <div className="grid gap-8 md:grid-cols-3">
          <div className="space-y-8 md:col-span-1">
            {[
              {
                label: "Email",
                value: CONTACT_EMAIL,
                href: `mailto:${CONTACT_EMAIL}`,
              },
              { label: "Office", value: CONTACT_OFFICE, href: undefined },
            ].map((c) => (
              <div key={c.label} className="flex gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                  {c.label === "Email" ? (
                    <Mail className="h-5 w-5" />
                  ) : c.label === "Phone" ? (
                    <Phone className="h-5 w-5" />
                  ) : (
                    <MapPin className="h-5 w-5" />
                  )}
                </span>
                <div>
                  <h4 className="mb-1 font-bold text-primary">{c.label}</h4>
                  {c.href ? (
                    <a
                      href={c.href}
                      className="font-semibold break-all text-primary transition hover:text-accent"
                    >
                      {c.value}
                    </a>
                  ) : (
                    <p className="font-semibold text-primary">{c.value}</p>
                  )}
                </div>
              </div>
            ))}
            <div>
              <h4 className="mb-3 font-bold text-primary">Follow us</h4>
              <div className="flex gap-3">
                {SOCIALS.map(({ id, href, label, Icon }) => (
                  <a
                    key={id}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    title={label}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white shadow-md transition hover:scale-105 hover:bg-accent"
                  >
                    <Icon className="h-4.5 w-4.5" />
                  </a>
                ))}
              </div>
            </div>
          </div>
          <form
            className="rounded-[2rem] border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/50 md:col-span-2"
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
              setForm({ name: "", email: "", phone: "", message: "" });
              notify("Message sent successfully!");
              window.setTimeout(() => setSent(false), 4000);
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-primary">
                  Name
                </span>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-accent"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-primary">
                  Email
                </span>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-accent"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-2 block text-sm font-bold text-primary">
                  Phone
                </span>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-accent"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-2 block text-sm font-bold text-primary">
                  Message
                </span>
                <textarea
                  required
                  rows={4}
                  value={form.message}
                  onChange={(e) =>
                    setForm({ ...form, message: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-accent"
                />
              </label>
            </div>
            {sent && (
              <p className="mt-4 text-sm font-bold text-emerald-600">
                Message sent successfully!
              </p>
            )}
            <button
              type="submit"
              className="mt-5 w-full cursor-pointer rounded-full bg-accent py-3 font-bold tracking-wide text-white shadow-lg shadow-orange-500/20 transition-colors hover:bg-accent-hover"
            >
              Send Message
            </button>
          </form>
        </div>
      </section>

      <Footer />
      <BookingModal
        open={!!item}
        onClose={() => setItem(null)}
        item={item}
        itemType={itemType}
      />
    </div>
  );
}

function Hero() {
  const nav = useNavigate();
  const [guests, setGuests] = useState(2);
  const [q, setQ] = useState({ destination: "", checkin: "", checkout: "" });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const p = new URLSearchParams({
      search: q.destination,
      guests: String(guests),
    });
    if (q.checkin) p.set("checkin", q.checkin);
    if (q.checkout) p.set("checkout", q.checkout);
    nav(`/bookings?${p.toString()}`);
  };

  return (
    <section className="relative flex min-h-[92vh] items-center overflow-hidden pt-24 pb-16">
      <div className="hero-bg absolute inset-0 scale-105 transform" aria-hidden />
      <div className="absolute inset-0 bg-primary/55" aria-hidden />
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-5xl leading-[1.08] font-bold text-white sm:text-6xl lg:text-7xl"
          >
            Your Next <span className="text-accent italic">Dream Vacation</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="mx-auto mt-5 max-w-xl text-base leading-relaxed font-medium text-white/85 sm:text-lg"
          >
            Handpicked villas, boutique hotels, and once-in-a-lifetime experiences
            curated by travel professionals.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
            className="mt-7"
          >
            <a
              href="#destinations"
              className="inline-flex items-center gap-2 rounded-full bg-accent px-8 py-3.5 text-sm font-bold text-white shadow-xl shadow-orange-500/30 transition-colors hover:bg-accent-hover"
            >
              Start Planning Today
              <ArrowRight className="h-4 w-4" />
            </a>
          </motion.div>
          <motion.form
            onSubmit={submit}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32 }}
            className="hero-card glass mt-10 rounded-[2rem] p-6 text-left shadow-2xl"
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <label className="relative block">
                <span className="mb-1.5 block text-[11px] font-bold tracking-wider text-primary uppercase">
                  Where to?
                </span>
                <MapPin className="absolute bottom-3.5 left-4 h-5 w-5 text-slate-400" />
                <input
                  value={q.destination}
                  onChange={(e) =>
                    setQ({ ...q, destination: e.target.value })
                  }
                  placeholder="Cancun, Hawaii, Jamaica…"
                  className="w-full rounded-2xl border border-slate-200 py-3 pr-3 pl-11 text-sm font-bold outline-none focus:border-accent"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-bold tracking-wider text-primary uppercase">
                  Check-in
                </span>
                <input
                  type="date"
                  value={q.checkin}
                  onChange={(e) => setQ({ ...q, checkin: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-accent"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-bold tracking-wider text-primary uppercase">
                  Check-out
                </span>
                <input
                  type="date"
                  value={q.checkout}
                  onChange={(e) => setQ({ ...q, checkout: e.target.value })}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold outline-none focus:border-accent"
                />
              </label>
              <div>
                <span className="mb-1.5 block text-[11px] font-bold tracking-wider text-primary uppercase">
                  Guests
                </span>
                <div className="flex items-center justify-between rounded-2xl border border-slate-200 px-3 py-2">
                  <button
                    type="button"
                    aria-label="Fewer travelers"
                    onClick={() => setGuests((n) => Math.max(1, n - 1))}
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full hover:bg-slate-100"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="text-sm font-bold">{guests}</span>
                  <button
                    type="button"
                    aria-label="More travelers"
                    onClick={() => setGuests((n) => Math.min(12, n + 1))}
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full hover:bg-slate-100"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
            <button
              type="submit"
              className="mt-4 w-full cursor-pointer rounded-full bg-primary py-3.5 text-sm font-bold text-white transition hover:bg-slate-800"
            >
              Search trips
            </button>
          </motion.form>
        </div>
      </div>
    </section>
  );
}

function CustomTrip() {
  const { user, createTripRequest, notify } = useStore();
  const nav = useNavigate();
  const [form, setForm] = useState({
    destination: "",
    fromCity: "",
    travelers: 2,
    checkIn: "",
    checkOut: "",
    budget: "",
    notes: "",
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [done, setDone] = useState<string | null>(null);

  const inputCls =
    "w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-bold text-white placeholder:font-medium placeholder:text-white/40 outline-none transition focus:border-accent focus:bg-white/15";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      notify("Please login to send a trip request", "error");
      nav("/login");
      return;
    }
    const eList: string[] = [];
    if (!form.destination.trim()) eList.push("Tell us where you want to go");
    if (!form.fromCity.trim())
      eList.push("Your location / departure city is required");
    if (form.checkIn && form.checkOut && form.checkOut < form.checkIn)
      eList.push("Return date must be after the travel date");
    setErrors(eList);
    if (eList.length > 0) return;
    const req = createTripRequest({
      ...form,
      destination: form.destination.trim(),
      fromCity: form.fromCity.trim(),
    });
    if (req) {
      setDone(req.id);
      setForm({
        destination: "",
        fromCity: "",
        travelers: 2,
        checkIn: "",
        checkOut: "",
        budget: "",
        notes: "",
      });
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-[2rem] bg-primary shadow-2xl">
        <div className="grid items-center gap-8 p-8 sm:p-10 lg:grid-cols-2 lg:p-12">
          <div>
            <p className="text-[11px] font-bold tracking-[0.2em] text-accent uppercase">
              Custom trip request
            </p>
            <h2 className="font-display mt-3 text-3xl font-bold text-white sm:text-4xl">
              Can&apos;t find your{" "}
              <span className="text-accent italic">dream trip?</span>
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed font-medium text-white/70">
              Tell us the destination you want to travel to and your location. Our
              team will check availability, put together a package, and send you
              the exact cost — usually within 24 hours. No payment until you
              approve the quote.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "You submit the request — takes a minute",
                "An admin reviews availability for your dates",
                "You receive the cost quote in your dashboard",
                "Approve it and we convert it into a booking",
              ].map((s, i) => (
                <li
                  key={s}
                  className="flex items-center gap-3 text-sm font-bold text-white/85"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-white">
                    {i + 1}
                  </span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
          {done ? (
            <div className="rounded-3xl bg-white p-8 text-center">
              <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-500" />
              <h3 className="font-display mt-4 text-2xl font-bold text-primary">
                Request Submitted!
              </h3>
              <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed font-medium text-slate-500">
                Request #{done} is with our planners. Watch your dashboard for a
                quote.
              </p>
              <button
                type="button"
                onClick={() => setDone(null)}
                className="mt-6 cursor-pointer rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-white"
              >
                Send another
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-3">
              {errors.length > 0 && (
                <ul className="rounded-xl bg-red-500/15 px-3 py-2 text-xs font-bold text-red-200">
                  {errors.map((er) => (
                    <li key={er}>{er}</li>
                  ))}
                </ul>
              )}
              <input
                required
                value={form.destination}
                onChange={(e) =>
                  setForm({ ...form, destination: e.target.value })
                }
                placeholder="Destination (e.g. Maldives overwater villa)"
                className={inputCls}
              />
              <input
                required
                value={form.fromCity}
                onChange={(e) => setForm({ ...form, fromCity: e.target.value })}
                placeholder="Your city / departing from"
                className={inputCls}
              />
              <div className="grid grid-cols-2 gap-3">
                <label>
                  <span className="mb-1 block text-[11px] font-bold text-white/60">
                    Travel date
                  </span>
                  <input
                    type="date"
                    value={form.checkIn}
                    onChange={(e) =>
                      setForm({ ...form, checkIn: e.target.value })
                    }
                    className={inputCls}
                  />
                </label>
                <label>
                  <span className="mb-1 block text-[11px] font-bold text-white/60">
                    Return
                  </span>
                  <input
                    type="date"
                    value={form.checkOut}
                    onChange={(e) =>
                      setForm({ ...form, checkOut: e.target.value })
                    }
                    className={inputCls}
                  />
                </label>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/15 bg-white/10 px-4 py-2.5">
                <span className="text-sm font-bold text-white">Travelers</span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    aria-label="Fewer travelers"
                    onClick={() =>
                      setForm({
                        ...form,
                        travelers: Math.max(1, form.travelers - 1),
                      })
                    }
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-5 text-center text-sm font-bold text-white">
                    {form.travelers}
                  </span>
                  <button
                    type="button"
                    aria-label="More travelers"
                    onClick={() =>
                      setForm({
                        ...form,
                        travelers: Math.min(12, form.travelers + 1),
                      })
                    }
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <input
                value={form.budget}
                onChange={(e) => setForm({ ...form, budget: e.target.value })}
                placeholder="Budget (optional)"
                className={inputCls}
              />
              <textarea
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Notes — vibe, hotel style, must-dos…"
                rows={3}
                className={inputCls}
              />
              <button
                type="submit"
                className="w-full cursor-pointer rounded-full bg-accent py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/30 transition hover:bg-accent-hover"
              >
                Request a Quote
              </button>
              <p className="text-center text-[11px] font-medium text-white/50">
                You will be notified on your dashboard once an admin approves
                availability & cost.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

export function FlightCard({ f, onBook }: { f: Flight; onBook: () => void }) {
  return (
    <div className="card-hover rounded-3xl border border-slate-100 bg-white p-6 shadow-lg shadow-slate-200/40">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Plane className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-bold text-primary">
              {f.airline || "Airline TBD"}
            </p>
            <p className="text-xs font-medium text-slate-400">
              {f.stops || "Non-stop"} · {f.duration || "Duration TBD"}
            </p>
          </div>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-[11px] font-bold ${
            f.available_seats > 0
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {f.available_seats > 0
            ? `${f.available_seats} seats available`
            : "Sold out"}
        </span>
      </div>
      <div className="mt-5 flex items-center justify-between">
        <div>
          <p className="font-display text-2xl font-bold text-primary">
            {f.departure_city}
          </p>
          <p className="text-xs font-medium text-slate-400">
            {f.departure_date
              ? `${formatDate(f.departure_date)} ${formatTime(f.departure_date)}`
              : "Date TBD"}
          </p>
        </div>
        <div className="flex flex-1 items-center px-4">
          <span className="h-px flex-1 border-t-2 border-dashed border-slate-200" />
          <Plane className="mx-2 h-4 w-4 rotate-45 text-accent" />
          <span className="h-px flex-1 border-t-2 border-dashed border-slate-200" />
        </div>
        <div className="text-right">
          <p className="font-display text-2xl font-bold text-primary">
            {f.arrival_city}
          </p>
          <p className="text-xs font-medium text-slate-400">
            {f.arrival_date
              ? `${formatDate(f.arrival_date)} ${formatTime(f.arrival_date)}`
              : "Date TBD"}
          </p>
        </div>
      </div>
      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <p className="font-display text-2xl font-bold text-accent">
          {money(f.price)}
        </p>
        <button
          type="button"
          onClick={onBook}
          disabled={f.available_seats <= 0}
          className="cursor-pointer rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-white transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
        >
          Book Now →
        </button>
      </div>
    </div>
  );
}
