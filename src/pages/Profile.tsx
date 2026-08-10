import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { ArrowLeft, User } from 'lucide-react';
import Header from '../components/Header';
import { useStore } from '../lib/store';

export default function Profile() {
  const { user, updateProfile } = useStore();
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');

  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <Header />
      <main className="mx-auto max-w-2xl px-4 pt-28 sm:px-6">
        <Link
          to="/user/dashboard"
          className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-primary transition hover:opacity-70"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <div className="rounded-[2rem] bg-white p-8 shadow-xl shadow-slate-200/60 ring-1 ring-slate-100">
          <div className="mb-7 flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent">
              <User className="h-7 w-7" />
            </span>
            <div>
              <h1 className="font-display text-3xl font-bold text-primary">Your Profile</h1>
              <p className="text-sm font-medium text-slate-500">{user.email}</p>
            </div>
          </div>

          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              updateProfile(name.trim() || user.name, phone.trim());
            }}
          >
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-primary">Full Name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm font-bold text-slate-900 outline-none focus:border-accent focus:ring-2 focus:ring-orange-100"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-primary">Email Address</span>
              <input
                value={user.email}
                disabled
                className="w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm font-bold text-slate-400 outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-bold text-primary">Phone Number</span>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555 000 1234"
                className="w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm font-bold text-slate-900 outline-none focus:border-accent focus:ring-2 focus:ring-orange-100"
              />
            </label>
            <button
              type="submit"
              className="w-full cursor-pointer rounded-full bg-accent py-3.5 font-bold text-white shadow-lg shadow-orange-500/20 transition hover:bg-accent-hover"
            >
              Save Profile
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
