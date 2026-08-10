import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { MapPin, Palmtree, Plane } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BookingModal, { type BookableItem } from '../components/BookingModal';
import { FlightCard } from './Home';
import { useStore } from '../lib/store';
import { fmt } from '../lib/data';

export default function Bookings() {
  const { flights, destinations, user, notify } = useStore();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'flights' | 'destinations'>('flights');
  const [query, setQuery] = useState(params.get('search') ?? '');
  const [item, setItem] = useState<BookableItem | null>(null);
  const [itemType, setItemType] = useState<'flight' | 'destination'>('flight');
  const guests = Number(params.get('guests') ?? 1) || 1;

  useEffect(() => {
    setQuery(params.get('search') ?? '');
  }, [params]);

  const q = query.trim().toLowerCase();
  const flightList = useMemo(
    () =>
      flights.filter(
        (f) =>
          !q ||
          f.arrival_city.toLowerCase().includes(q) ||
          f.airline.toLowerCase().includes(q) ||
          f.departure_city.toLowerCase().includes(q),
      ),
    [flights, q],
  );
  const destList = useMemo(
    () =>
      destinations.filter(
        (d) => !q || d.name.toLowerCase().includes(q) || d.location.toLowerCase().includes(q),
      ),
    [destinations, q],
  );

  const book = (b: BookableItem, type: 'flight' | 'destination') => {
    if (!user) {
      notify('Please login to book', 'error');
      navigate('/login');
      return;
    }
    setItemType(type);
    setItem(b);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="bg-primary px-4 pt-32 pb-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="font-display text-4xl font-bold text-white sm:text-5xl">Book Your Trip</h1>
          <p className="mt-2 font-bold text-white/70">Browse flights and destinations</p>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search flights or destinations…"
            className="mt-7 w-full max-w-xl rounded-full border-0 px-6 py-3.5 text-sm font-bold text-slate-900 shadow-xl outline-none placeholder:font-medium placeholder:text-slate-400 focus:ring-4 focus:ring-accent/30"
          />
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex gap-2">
          {(
            [
              { id: 'flights', label: `Flights (${flightList.length})`, icon: Plane },
              { id: 'destinations', label: `Vacation Packages (${destList.length})`, icon: Palmtree },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex cursor-pointer items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition ${
                tab === t.id
                  ? 'bg-accent text-white shadow-lg shadow-orange-500/20'
                  : 'border border-slate-200 bg-white text-primary hover:bg-slate-50'
              }`}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'flights' ? (
          flightList.length === 0 ? (
            <p className="py-16 text-center font-bold text-slate-400">
              {flights.length === 0 ? 'Loading flights...' : 'No flights match your search.'}
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {flightList.map((f) => (
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
                      'flight',
                    )
                  }
                />
              ))}
            </div>
          )
        ) : destList.length === 0 ? (
          <p className="py-16 text-center font-bold text-slate-400">No packages match your search.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {destList.map((d) => (
              <article
                key={d.id}
                className="card-hover overflow-hidden rounded-[2rem] bg-white shadow-lg shadow-slate-200/50 ring-1 ring-slate-100"
              >
                <div className="relative h-52 overflow-hidden">
                  <img src={d.image} alt={d.name} loading="lazy" className="h-full w-full object-cover" />
                  <span className="absolute right-4 bottom-4 rounded-full bg-primary/85 px-3.5 py-1.5 text-xs font-bold text-white backdrop-blur">
                    From {fmt(d.price)}
                  </span>
                </div>
                <div className="p-5">
                  <p className="flex items-center gap-1.5 text-[11px] font-bold tracking-wide text-accent uppercase">
                    <MapPin className="h-3.5 w-3.5" />
                    {d.location}
                  </p>
                  <h2 className="font-display mt-1 text-lg font-bold text-primary">{d.name}</h2>
                  <button
                    type="button"
                    onClick={() => book({ id: d.id, name: d.name, price: d.price }, 'destination')}
                    className="mt-4 w-full cursor-pointer rounded-2xl bg-accent py-2.5 text-sm font-bold text-white transition hover:bg-accent-hover"
                  >
                    Book Now
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <Footer />
      <BookingModal
        open={!!item}
        onClose={() => setItem(null)}
        item={item}
        itemType={itemType}
        defaultGuests={guests}
      />
    </div>
  );
}
