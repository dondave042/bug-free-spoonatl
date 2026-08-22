import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "../lib/store";

export function AdminLoginModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { signIn, isAdmin, notify } = useStore();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const err = await signIn(email, password);
    setBusy(false);
    if (err) {
      setError(err);
      return;
    }
    if (!isAdmin) {
      setError("This account does not have admin privileges.");
      return;
    }
    onClose();
    notify("Welcome back, admin");
    nav("/admin/dashboard");
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-primary/60 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.94, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.94, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 cursor-pointer text-gray-400 transition hover:text-gray-600"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="mb-6 text-center">
              <img
                src="/logo.png"
                alt="ATL Travels logo"
                className="mx-auto mb-4 h-16 w-16 rounded-2xl object-cover shadow-md ring-1 ring-slate-100"
              />
              <h3 className="text-2xl font-bold text-primary">Admin Access</h3>
              <p className="mt-1 text-sm font-medium text-slate-500">
                Enter your credentials to access the admin dashboard
              </p>
            </div>
            <form onSubmit={submit} className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-primary">
                  Email
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@email.com"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 text-sm font-bold text-slate-900 outline-none focus:border-accent focus:ring-2 focus:ring-orange-100"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-primary">
                  Password
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 text-sm font-bold text-slate-900 outline-none focus:border-accent focus:ring-2 focus:ring-orange-100"
                />
              </label>
              {error && (
                <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-600">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={busy}
                className="w-full cursor-pointer rounded-full bg-accent py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition hover:bg-accent-hover disabled:opacity-60"
              >
                {busy ? "Signing in..." : "Sign In"}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
