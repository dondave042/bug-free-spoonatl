import { useMemo, useState } from "react";
import { ImageOff, X } from "lucide-react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { useStore } from "../lib/store";
import type { MediaItem } from "../lib/types";

export function Gallery() {
  const { media } = useStore();
  const [tab, setTab] = useState<"all" | "photo" | "video">("all");
  const [open, setOpen] = useState<MediaItem | null>(null);
  const photos = media.filter((m) => m.type === "photo").length;
  const videos = media.filter((m) => m.type === "video").length;
  const list = useMemo(
    () => media.filter((m) => tab === "all" || m.type === tab),
    [media, tab],
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="bg-primary px-4 pt-32 pb-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="font-display text-4xl font-bold text-white sm:text-5xl">
            Media Gallery
          </h1>
          <p className="mt-2 font-bold text-white/70">
            Explore {photos} photos and {videos} videos from our travels
          </p>
        </div>
      </div>
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex gap-2">
          {(["all", "photo", "video"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`cursor-pointer rounded-full px-5 py-2.5 text-sm font-bold capitalize transition ${
                tab === t
                  ? "bg-accent text-white shadow-lg shadow-orange-500/20"
                  : "border border-slate-200 bg-white text-primary hover:bg-slate-100"
              }`}
            >
              {t === "all" ? "All" : t === "photo" ? "Photos" : "Videos"}
            </button>
          ))}
        </div>
        {list.length === 0 ? (
          <div className="py-24 text-center">
            <ImageOff className="mx-auto mb-4 h-16 w-16 text-slate-300" />
            <p className="font-bold text-slate-500">
              Check back soon for travel photos and videos!
            </p>
          </div>
        ) : (
          <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
            {list.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setOpen(m)}
                className="mb-4 block w-full cursor-pointer overflow-hidden rounded-2xl"
              >
                {m.type === "video" ? (
                  <video
                    src={m.url}
                    className="w-full object-cover"
                    muted
                    playsInline
                  />
                ) : (
                  <img
                    src={m.url}
                    alt={m.title}
                    className="w-full object-cover transition hover:scale-[1.02]"
                  />
                )}
              </button>
            ))}
          </div>
        )}
      </main>
      <Footer />
      {open && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-primary/80 p-4 backdrop-blur-sm"
          onClick={() => setOpen(null)}
        >
          <button
            type="button"
            onClick={() => setOpen(null)}
            className="absolute top-5 right-5 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          {open.type === "video" ? (
            <video
              src={open.url}
              controls
              autoPlay
              className="max-h-[85vh] max-w-full rounded-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <img
              src={open.url}
              alt={open.title}
              className="max-h-[85vh] max-w-full rounded-2xl object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          )}
        </div>
      )}
    </div>
  );
}