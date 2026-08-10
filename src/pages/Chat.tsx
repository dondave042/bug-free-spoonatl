import { useEffect, useRef, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ArrowLeft, MessageCircle, Send } from 'lucide-react';
import Header from '../components/Header';
import { useStore } from '../lib/store';
import { fmtDateTime } from '../lib/data';

export default function Chat() {
  const { user, threads, sendMessage } = useStore();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const myThreads = user ? threads.filter((t) => t.userEmail === user.email) : [];
  const active = myThreads.find((t) => t.id === activeId) ?? myThreads[0] ?? null;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [active?.messages.length]);

  if (!user) return <Navigate to="/login" replace />;

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draft.trim() || !active) return;
    sendMessage(active.id, 'user', draft.trim());
    setDraft('');
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-24 pb-6 sm:px-6">
        <Link
          to="/user/dashboard"
          className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-primary transition hover:opacity-70"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <h1 className="font-display mb-5 text-3xl font-bold text-primary">Support Chat</h1>

        <div className="grid gap-5 md:grid-cols-[280px_1fr]">
          {/* Thread list */}
          <aside className="space-y-2">
            <p className="px-1 pb-1 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              Conversations
            </p>
            {myThreads.length === 0 ? (
              <div className="rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-sm">
                <MessageCircle className="mx-auto mb-3 h-8 w-8 text-slate-200" />
                <p className="text-sm font-bold text-primary">No active chat threads yet.</p>
                <p className="mt-1 text-xs font-medium text-slate-500">
                  Chat threads are created automatically when your booking is approved.
                </p>
              </div>
            ) : (
              myThreads.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveId(t.id)}
                  className={`w-full cursor-pointer rounded-2xl border p-4 text-left transition ${
                    active?.id === t.id
                      ? 'border-l-4 border-l-accent border-slate-100 bg-blue-50 shadow-sm'
                      : 'border-slate-100 bg-white hover:bg-slate-50'
                  }`}
                >
                  <p className="text-sm font-bold text-primary">Booking #{t.bookingId}</p>
                  <p className="mt-0.5 truncate text-xs font-medium text-slate-500">
                    {t.messages[t.messages.length - 1]?.text ?? ''}
                  </p>
                </button>
              ))
            )}
          </aside>

          {/* Conversation */}
          <section className="flex h-[60vh] flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
            {!active ? (
              <div className="flex flex-1 items-center justify-center text-sm font-bold text-slate-400">
                Select a conversation to start chatting
              </div>
            ) : (
              <>
                <div className="border-b border-slate-100 px-5 py-3.5">
                  <p className="text-sm font-bold text-primary">Booking #{active.bookingId}</p>
                  <p className="text-[11px] font-medium text-slate-400">
                    ATL Travels support · replies here
                  </p>
                </div>
                <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 px-5 py-4">
                  {active.messages.map((m) => (
                    <div
                      key={m.id}
                      className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm font-medium whitespace-pre-wrap shadow-sm ${
                          m.from === 'user'
                            ? 'rounded-br-md bg-accent text-white'
                            : 'rounded-bl-md bg-white text-primary ring-1 ring-slate-100'
                        }`}
                      >
                        {m.text}
                        <span
                          className={`mt-1 block text-[10px] ${
                            m.from === 'user' ? 'text-white/70' : 'text-slate-400'
                          }`}
                        >
                          {fmtDateTime(m.at)}
                        </span>
                      </div>
                    </div>
                  ))}
                  <div ref={bottomRef} />
                </div>
                <form onSubmit={send} className="flex items-center gap-2 border-t border-slate-100 p-3">
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="Type your message…"
                    className="flex-1 rounded-full border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-900 outline-none focus:border-accent focus:ring-2 focus:ring-orange-100"
                  />
                  <button
                    type="submit"
                    className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-accent text-white transition hover:bg-accent-hover"
                    aria-label="Send message"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
