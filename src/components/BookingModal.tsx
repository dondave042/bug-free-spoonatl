import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Info,
  Minus,
  Plus,
  X,
} from 'lucide-react';
import { useStore } from '../lib/store';
import { PAYMENT_METHODS, fmt } from '../lib/data';
import type { PaymentMethodId, TravelerDetails } from '../lib/types';
import { MethodIcon } from './ui';

export interface BookableItem {
  id: number;
  name: string;
  price: number;
}

const EMPTY: TravelerDetails = {
  fullName: '',
  dob: '',
  phone: '',
  passport: '',
  country: '',
  state: '',
  address: '',
  reason: '',
  emergencyName: '',
  emergencyPhone: '',
  notes: '',
};

const REASONS = [
  'Vacation / Leisure',
  'Business Trip',
  'Family Visit',
  'Medical Treatment',
  'Education / Study',
];

const inputCls =
  'w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-900 placeholder:font-medium placeholder:text-slate-300 outline-none transition focus:border-accent focus:ring-2 focus:ring-orange-100';

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="mb-2 block text-xs font-bold text-slate-500 uppercase">{children}</span>
  );
}

export default function BookingModal({
  open,
  onClose,
  item,
  itemType,
  defaultGuests = 1,
}: {
  open: boolean;
  onClose: () => void;
  item: BookableItem | null;
  itemType: 'flight' | 'destination';
  defaultGuests?: number;
}) {
  const { user, createBooking, notify } = useStore();
  const [step, setStep] = useState(1);
  const [passengers, setPassengers] = useState(1);
  const [form, setForm] = useState<TravelerDetails>(EMPTY);
  const [errors, setErrors] = useState<string[]>([]);
  const [method, setMethod] = useState<PaymentMethodId | ''>('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [lastId, setLastId] = useState('');

  const total = useMemo(
    () => (item ? item.price * passengers : 0),
    [item, passengers],
  );

  const set = (k: keyof TravelerDetails) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  const close = () => {
    onClose();
    window.setTimeout(() => {
      setStep(1);
      setErrors([]);
      setMethod('');
      setDone(false);
      setForm(EMPTY);
      setPassengers(defaultGuests || 1);
    }, 250);
  };

  const nextStep = () => {
    const errs: string[] = [];
    if (!form.fullName.trim()) errs.push('Full name is required');
    if (!form.dob) errs.push('Date of birth is required');
    if (!form.phone.trim()) errs.push('Phone number is required');
    if (!form.country.trim()) errs.push('Country is required');
    if (!form.state.trim()) errs.push('State is required');
    if (!form.address.trim()) errs.push('Address is required');
    if (!form.reason) errs.push('Reason for trip is required');
    if (!form.emergencyName.trim()) errs.push('Emergency contact name is required');
    if (!form.emergencyPhone.trim()) errs.push('Emergency contact phone is required');
    setErrors(errs);
    if (errs.length === 0) setStep(2);
  };

  const submit = () => {
    if (!method) {
      setErrors(['Please select a payment method']);
      return;
    }
    if (!user) {
      notify('Please login to book', 'error');
      return;
    }
    if (!item) return;
    setBusy(true);
    window.setTimeout(() => {
      try {
        const booking = createBooking({
          itemType,
          itemId: item.id,
          itemName: item.name,
          unitPrice: item.price,
          passengers,
          total,
          paymentMethod: method as PaymentMethodId,
          traveler: form,
        });
        setBusy(false);
        if (booking) {
          setLastId(booking.id);
          setDone(true);
        } else {
          notify('Please login to book', 'error');
        }
      } catch (err) {
        setBusy(false);
        notify(`Booking error: ${err instanceof Error ? err.message : 'An error occurred. Please try again.'}`, 'error');
      }
    }, 700);
  };

  return (
    <AnimatePresence>
      {open && item && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-end justify-center bg-primary/60 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={close}
        >
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-[2rem] bg-white shadow-2xl sm:rounded-[2rem]"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-primary px-6 py-5 text-white sm:rounded-t-[2rem]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold tracking-[0.18em] text-accent uppercase">
                    {itemType === 'flight' ? 'Flight booking' : 'Package booking'}
                  </p>
                  <h3 className="font-display mt-1 text-xl font-bold sm:text-2xl">
                    {done ? 'Booking Submitted!' : 'Complete Your Booking'}
                  </h3>
                  <p className="mt-0.5 text-xs font-medium text-white/60">{item.name}</p>
                </div>
                <button
                  type="button"
                  onClick={close}
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-white/70 transition hover:bg-white/10 hover:text-white"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              {!done && (
                <div className="mt-4 flex items-center gap-2">
                  {[1, 2].map((s) => (
                    <div key={s} className="flex items-center gap-2">
                      <span
                        className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                          step >= s ? 'bg-accent text-white' : 'bg-slate-700 text-slate-400'
                        }`}
                      >
                        {s}
                      </span>
                      <span
                        className={`text-[11px] font-bold tracking-wide uppercase ${
                          step >= s ? 'text-white' : 'text-slate-400'
                        }`}
                      >
                        {s === 1 ? 'Traveler Details' : 'Payment Method'}
                      </span>
                      {s === 1 && <span className="mx-2 h-px w-8 bg-white/20" />}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {done ? (
              /* ---------- success ---------- */
              <div className="px-6 py-12 text-center sm:px-10">
                <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-500" />
                <h4 className="font-display mt-5 text-2xl font-bold text-primary">
                  Booking Submitted!
                </h4>
                <p className="mt-2 text-sm font-medium text-slate-500">
                  Your booking has been received.
                </p>
                <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed font-medium text-slate-600">
                  Your booking <span className="font-bold text-primary">#{lastId}</span> confirmation
                  is <span className="font-bold text-amber-600">pending review</span>. An admin will
                  review and approve it shortly, then send you the exact payment instructions for
                  your selected method.
                </p>
                <button
                  type="button"
                  onClick={close}
                  className="mt-6 w-full cursor-pointer rounded-xl bg-primary py-3 font-bold text-white transition hover:bg-primary/90"
                >
                  Got it
                </button>
              </div>
            ) : (
              <div className="px-6 py-6 sm:px-8">
                {errors.length > 0 && (
                  <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                    {errors.map((e) => (
                      <p key={e} className="text-xs font-bold text-red-700">{e}</p>
                    ))}
                  </div>
                )}

                {step === 1 && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block sm:col-span-2">
                      <Label>Full Name *</Label>
                      <input className={inputCls} value={form.fullName} onChange={set('fullName')} placeholder={user?.name || 'Jane Traveler'} />
                    </label>
                    <label className="block">
                      <Label>Date of Birth *</Label>
                      <input type="date" className={inputCls} value={form.dob} onChange={set('dob')} />
                    </label>
                    <label className="block">
                      <Label>Phone *</Label>
                      <input className={inputCls} value={form.phone} onChange={set('phone')} placeholder="+1 555 000 1234" />
                    </label>
                    <label className="block">
                      <Label>Passport Number</Label>
                      <input className={inputCls} value={form.passport} onChange={set('passport')} placeholder="Optional for domestic trips" />
                    </label>
                    <div className="block rounded-xl border border-slate-200 px-4 py-2.5">
                      <Label>Passengers</Label>
                      <div className="flex items-center justify-between">
                        <button type="button" onClick={() => setPassengers((p) => Math.max(1, p - 1))} className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white font-bold text-slate-700 transition hover:bg-slate-50" aria-label="Fewer passengers">
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="text-lg font-bold">{passengers}</span>
                        <button type="button" onClick={() => setPassengers((p) => Math.min(10, p + 1))} className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white font-bold text-slate-700 transition hover:bg-slate-50" aria-label="More passengers">
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <label className="block">
                      <Label>Country *</Label>
                      <input className={inputCls} value={form.country} onChange={set('country')} placeholder="United States" />
                    </label>
                    <label className="block">
                      <Label>State/Province *</Label>
                      <input className={inputCls} value={form.state} onChange={set('state')} placeholder="Florida" />
                    </label>
                    <label className="block sm:col-span-2">
                      <Label>Full Address *</Label>
                      <input className={inputCls} value={form.address} onChange={set('address')} placeholder="123 Ocean Drive, Miami Beach, FL 33139" />
                    </label>
                    <label className="block sm:col-span-2">
                      <Label>Reason for Trip *</Label>
                      <select
                        className={`${inputCls} ${form.reason ? 'text-slate-900' : 'text-slate-300 font-medium'}`}
                        value={form.reason}
                        onChange={set('reason')}
                      >
                        <option value="" className="font-medium text-slate-300">Select a reason...</option>
                        {REASONS.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </label>
                    <div className="sm:col-span-2 mt-1 rounded-2xl bg-orange-50 p-4">
                      <p className="mb-3 text-xs font-bold tracking-wide text-orange-700 uppercase">
                        Emergency Contact *
                      </p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <input className={inputCls} value={form.emergencyName} onChange={set('emergencyName')} placeholder="Contact name" />
                        <input className={inputCls} value={form.emergencyPhone} onChange={set('emergencyPhone')} placeholder="Contact phone" />
                      </div>
                    </div>
                    <label className="block sm:col-span-2">
                      <Label>Special Requests / Notes</Label>
                      <textarea
                        className={`${inputCls} resize-none`}
                        rows={3}
                        value={form.notes}
                        onChange={set('notes')}
                        placeholder="Dietary restrictions, accessibility needs, preferred seating, etc."
                      />
                    </label>
                  </div>
                )}

                {step === 2 && (
                  <div>
                    <p className="mb-3 flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">
                      Select Preferred Payment Method *
                    </p>
                    <div className="space-y-2.5">
                      {PAYMENT_METHODS.map((m) => {
                        const selected = method === m.id;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => {
                              setMethod(m.id);
                              setErrors([]);
                            }}
                            className={`flex w-full cursor-pointer items-center gap-4 rounded-2xl border p-4 text-left transition ${
                              selected
                                ? 'border-accent bg-orange-50 shadow-md'
                                : 'border-slate-200 bg-white hover:border-slate-300'
                            }`}
                          >
                            <span
                              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition ${
                                selected ? 'bg-accent text-white' : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              <MethodIcon id={m.id} className="h-5 w-5" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="flex flex-wrap items-center gap-2">
                                <span className="text-sm font-bold text-primary">{m.name}</span>
                                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide uppercase ${selected ? 'bg-accent/15 text-accent' : 'bg-slate-100 text-slate-500'}`}>
                                  {m.badge}
                                </span>
                                {m.id === 'paypal' && (
                                  <span className="rounded-full bg-[#003087] px-2 py-0.5 text-[10px] font-bold tracking-wide text-white uppercase">
                                    New
                                  </span>
                                )}
                              </span>
                              <span className="mt-0.5 block text-xs font-medium text-slate-500">{m.desc}</span>
                            </span>
                            <span
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ${
                                selected ? 'border-accent bg-accent text-white' : 'border-slate-300'
                              }`}
                            >
                              {selected && <BadgeCheck className="h-3.5 w-3.5" />}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-4 flex gap-3 rounded-xl bg-blue-50 p-4">
                      <Info className="h-5 w-5 shrink-0 text-blue-600" />
                      <p className="text-xs leading-relaxed font-medium text-blue-800">
                        <span className="font-bold">How payment works:</span> Upon submitting your
                        booking, an ATL Travels admin will review your details and provide the exact
                        payment handle / account instructions for your selected method.
                      </p>
                    </div>

                    <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                      <span className="text-xs font-bold text-slate-500 uppercase">Total Price</span>
                      <span className="text-right">
                        <span className="font-display text-xl font-bold text-primary">
                          {item.price > 0 ? fmt(total) : 'On Request'}
                        </span>
                        <span className="block text-[11px] font-medium text-slate-500">
                          {item.price > 0
                            ? `${passengers} passenger${passengers !== 1 ? 's' : ''} × ${fmt(item.price)}`
                            : 'Price confirmed by your travel agent'}
                        </span>
                      </span>
                    </div>
                  </div>
                )}

                {/* Footer buttons */}
                <div className="mt-6 flex items-center justify-between gap-3 border-t border-slate-100 pt-5">
                  {step === 2 ? (
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-slate-400">
                      {item.price > 0 ? `${fmt(item.price)} / person` : 'Price on request'}
                    </span>
                  )}
                  {step === 1 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="flex cursor-pointer items-center gap-2 rounded-xl bg-accent px-6 py-2.5 text-sm font-bold text-white shadow-lg transition hover:bg-accent-hover"
                    >
                      Next
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={submit}
                      disabled={busy}
                      className="flex cursor-pointer items-center gap-2 rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg transition hover:bg-emerald-600 disabled:opacity-50"
                    >
                      {busy ? 'Submitting...' : 'Confirm Booking'}
                      {!busy && <BadgeCheck className="h-4 w-4" />}
                    </button>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
