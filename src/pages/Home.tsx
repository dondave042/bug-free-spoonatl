import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BedDouble,
  CalendarDays,
  Compass,
  MapPin,
  Minus,
  Phone,
  Plane,
  Plus,
  Search,
  Send,
  Star,
  Ticket,
  Users,
} from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BookingModal, { type BookableItem } from '../components/BookingModal';
import { SectionHeading } from '../components/ui';
import { useStore } from '../lib/store';
import { CONTACT_EMAIL, CONTACT_PHONE, EXCURSIONS, OFFICE, TESTIMONIALS, fmt, fmtDate, fmtTime } from '../lib/data';

export default function Home() {
  const { destinations, flights, user, notify } = useStore();
  const navigate = useNavigate();
  const [bookingItem, setBookingItem] = useState<BookableItem | null>(null);
  const [bookingType, setBookingType] = useState<'flight' | 'destination'>('destination');
  const [contact, setContact] = useState({ name: '', email: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);

  const openBooking = (item: BookableItem, type: 'flight' | 'destination') => {
    if (!user) {
      notify('Please login to book', 'error');
      navigate('/login');
      return;
    }
    setBookingType(type);
    setBookingItem(item);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />

      {/* Quick CTAs */}
      <section className="relative z-20 mx-auto -mt-10 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: Compass, title: 'Top Destinations', sub: 'Explore our favorites', to: '/destinations' },
            { icon: Ticket, title: 'View All Flights', sub: 'Browse flight deals', to: '/bookings' },
            { icon: Phone, title: 'Talk to an Expert', sub: CONTACT_PHONE, to: `tel:${CONTACT_PHONE.replace(/[^+0-9]/g, '')}` },
          ].map((c) => (
            <Link
              key={c.title}
              to={c.to}
              className="card-hover group flex items-center justify-between rounded-3xl border border-slate-100 bg-white p-5 shadow-lg shadow-slate-200/50 hover:no-underline"
            >
              <div className="flex items-center gap-4">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent transition group-hover:bg-accent group-hover:text-white">
                  <c.icon className="h-5.5 w-5.5" />
                </span>
                <div>
                  <p className="font-bold text-primary">{c.title}</p>
                  <p className="text-xs font-medium text-slate-500">{c.sub}</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-slate-300 transition group-hover:translate-x-1 group-hover:text-accent" />
            </Link>
          ))}
        </div>
      </section>

      {/* Excursion carousel */}
      <section id="destinations" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading title="Top Rated Destinations" sub="Curated excursions with instant confirmation" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {EXCURSIONS.map((x, i) => (
            <motion.div
              key={x.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45, delay: (i % 3) * 0.08 }}
            >
              <Link to="/destinations" className="group block cursor-pointer">
                <div className="relative mb-4 h-64 overflow-hidden rounded-3xl">
                  <img
                    src={x.image}
                    alt={x.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <span className="absolute top-4 left-4 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-bold tracking-wide text-primary uppercase backdrop-blur">
                    {x.location}
                  </span>
                </div>
                <h3 className="font-display text-lg font-bold text-primary transition group-hover:text-accent">
                  {x.title}
                </h3>
                <div className="mt-1.5 flex items-center justify-between">
                  <p className="text-sm font-bold text-primary">
                    From <span className="text-accent">${x.price}</span>
                  </p>
                  <p className="flex items-center gap-1 text-xs font-bold text-primary">
                    <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                    {x.rating}
                    <span className="font-medium text-slate-400">({x.reviews})</span>
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Vacation packages from catalog */}
      <section className="bg-soft/60 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-4xl font-bold text-primary sm:text-5xl">
                Featured Vacation Packages
              </h2>
              <p className="mt-2 text-base font-bold text-primary/70">
                Complete getaways with stays, cruises and resorts
              </p>
            </div>
            <Link
              to="/destinations"
              className="flex items-center gap-1.5 text-sm font-bold text-accent transition hover:text-accent-hover"
            >
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {destinations.slice(0, 6).map((d, i) => (
              <motion.article
                key={d.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.45, delay: (i % 3) * 0.08 }}
                className="card-hover group overflow-hidden rounded-[2rem] bg-white shadow-lg shadow-slate-200/50"
              >
                <div className="relative h-60 overflow-hidden">
                  <img
                    src={d.image}
                    alt={d.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <span className="absolute right-4 bottom-4 rounded-full bg-primary/85 px-3.5 py-1.5 text-xs font-bold text-white backdrop-blur">
                    From {fmt(d.price)}
                  </span>
                </div>
                <div className="p-6">
                  <p className="flex items-center gap-1.5 text-xs font-bold tracking-wide text-accent uppercase">
                    <MapPin className="h-3.5 w-3.5" />
                    {d.location}
                  </p>
                  <h3 className="font-display mt-1.5 text-xl font-bold text-primary">{d.name}</h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed font-medium text-slate-500">
                    {d.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                    <p className="flex items-center gap-1 text-xs font-bold text-primary">
                      <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                      {d.rating}
                      {d.reviews && <span className="font-medium text-slate-400">({d.reviews})</span>}
                    </p>
                    <button
                      type="button"
                      onClick={() => openBooking({ id: d.id, name: d.name, price: d.price }, 'destination')}
                      className="cursor-pointer rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-white transition hover:bg-accent"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Flights */}
      <section id="flights" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading title="Flight Deals" sub="Best flight deals for your next adventure" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {flights.slice(0, 4).map((f) => (
            <FlightCard key={f.id} f={f} onBook={() => openBooking({ id: f.id, name: `${f.airline} — ${f.departure_city} to ${f.arrival_city}`, price: f.price }, 'flight')} />
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

      {/* Partner promo */}
      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2">
          <a
            href="https://www.viator.com"
            target="_blank"
            rel="noreferrer"
            className="group flex items-center justify-between rounded-[2rem] bg-primary p-8 text-white transition hover:no-underline"
          >
            <div>
              <p className="text-[11px] font-bold tracking-[0.2em] text-accent uppercase">Viator Partner</p>
              <h3 className="font-display mt-2 text-2xl font-bold">Over 400,000 experiences worldwide</h3>
              <p className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-accent">
                Explore Viator <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </p>
            </div>
            <Ticket className="h-12 w-12 text-white/20" />
          </a>
          <a
            href="https://www.airbnb.com"
            target="_blank"
            rel="noreferrer"
            className="group flex items-center justify-between rounded-[2rem] bg-[#ff5a5f] p-8 text-white transition hover:no-underline"
          >
            <div>
              <p className="text-[11px] font-bold tracking-[0.2em] text-white/80 uppercase">Airbnb Partner</p>
              <h3 className="font-display mt-2 text-2xl font-bold">Unique stays around the globe</h3>
              <p className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-white">
                Browse Homes <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </p>
            </div>
            <BedDouble className="h-12 w-12 text-white/30" />
          </a>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <SectionHeading title="What Our Travelers Say" sub="Real experiences from real travelers" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {TESTIMONIALS.map((t) => (
            <blockquote
              key={t.id}
              className="flex flex-col rounded-3xl border border-slate-100 bg-white p-6 shadow-lg shadow-slate-200/40"
            >
              <div className="mb-3 flex gap-0.5">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="flex-1 text-sm leading-relaxed font-medium text-slate-600">
                &ldquo;{t.text}&rdquo;
              </p>
              <footer className="mt-5 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent">
                  {t.initials}
                </span>
                <div>
                  <p className="text-sm font-bold text-primary">{t.name}</p>
                  <p className="text-xs font-medium text-slate-400">{t.location}</p>
                </div>
              </footer>
            </blockquote>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
        <SectionHeading
          center
          title="Get In Touch"
          sub="We'd love to hear from you and help plan your dream vacation"
        />
        <div className="grid gap-8 md:grid-cols-3">
          <div className="space-y-8 md:col-span-1">
            {[
              { label: 'Email', value: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
              { label: 'Phone', value: CONTACT_PHONE, href: `tel:${CONTACT_PHONE.replace(/[^+0-9]/g, '')}` },
              { label: 'Office', value: OFFICE, href: undefined },
            ].map((c) => (
              <div key={c.label} className="flex gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                  {c.label === 'Email' ? <Send className="h-5 w-5" /> : c.label === 'Phone' ? <Phone className="h-5 w-5" /> : <MapPin className="h-5 w-5" />}
                </span>
                <div>
                  <h4 className="mb-1 font-bold text-primary">{c.label}</h4>
                  {c.href ? (
                    <a href={c.href} className="font-semibold break-all text-primary transition hover:text-accent">
                      {c.value}
                    </a>
                  ) : (
                    <p className="font-semibold text-primary">{c.value}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          <form
            className="rounded-[2rem] border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/50 md:col-span-2"
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
              setContact({ name: '', email: '', phone: '', message: '' });
              notify('Message sent successfully!');
              window.setTimeout(() => setSent(false), 4000);
            }}
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-primary">Full Name</span>
                <input required value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3 font-bold text-slate-900 outline-none focus:border-accent focus:ring-2 focus:ring-orange-200" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-primary">Email</span>
                <input required type="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3 font-bold text-slate-900 outline-none focus:border-accent focus:ring-2 focus:ring-orange-200" />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-primary">Phone Number</span>
                <input value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3 font-bold text-slate-900 outline-none focus:border-accent focus:ring-2 focus:ring-orange-200" />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-2 block text-sm font-semibold text-primary">Message</span>
                <textarea required rows={4} value={contact.message} onChange={(e) => setContact({ ...contact, message: e.target.value })} placeholder="Tell us about your dream vacation..." className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 font-bold text-slate-900 outline-none focus:border-accent focus:ring-2 focus:ring-orange-200" />
              </label>
            </div>
            {sent && (
              <p className="mt-4 rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-sm font-bold text-green-700">
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
        open={!!bookingItem}
        onClose={() => setBookingItem(null)}
        item={bookingItem}
        itemType={bookingType}
      />
    </div>
  );
}

/* ---------- Hero ---------- */

function Hero() {
  const navigate = useNavigate();
  const [guests, setGuests] = useState(2);
  const [form, setForm] = useState({ destination: '', checkin: '', checkout: '' });

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/bookings?search=${encodeURIComponent(form.destination)}&guests=${guests}`);
  };

  return (
    <section className="relative flex min-h-[92vh] items-center overflow-hidden pt-24 pb-16">
      <div className="hero-bg absolute inset-0 scale-105 transform" aria-hidden="true" />
      <div className="absolute inset-0 bg-primary/55" aria-hidden="true" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-5xl leading-[1.08] font-bold text-white sm:text-6xl lg:text-7xl"
          >
            Your Next{' '}
            <span className="text-accent italic">Dream Vacation</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            className="mx-auto mt-5 max-w-xl text-base leading-relaxed font-medium text-white/85 sm:text-lg"
          >
            Handpicked villas, boutique hotels, and once-in-a-lifetime experiences curated by
            travel professionals.
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

          {/* Search card */}
          <motion.form
            onSubmit={search}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32 }}
            className="hero-card glass mt-10 rounded-[2rem] p-6 text-left shadow-2xl sm:p-8"
          >
            <p className="mb-4 text-xs font-bold tracking-wider text-primary/60 uppercase">
              Tell us where you're headed
            </p>
            <div className="grid gap-3 sm:grid-cols-[1.4fr_1fr_1fr]">
              <label className="relative block">
                <span className="mb-1.5 block text-[11px] font-bold tracking-wider text-primary uppercase">
                  Where to?
                </span>
                <MapPin className="absolute bottom-3.5 left-4 h-5 w-5 text-slate-400" />
                <input
                  value={form.destination}
                  onChange={(e) => setForm({ ...form, destination: e.target.value })}
                  placeholder="Cancun, Jamaica, Miami…"
                  className="w-full rounded-xl border border-slate-200 py-3 pr-4 pl-12 text-sm font-bold text-slate-900 outline-none focus:border-accent focus:ring-2 focus:ring-orange-100"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-bold tracking-wider text-primary uppercase">
                  Check-in
                </span>
                <div className="relative">
                  <CalendarDays className="absolute top-1/2 left-4 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="date"
                    value={form.checkin}
                    onChange={(e) => setForm({ ...form, checkin: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 py-3 pr-3 pl-11 text-sm font-bold text-slate-900 outline-none focus:border-accent focus:ring-2 focus:ring-orange-100"
                  />
                </div>
              </label>
              <div>
                <span className="mb-1.5 block text-[11px] font-bold tracking-wider text-primary uppercase">
                  Guests
                </span>
                <div className="flex items-center justify-between rounded-xl border border-slate-200 px-2 py-1.5">
                  <button type="button" onClick={() => setGuests((g) => Math.max(1, g - 1))} className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white transition hover:bg-slate-100" aria-label="Fewer guests">
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="flex items-center gap-1.5 text-sm font-bold">
                    <Users className="h-4 w-4 text-slate-400" />
                    {guests}
                  </span>
                  <button type="button" onClick={() => setGuests((g) => Math.min(12, g + 1))} className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-slate-200 bg-white transition hover:bg-slate-100" aria-label="More guests">
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
            <button
              type="submit"
              className="mt-5 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-accent py-4 font-bold tracking-wide text-white shadow-lg shadow-orange-500/20 transition-colors hover:bg-accent-hover"
            >
              <Search className="h-4.5 w-4.5" />
              SEARCH GETAWAYS
            </button>
          </motion.form>
        </div>
      </div>
    </section>
  );
}

/* ---------- Flight card ---------- */

export function FlightCard({ f, onBook }: { f: import('../lib/types').Flight; onBook: () => void }) {
  return (
    <div className="card-hover rounded-3xl border border-slate-100 bg-white p-6 shadow-lg shadow-slate-200/40">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <Plane className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-bold text-primary">{f.airline || 'Airline TBD'}</p>
            <p className="text-xs font-medium text-slate-400">
              {f.stops || 'Non-stop'} · {f.duration || 'Duration TBD'}
            </p>
          </div>
        </div>
        <span
          className={`rounded-full border px-3 py-1 text-[11px] font-bold ${
            f.available_seats > 0
              ? 'border-green-200 bg-green-50 text-green-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {f.available_seats > 0 ? `${f.available_seats} seats available` : 'Sold out'}
        </span>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <div>
          <p className="font-display text-2xl font-bold text-primary">{f.departure_city}</p>
          <p className="text-xs font-medium text-slate-400">{f.departure_date ? `${fmtDate(f.departure_date)} ${fmtTime(f.departure_date)}` : 'Date TBD'}</p>
        </div>
        <div className="flex flex-1 items-center px-4">
          <span className="h-px flex-1 border-t-2 border-dashed border-slate-200" />
          <Plane className="mx-2 h-4 w-4 rotate-45 text-accent" />
          <span className="h-px flex-1 border-t-2 border-dashed border-slate-200" />
        </div>
        <div className="text-right">
          <p className="font-display text-2xl font-bold text-primary">{f.arrival_city}</p>
          <p className="text-xs font-medium text-slate-400">{f.arrival_date ? `${fmtDate(f.arrival_date)} ${fmtTime(f.arrival_date)}` : ''}</p>
        </div>
      </div>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <p className="text-sm font-medium text-slate-500">
          {f.price > 0 ? (
            <>
              From <span className="font-display text-xl font-bold text-accent">{fmt(f.price)}</span>
            </>
          ) : (
            <span className="font-display text-xl font-bold text-accent italic">On Request</span>
          )}
        </p>
        <button
          type="button"
          onClick={onBook}
          className="cursor-pointer text-sm font-bold text-accent transition hover:text-accent-hover"
        >
          Book Now →
        </button>
      </div>
    </div>
  );
}
