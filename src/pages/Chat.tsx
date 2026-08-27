import { useEffect, useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { ChevronLeft, ImagePlus, MessageCircle, Send } from "lucide-react";
import { Header } from "../components/Header";
import { useStore } from "../lib/store";
import { formatDateTime, readFileAsDataUrl } from "../lib/utils";

export function Chat() {
  const { user, threads, chatMedia, sendMessage, uploadReceipt, notify } = useStore();
  const [active, setActive] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const mine = user ? threads.filter((t) => t.userEmail === user.email) : [];
  const thread = mine.find((t) => t.id === active) ?? mine[0] ?? null;
  const showingThread = !!active && !!thread;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread?.messages.length]);

  if (!user) return <Navigate to="/login" replace />;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!text.trim() && !preview) || !thread) return;
    sendMessage(thread.id, "user", text.trim(), preview ?? undefined);
    setText("");
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      notify("Only image files are supported in chat", "error");
      return;
    }
    setUploading(true);
  try {
  if (thread) await uploadReceipt(thread.bookingId, f);
  setPreview(await readFileAsDataUrl(f));
    } catch (err) {
      notify(err instanceof Error ? err.message : "Upload failed", "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Header />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pt-24 pb-6 sm:px-6">
        <Link
          to="/user/dashboard"
          className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-primary transition hover:opacity-70"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <h1 className="font-display mb-5 text-3xl font-bold text-primary">
          Support Chat
        </h1>
        <div className="grid gap-5 md:grid-cols-[280px_1fr]">
          <aside className={`space-y-2 ${showingThread ? "hidden md:block" : ""}`}>
            <p className="px-1 pb-1 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              Conversations
            </p>
            {mine.length === 0 ? (
              <div className="rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-sm">
                <MessageCircle className="mx-auto mb-3 h-8 w-8 text-slate-200" />
                <p className="text-sm font-bold text-primary">
                  No active chat threads yet.
                </p>
                <p className="mt-1 text-xs font-medium text-slate-400">
                  Chat threads are created automatically when your booking is
                  approved.
                </p>
              </div>
            ) : (
              mine.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActive(t.id)}
                  className={`w-full cursor-pointer rounded-2xl border px-4 py-3 text-left transition ${
                    thread?.id === t.id
                      ? "border-accent bg-orange-50"
                      : "border-slate-100 bg-white hover:border-slate-200"
                  }`}
                >
                  <p className="text-sm font-bold text-primary">
                    Booking #{t.bookingId}
                  </p>
                  <p className="truncate text-xs font-medium text-slate-400">
                    {t.messages.at(-1)?.text || "ATL Travels support · replies here"}
                  </p>
                </button>
              ))
            )}
          </aside>

          <section className="flex min-h-[60vh] flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
            {!thread ? (
              <div className="m-auto p-8 text-center text-sm font-medium text-slate-400">
                Select a conversation to start chatting.
              </div>
            ) : (
              <>
                <div className="border-b border-slate-100 px-5 py-4">
                  <p className="text-sm font-bold text-primary">
                    Booking #{thread.bookingId}
                  </p>
                  <p className="text-xs font-medium text-slate-400">
                    ATL Travels support · replies here
                  </p>
                </div>
                <div className="flex-1 space-y-3 overflow-y-auto p-5">
                  {thread.messages.map((m) => (
                    <div
                      key={m.id}
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm font-medium ${
                        m.from === "user"
                          ? "ml-auto bg-accent text-white"
                          : "bg-slate-100 text-primary"
                      }`}
                    >
                      {m.imageId && chatMedia[m.imageId] && (
                        <img
                          src={chatMedia[m.imageId]}
                          alt=""
                          className="mb-2 max-h-48 rounded-xl"
                        />
                      )}
                      {m.text && <p className="whitespace-pre-wrap">{m.text}</p>}
                      <p
                        className={`mt-1 text-[10px] ${m.from === "user" ? "text-white/70" : "text-slate-400"}`}
                      >
                        {formatDateTime(m.at)}
                      </p>
                    </div>
                  ))}
                  <div ref={endRef} />
                </div>
                <form
                  onSubmit={submit}
                  className="flex items-end gap-2 border-t border-slate-100 p-3"
                >
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onFile}
                  />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-slate-400 hover:bg-slate-100"
                    aria-label="Attach image"
                  >
                    <ImagePlus className="h-5 w-5" />
                  </button>
                  <div className="flex-1">
                    {preview && (
                      <div className="mb-2 flex items-center gap-2">
                        <img src={preview} alt="" className="h-12 rounded-lg" />
                        <button
                          type="button"
                          onClick={() => setPreview(null)}
                          className="text-xs font-bold text-red-500"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                    <input
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder={uploading ? "Uploading…" : "Type a message…"}
                      className="w-full rounded-full border border-slate-200 px-4 py-2.5 text-sm font-medium outline-none focus:border-accent"
                    />
                  </div>
                  <button
                    type="submit"
                    className="flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-accent text-white"
                    aria-label="Send"
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
