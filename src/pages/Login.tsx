import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, Mail } from "lucide-react";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { useStore } from "../lib/store";
import { FIELD_LG } from "../lib/utils";

export function Login() {
  const { signIn, signUp, notify } = useStore();
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
