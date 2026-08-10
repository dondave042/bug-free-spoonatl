import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useStore } from '../lib/store';
import { ADMIN_EMAIL } from '../lib/data';

export default function AdminLoginModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { signIn, notify } = useStore();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    window.setTimeout(() => {
      const err = signIn(email, password);
      setBusy(false);
      if (err) {
        setError(err);
        return;
      }
      if (email.trim().toLowerCase() !== ADMIN_EMAIL) {
        setError('This account does not have admin privileges.');
        return;
      }
      onClose();
      notify('Welcome back, admin');
      navigate('/admin/dashboard');
    }, 500);
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
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 font-medium text-gray-900 outline-none focus:border-accent focus:ring-2 focus:ring-orange-200"
              />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full rounded-lg border border-gray-300 px-4 py-3 font-medium text-gray-900 outline-none focus:border-accent focus:ring-2 focus:ring-orange-200"
              />
              {error && (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={busy}
                className="w-full cursor-pointer rounded-lg bg-accent py-3 font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
