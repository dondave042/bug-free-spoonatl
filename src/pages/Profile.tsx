import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { ChevronLeft, User } from "lucide-react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { useStore } from "../lib/store";
import { FIELD } from "../lib/utils";

export function Profile() {
  const { user, authCheckComplete, updateProfile } = useStore();
  const [draft, setDraft] = useState<{ email: string; name: string; phone: string } | null>(null);
  const form = user && draft?.email === user.email
    ? draft
    : { email: user?.email ?? "", name: user?.name ?? "", phone: user?.phone ?? "" };

  if (!authCheckComplete) return <div className="grid min-h-screen place-items-center text-sm text-slate-500" role="status">Checking your session…</div>;
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Header />
      <main className="mx-auto max-w-2xl px-4 pt-28 sm:px-6">
        <Link
          to="/user/dashboard"
          className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-primary transition hover:opacity-70"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
        <div className="rounded-[2rem] bg-white p-8 shadow-xl shadow-slate-200/60 ring-1 ring-slate-100">
          <div className="mb-7 flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent">
              <User className="h-7 w-7" />
            </span>
            <div>
              <h1 className="font-display text-3xl font-bold text-primary">
                Your Profile
              </h1>
              <p className="text-sm font-medium text-slate-500">{user.email}</p>
            </div>
          </div>
          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              void updateProfile(form.name.trim() || user.name, form.phone.trim());
            }}
          >
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-primary">
                Full Name
              </span>
              <input
                value={form.name}
                onChange={(e) => setDraft({ ...form, email: user.email, name: e.target.value })}
                className={FIELD}
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-primary">
                Phone
              </span>
              <input
                value={form.phone}
                onChange={(e) => setDraft({ ...form, email: user.email, phone: e.target.value })}
                className={FIELD}
                placeholder="+1 …"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-primary">
                Email
              </span>
              <input value={user.email} disabled className={FIELD + " bg-slate-50"} />
            </label>
            <button
              type="submit"
              className="cursor-pointer rounded-full bg-accent px-8 py-3 text-sm font-bold text-white"
            >
              Save changes
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
