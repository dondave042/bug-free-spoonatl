import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Mail } from "lucide-react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { useStore } from "../lib/store";
import { FIELD_LG } from "../lib/utils";

export function Login() {
  const { signIn, signUp, googleDemoSignIn, notify } = useStore();
  const nav = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    if (mode === "in") {
      const err = await signIn(form.email, form.password);
      if (err) {
        setError(err);
        return;
      }
      notify("Welcome back");
      nav("/user/dashboard");
    } else {
      const err = await signUp(form.name, form.email, form.password);
      if (err) {
        setError(err);
        return;
      }
      setInfo("Account created. Check your email to confirm your account, then sign in.");
      setMode("in");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="mx-auto flex max-w-md flex-col px-4 pt-32 pb-20">
        <div className="rounded-[2rem] bg-white p-8 shadow-xl shadow-slate-200/60 ring-1 ring-slate-100">
          <div className="mb-6 text-center">
            <img
              src="/logo.png"
              alt="ATL Travels logo"
              className="mx-auto mb-4 h-16 w-16 rounded-2xl object-cover shadow-md"
            />
            <h1 className="font-display text-3xl font-bold text-primary">
              {mode === "in" ? "Welcome back" : "Create Account"}
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-500">
              {mode === "in" ? "Sign in to ATL Travels" : "Join ATL Travels today"}
            </p>
          </div>
          <form onSubmit={submit} className="space-y-4">
            {mode === "up" && (
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-primary">
                  Full Name
                </span>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Jane Traveler"
                  className={FIELD_LG}
                />
              </label>
            )}
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-primary">
                Email Address
              </span>
              <div className="relative">
                <Mail className="absolute top-3.5 left-4 h-5 w-5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full rounded-2xl border border-slate-200 py-3.5 pr-4 pl-12 text-sm font-bold text-slate-900 outline-none focus:border-accent focus:ring-2 focus:ring-orange-100"
                />
              </div>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-primary">
                Password
              </span>
              <div className="relative">
                <Lock className="absolute top-3.5 left-4 h-5 w-5 text-slate-400" />
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-slate-200 py-3.5 pr-4 pl-12 text-sm font-bold text-slate-900 outline-none focus:border-accent focus:ring-2 focus:ring-orange-100"
                />
              </div>
            </label>
            {error && (
              <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-600">
                {error}
              </p>
            )}
            {info && (
              <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-700">
                {info}
              </p>
            )}
            <button
              type="submit"
              className="w-full cursor-pointer rounded-full bg-accent py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition hover:bg-accent-hover"
            >
              {mode === "in" ? "Sign in" : "Create account"}
            </button>
          </form>
          <button
            type="button"
            onClick={() => {
              googleDemoSignIn();
              notify("Signed in with Google (demo)");
              nav("/user/dashboard");
            }}
            className="mt-3 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-slate-200 py-3 text-sm font-bold text-primary hover:bg-slate-50"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>
          <p className="mt-5 text-center text-sm font-medium text-slate-500">
            {mode === "in" ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => {
                setMode(mode === "in" ? "up" : "in");
                setError("");
                setInfo("");
              }}
              className="cursor-pointer font-bold text-accent hover:text-accent-hover"
            >
              {mode === "in" ? "Sign up" : "Sign in"}
            </button>
          </p>
          <p className="mt-4 text-center">
            <Link
              to="/"
              className="text-xs font-bold text-slate-400 hover:text-primary"
            >
              Back to Home
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
