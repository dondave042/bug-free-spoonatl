import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Plane } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BookingModal, { type BookableItem } from '../components/BookingModal';
import { useStore } from '../lib/store';
import { fmt } from '../lib/data';

export default function Destinations() {
  const { destinations, user, notify } = useStore();
  const navigate = useNavigate();
  const [item, setItem] = useState<BookableItem | null>(null);
  const [query, setQuery] = useState('');

  const list = destinations.filter(
    (d) =>
      !query ||
      d.name.toLowerCase().includes(query.toLowerCase()) ||
      d.location.toLowerCase().includes(query.toLowerCase()),
  );

  const book = (d: BookableItem) => {
    if (!user) {
      notify('Please login to book', 'error');
      navigate('/login');
      return;
    }
    setItem(d);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="bg-primary px-4 pt-32 pb-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="font-display text-4xl font-bold text-white sm:text-5xl">
            Explore Destinations
          </h1>
          <p className="mt-2 font-bold text-white/70">
            Handpicked luxury escapes around the world
          </p>
          <div className="relative mt-8 max-w-xl">
            <MapPin className="absolute top-1/2 left-5 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by destination, resort or country…"
              className="w-full rounded-full border-0 py-4 pr-5 pl-13 text-sm font-bold text-slate-900 shadow-xl outline-none placeholder:font-medium placeholder:text-slate-400 focus:ring-4 focus:ring-accent/30"
            />
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {list.length === 0 ? (
          <div className="py-20 text-center">
            <Plane className="mx-auto mb-4 h-14 w-14 text-slate-200" />
            <p className="font-bold text-slate-500">
              {destinations.length === 0 ? 'Loading destinations...' : 'No destinations match your search.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((d, i) => (
              <motion.article
                key={d.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.4, delay: (i % 3) * 0.07 }}
                className="card-hover group overflow-hidden rounded-[2rem] bg-white shadow-lg shadow-slate-200/50 ring-1 ring-slate-100"
              >
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={d.image}
                    alt={d.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <span className="absolute right-4 bottom-4 rounded-full bg-accent px-4 py-1.5 text-sm font-bold text-white shadow-lg">
                    From {fmt(d.price)}
                  </span>
                </div>
                <div className="p-6">
                  <p className="flex items-center gap-1.5 text-xs font-bold tracking-wide text-accent uppercase">
                    <MapPin className="h-3.5 w-3.5" />
                    {d.location}
                  </p>
                  <h2 className="font-display mt-1.5 text-xl font-bold text-primary">{d.name}</h2>
                  <p className="mt-2 line-clamp-2 text-sm leading-relaxed font-medium text-slate-500">
                    {d.description}
                  </p>
                  <button
                    type="button"
                    onClick={() => book({ id: d.id, name: d.name, price: d.price })}
                    className="mt-5 w-full cursor-pointer rounded-2xl bg-accent py-3 font-bold text-white transition hover:bg-accent-hover"
                  >
                    Book This Package
                  </button>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </main>

      <Footer />
      <BookingModal open={!!item} onClose={() => setItem(null)} item={item} itemType="destination" />
    </div>
  );
}
