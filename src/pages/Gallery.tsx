import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Camera, ImageOff, Play, X } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useStore } from '../lib/store';
import type { MediaItem } from '../lib/types';

export default function Gallery() {
  const { media } = useStore();
  const [filter, setFilter] = useState<'all' | 'photo' | 'video'>('all');
  const [active, setActive] = useState<MediaItem | null>(null);

  const photos = media.filter((m) => m.type === 'photo').length;
  const videos = media.filter((m) => m.type === 'video').length;
  const list = useMemo(
    () => media.filter((m) => filter === 'all' || m.type === filter),
    [media, filter],
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="bg-primary px-4 pt-32 pb-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <h1 className="font-display text-4xl font-bold text-white sm:text-5xl">Media Gallery</h1>
          <p className="mt-2 font-bold text-white/70">
            Explore {photos} photos and {videos} videos from our travels
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex gap-2">
          {(['all', 'photo', 'video'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={`cursor-pointer rounded-full px-5 py-2.5 text-sm font-bold capitalize transition ${
                filter === f
                  ? 'bg-accent text-white shadow-lg shadow-orange-500/20'
                  : 'border border-slate-200 bg-white text-primary hover:bg-slate-100'
              }`}
            >
              {f === 'all' ? 'All' : f === 'photo' ? 'Photos' : 'Videos'}
            </button>
          ))}
        </div>

        {list.length === 0 ? (
          <div className="py-24 text-center">
            <ImageOff className="mx-auto mb-4 h-16 w-16 text-slate-300" />
            <p className="font-display text-2xl font-bold text-primary">No media available yet</p>
            <p className="mt-2 text-sm font-medium text-slate-500">
              Check back soon for travel photos and videos!
            </p>
          </div>
        ) : (
          <div className="columns-2 gap-4 space-y-4 md:columns-3 lg:columns-4">
            {list.map((m, i) => (
              <motion.button
                key={m.id}
                type="button"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.35, delay: (i % 4) * 0.05 }}
                onClick={() => setActive(m)}
                className="group relative block w-full cursor-pointer overflow-hidden rounded-2xl shadow-md ring-1 ring-slate-100"
              >
                {m.type === 'photo' ? (
                  <img
                    src={m.url}
                    alt={m.title}
                    loading="lazy"
                    className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="relative">
                    <video src={m.url} className="w-full object-cover" muted preload="metadata" />
                    <span className="absolute inset-0 flex items-center justify-center bg-primary/40">
                      <Play className="h-10 w-10 fill-white text-white" />
                    </span>
                  </div>
                )}
                <span className="absolute right-2 bottom-2 flex items-center gap-1 rounded-full bg-primary/70 px-2.5 py-1 text-[10px] font-bold text-white uppercase backdrop-blur">
                  {m.type === 'photo' ? <Camera className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                  {m.type}
                </span>
              </motion.button>
            ))}
          </div>
        )}
      </main>

      {/* Lightbox */}
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActive(null)}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-primary/90 p-4 backdrop-blur"
          >
            <button
              type="button"
              onClick={() => setActive(null)}
              className="absolute top-4 right-4 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            {active.type === 'photo' ? (
              <img
                src={active.url}
                alt={active.title}
                className="max-h-[80vh] max-w-full rounded-lg shadow-2xl"
              />
            ) : (
              <video src={active.url} controls autoPlay className="max-h-[80vh] max-w-full rounded-lg shadow-2xl" />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
