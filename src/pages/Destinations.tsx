import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Plane, Star } from "lucide-react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { BookingModal } from "../components/BookingModal";
import { useStore } from "../lib/store";
import type { Destination } from "../lib/types";
import { money } from "../lib/utils";

export function Destinations() {
  const { destinations, user, notify } = useStore();
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [pick, setPick] = useState<Destination | null>(null);

  const list = useMemo(
    () =>
      destinations.filter(
        (d) =>
          !q ||
          d.name.toLowerCase().includes(q.toLowerCase()) ||
          d.location.toLowerCase().includes(q.toLowerCase()),
      ),
    [destinations, q],
  );

  const book = (d: Destination) => {
    if (!user) {
      notify("Please login to book", "error");
      nav("/login");
      return;
    }
    setPick(d);
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
              value={q}
              onChange={(e) => setQ(e.target.value)}
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
              {destinations.length === 0
                ? "Loading destinations..."
                : "No destinations match your search."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3">
            {list.map((d) => (
              <article
                key={d.id}
                className="card-hover overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-lg shadow-slate-200/40"
              >
                <div className="relative h-56 overflow-hidden">
                  {d.media?.[0]?.type === "video" ? <video src={d.media[0].url} aria-label={d.name} className="h-full w-full object-cover" controls muted /> : <img src={d.media?.[0]?.url || d.image} alt={d.name} className="h-full w-full object-cover" />}
                  <span className="absolute top-4 right-4 rounded-full bg-primary/85 px-3 py-1 text-xs font-bold text-white">
                    {money(d.price)}
                  </span>
                </div>
                <div className="p-6">
                  <p className="text-[11px] font-bold tracking-wider text-accent uppercase">
                    {d.location}
                  </p>
                  <h3 className="font-display mt-1 text-2xl font-bold text-primary">
                    {d.name}
                  </h3>
                  <p className="mt-2 line-clamp-3 text-sm font-medium text-slate-500">
                    {d.description}
                  </p>
                  <div className="mt-5 flex items-center justify-between">
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
                      onClick={() => book(d)}
                      className="cursor-pointer rounded-full bg-accent px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-orange-500/20 transition hover:bg-accent-hover"
                    >
                      Book This Package
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
      <Footer />
      <BookingModal
        open={!!pick}
        onClose={() => setPick(null)}
        item={
          pick
            ? { id: pick.id, name: pick.name, price: pick.price }
            : null
        }
        itemType="destination"
      />
    </div>
  );
}
