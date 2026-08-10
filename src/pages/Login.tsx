import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Eye, EyeOff, Mail } from 'lucide-react';
import { useStore } from '../lib/store';

export default function Login() {
  const { signIn, signUp, googleDemoSignIn, notify } = useStore();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'in' | 'up'>('in');
  const [showPw, setShowPw] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNotice('');
    setBusy(true);
    window.setTimeout(() => {
      if (mode === 'up') {
        if (!form.name.trim()) {
          setError('Full name is required');
          setBusy(false);
          return;
        }
        const err = signUp(form.name, form.email, form.password);
        setBusy(false);
        if (err) return setError(err);
        setNotice('Account created! Please sign in.');
        setMode('in');
        return;
      }
      const err = signIn(form.email, form.password);
      setBusy(false);
      if (err) return setError(err);
      notify(`Welcome back, ${form.email.split('@')[0]}`);
      navigate('/user/dashboard');
    }, 600);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-primary transition hover:text-accent"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>

        <div className="rounded-[2rem] bg-white p-8 shadow-xl shadow-slate-200/60 ring-1 ring-slate-100">
          <div className="mb-7 text-center">
            <img
              src="/logo.png"
              alt="ATL Travels logo"
              className="mx-auto mb-4 h-16 w-16 rounded-2xl object-cover shadow-lg ring-1 ring-slate-100"
            />
            <h1 className="font-display text-3xl font-bold text-primary">
              {mode === 'in' ? 'Welcome back' : 'Create Account'}
            </h1>
            <p className="mt-1 text-sm font-medium text-slate-500">
              {mode === 'in' ? 'Sign in to ATL Travels' : 'Join ATL Travels today'}
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === 'up' && (
              <label className="block">
                <span className="mb-2 block text-sm font-bold text-primary">Full Name</span>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Jane Traveler"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 text-sm font-bold text-slate-900 outline-none focus:border-accent focus:ring-2 focus:ring-orange-100"
                />
              </label>
            )}
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-primary">Email Address</span>
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
              <span className="mb-2 block text-sm font-bold text-primary">Password</span>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 pr-12 text-sm font-bold text-slate-900 outline-none focus:border-accent focus:ring-2 focus:ring-orange-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute top-3.5 right-4 cursor-pointer text-slate-500 hover:text-slate-900"
                  aria-label="Toggle password visibility"
                >
                  {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </label>

            {error && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700">
                {error}
              </p>
            )}
            {notice && (
              <p className="rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-sm font-bold text-green-700">
                {notice}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full cursor-pointer rounded-2xl bg-slate-900 py-3.5 text-base font-bold text-white shadow-lg transition-colors hover:bg-slate-800 disabled:opacity-50"
            >
              {busy ? (mode === 'in' ? 'Signing in...' : 'Creating account...') : mode === 'in' ? 'Sign in' : 'Sign up'}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-bold text-slate-400 uppercase">Or continue with</span>
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <button
            type="button"
            onClick={() => {
              googleDemoSignIn();
              notify('Signed in with Google (demo)');
              navigate('/user/dashboard');
            }}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-slate-300 py-3.5 text-base font-bold text-slate-800 transition-colors hover:bg-slate-50"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.1a7.16 7.16 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
            </svg>
            Sign in with Google
          </button>

          <p className="mt-6 text-center text-sm font-medium text-slate-500">
            {mode === 'in' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'in' ? 'up' : 'in');
                setError('');
                setNotice('');
              }}
              className="cursor-pointer font-bold text-accent hover:text-accent-hover"
            >
              {mode === 'in' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
