import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MapPin, Plane } from "lucide-react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { BookingModal } from "../components/BookingModal";
import { FlightCard } from "./Home";
import { useStore } from "../lib/store";
import type { BookableItem, ItemType } from "../lib/types";
import { money } from "../lib/utils";

export function Bookings() {
  const { destinations, flights, user, notify } = useStore();
  const nav = useNavigate();
  const [params] = useSearchParams();
  const initial = params.get("search") ?? "";
  const [q, setQ] = useState(initial);
  const [tab, setTab] = useState<"flights" | "destinations">("flights");
  const [item, setItem] = useState<BookableItem | null>(null);
  const [itemType, setItemType] = useState<ItemType>("flight");

  const qn = q.trim().toLowerCase();
  const flightList = useMemo(
    () =>
      flights.filter(
        (f) =>
          !qn ||
          f.arrival_city.toLowerCase().includes(qn) ||
          f.airline.toLowerCase().includes(qn) ||
          f.departure_city.toLowerCase().includes(qn),
      ),
    [flights, qn],
  );
  const destList = useMemo(
    () =>
      destinations.filter(
        (d) =>
          !qn ||
          d.name.toLowerCase().includes(qn) ||
          d.location.toLowerCase().includes(qn),
      ),
    [destinations, qn],
  );

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
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="bg-primary px-4 pt-32 pb-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="font-display text-4xl font-bold text-white sm:text-5xl">
            Book Your Trip
          </h1>
          <p className="mt-2 font-bold text-white/70">
            Browse flights and destinations
          </p>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search flights or destinations…"
            className="mt-7 w-full max-w-xl rounded-full border-0 px-6 py-3.5 text-sm font-bold text-slate-900 shadow-xl outline-none placeholder:font-medium placeholder:text-slate-400 focus:ring-4 focus:ring-accent/30"
          />
        </div>
      </div>
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex gap-2">
          {[
            { id: "flights" as const, label: `Flights (${flightList.length})`, icon: Plane },
            {
              id: "destinations" as const,
              label: `Vacation Packages (${destList.length})`,
              icon: MapPin,
            },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex cursor-pointer items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition ${
                tab === t.id
                  ? "bg-accent text-white shadow-lg shadow-orange-500/20"
                  : "border border-slate-200 bg-white text-primary hover:bg-slate-50"
              }`}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </div>

        {tab === "flights" ? (
          flightList.length === 0 ? (
            <p className="py-16 text-center font-bold text-slate-400">
              {flights.length === 0
                ? "Loading flights..."
                : "No flights match your search."}
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
                      "flight",
                    )
                  }
                />
              ))}
            </div>
          )
        ) : destList.length === 0 ? (
          <p className="py-16 text-center font-bold text-slate-400">
            {destinations.length === 0
              ? "Loading destinations..."
              : "No destinations match your search."}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {destList.map((d) => (
              <article
                key={d.id}
                className="card-hover overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-lg"
              >
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={d.image}
                    alt={d.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="p-5">
                  <p className="text-[11px] font-bold tracking-wider text-accent uppercase">
                    {d.location}
                  </p>
                  <h3 className="font-display mt-1 text-xl font-bold text-primary">
                    {d.name}
                  </h3>
                  <div className="mt-4 flex items-center justify-between">
                    <p className="font-display text-xl font-bold text-accent">
                      {money(d.price)}
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        book(
                          { id: d.id, name: d.name, price: d.price },
                          "destination",
                        )
                      }
                      className="cursor-pointer rounded-full bg-primary px-4 py-2 text-xs font-bold text-white hover:bg-accent"
                    >
                      Book Now
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
        open={!!item}
        onClose={() => setItem(null)}
        item={item}
        itemType={itemType}
      />
    </div>
  );
}