import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  Minus,
  Plus,
  X,
} from "lucide-react";
import { useStore } from "../lib/store";
import { EMPTY_TRAVELER, PAYMENT_METHODS, TRIP_REASONS } from "../lib/data";
import type { BookableItem, ItemType, PaymentMethodId, TravelerDetails } from "../lib/types";
import { FIELD, money } from "../lib/utils";

export function BookingModal({
  open,
  onClose,
  item,
  itemType,
}: {
  open: boolean;
  onClose: () => void;
  item: BookableItem | null;
  itemType: ItemType;
}) {
  const { user, createBooking, notify } = useStore();
  const [step, setStep] = useState(1);
  const [passengers, setPassengers] = useState(1);
  const [traveler, setTraveler] = useState<TravelerDetails>(EMPTY_TRAVELER);
  const [errors, setErrors] = useState<string[]>([]);
  const [method, setMethod] = useState<PaymentMethodId>("zelle");
  const [busy, setBusy] = useState(false);
  const [doneId, setDoneId] = useState<string | null>(null);

  const total = useMemo(
    () => (item ? item.price * passengers : 0),
    [item, passengers],
  );

  const reset = () => {
    setStep(1);
    setPassengers(1);
    setTraveler(EMPTY_TRAVELER);
    setErrors([]);
    setMethod("zelle");
    setBusy(false);
    setDoneId(null);
  };

  const close = () => {
    reset();
    onClose();
  };

  const patch = (p: Partial<TravelerDetails>) =>
    setTraveler((t) => ({ ...t, ...p }));

  const validate = () => {
    const e: string[] = [];
    if (!traveler.fullName.trim()) e.push("Full name is required");
    if (!traveler.dob) e.push("Date of birth is required");
    if (!traveler.phone.trim()) e.push("Phone is required");
    if (!traveler.country.trim()) e.push("Country is required");
    if (!traveler.state.trim()) e.push("State/Province is required");
    if (!traveler.address.trim()) e.push("Address is required");
    if (!traveler.reason) e.push("Reason for trip is required");
    if (!traveler.emergencyName.trim() || !traveler.emergencyPhone.trim())
      e.push("Emergency contact is required");
    if (traveler.checkIn && traveler.checkOut && traveler.checkOut < traveler.checkIn)
      e.push("Check-out must be after check-in");
    setErrors(e);
    return e.length === 0;
  };

  const submit = async () => {
    if (!item || !user) return;
    if (!validate()) {
      setStep(1);
      return;
    }
    setBusy(true);
    try {
      const b = await createBooking({
        itemType,
        itemId: item.id,
        itemName: item.name,
        unitPrice: item.price,
        passengers,
        total,
        paymentMethod: method,
        traveler,
      });
      if (b) setDoneId(b.id);
      else notify("Could not create booking", "error");
    } catch (err) {
      notify(
        `Booking error: ${err instanceof Error ? err.message : "Unknown"}`,
        "error",
      );
    } finally {
      setBusy(false);
    }
  };

  if (!open || !item) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={close}
        className="fixed inset-0 z-[70] flex items-end justify-center bg-primary/60 backdrop-blur-sm sm:items-center sm:p-4"
      >
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-[2rem] bg-white shadow-2xl sm:rounded-[2rem]"
        >
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white/95 px-6 py-4 backdrop-blur">
            <div>
              <p className="text-[11px] font-bold tracking-wider text-accent uppercase">
                {itemType === "flight" ? "Flight booking" : "Package booking"}
              </p>
              <h3 className="font-display text-xl font-bold text-primary">
                {doneId ? "Booking Submitted!" : "Complete Your Booking"}
              </h3>
            </div>
            <button
              type="button"
              onClick={close}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-slate-400 hover:bg-slate-100"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="px-6 py-6">
            {doneId ? (
              <div className="py-6 text-center">
                <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-500" />
                <h4 className="font-display mt-4 text-2xl font-bold text-primary">
                  Your booking has been received.
                </h4>
                <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed font-medium text-slate-500">
                  Your booking <span className="font-bold text-primary">#{doneId}</span>{" "}
                  for <span className="font-bold text-primary">{item.name}</span>. An
                  admin will review and approve it shortly, then send you the exact
                  payment instructions for your selected method.
                </p>
                <button
                  type="button"
                  onClick={close}
                  className="mt-7 cursor-pointer rounded-full bg-primary px-8 py-3 text-sm font-bold text-white"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="mb-6 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <div>
                    <p className="text-sm font-bold text-primary">{item.name}</p>
                    <p className="text-xs font-medium text-slate-500">
                      {money(item.price)} per traveler
                    </p>
                  </div>
                  <p className="font-display text-2xl font-bold text-accent">
                    {money(total)}
                  </p>
                </div>

                <div className="mb-5 flex gap-2">
                  {["Traveler Details", "Payment Method"].map((label, i) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => setStep(i + 1)}
                      className={`flex-1 cursor-pointer rounded-full py-2 text-xs font-bold ${
                        step === i + 1
                          ? "bg-primary text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {i + 1}. {label}
                    </button>
                  ))}
                </div>

                {errors.length > 0 && (
                  <ul className="mb-4 space-y-1 rounded-xl bg-red-50 px-4 py-3 text-xs font-bold text-red-600">
                    {errors.map((e) => (
                      <li key={e}>{e}</li>
                    ))}
                  </ul>
                )}

                {step === 1 && (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Full Name *">
                      <input
                        className={FIELD}
                        value={traveler.fullName}
                        onChange={(e) => patch({ fullName: e.target.value })}
                        placeholder="As on passport"
                      />
                    </Field>
                    <Field label="Date of Birth *">
                      <input
                        type="date"
                        className={FIELD}
                        value={traveler.dob}
                        onChange={(e) => patch({ dob: e.target.value })}
                      />
                    </Field>
                    <Field label="Phone *">
                      <input
                        className={FIELD}
                        value={traveler.phone}
                        onChange={(e) => patch({ phone: e.target.value })}
                        placeholder="+1 555 000 0000"
                      />
                    </Field>
                    <Field label="Passport Number">
                      <input
                        className={FIELD}
                        value={traveler.passport}
                        onChange={(e) => patch({ passport: e.target.value })}
                      />
                    </Field>
                    <Field label="Check-in Date">
                      <input
                        type="date"
                        className={FIELD}
                        value={traveler.checkIn}
                        onChange={(e) => patch({ checkIn: e.target.value })}
                      />
                    </Field>
                    <Field label="Check-out Date">
                      <input
                        type="date"
                        className={FIELD}
                        value={traveler.checkOut}
                        onChange={(e) => patch({ checkOut: e.target.value })}
                      />
                    </Field>
                    <div className="sm:col-span-2">
                      <span className="mb-2 block text-sm font-bold text-primary">
                        Travelers
                      </span>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          aria-label="Fewer passengers"
                          onClick={() => setPassengers((n) => Math.max(1, n - 1))}
                          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-slate-200"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="w-8 text-center text-lg font-bold">
                          {passengers}
                        </span>
                        <button
                          type="button"
                          aria-label="More passengers"
                          onClick={() => setPassengers((n) => Math.min(12, n + 1))}
                          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-slate-200"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <Field label="Country *">
                      <input
                        className={FIELD}
                        value={traveler.country}
                        onChange={(e) => patch({ country: e.target.value })}
                      />
                    </Field>
                    <Field label="State/Province *">
                      <input
                        className={FIELD}
                        value={traveler.state}
                        onChange={(e) => patch({ state: e.target.value })}
                      />
                    </Field>
                    <div className="sm:col-span-2">
                      <Field label="Full Address *">
                        <input
                          className={FIELD}
                          value={traveler.address}
                          onChange={(e) => patch({ address: e.target.value })}
                        />
                      </Field>
                    </div>
                    <div className="sm:col-span-2">
                      <Field label="Reason for Trip *">
                        <select
                          className={FIELD}
                          value={traveler.reason}
                          onChange={(e) => patch({ reason: e.target.value })}
                        >
                          <option value="">Select a reason</option>
                          {TRIP_REASONS.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </div>
                    <Field label="Emergency Contact *">
                      <input
                        className={FIELD}
                        value={traveler.emergencyName}
                        onChange={(e) => patch({ emergencyName: e.target.value })}
                        placeholder="Name"
                      />
                    </Field>
                    <Field label="Emergency Phone *">
                      <input
                        className={FIELD}
                        value={traveler.emergencyPhone}
                        onChange={(e) => patch({ emergencyPhone: e.target.value })}
                        placeholder="Phone"
                      />
                    </Field>
                    <div className="sm:col-span-2">
                      <Field label="Notes">
                        <textarea
                          className={FIELD + " min-h-20"}
                          value={traveler.notes}
                          onChange={(e) => patch({ notes: e.target.value })}
                          placeholder="Dietary needs, special requests…"
                        />
                      </Field>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-3">
                    {PAYMENT_METHODS.map((m) => (
                      <label
                        key={m.id}
                        className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${
                          method === m.id
                            ? "border-accent bg-orange-50/50 ring-2 ring-accent/20"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <input
                          type="radio"
                          name="pay"
                          checked={method === m.id}
                          onChange={() => setMethod(m.id)}
                          className="mt-1 accent-accent"
                        />
                        <div>
                          <p className="text-sm font-bold text-primary">
                            {m.name}{" "}
                            <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold tracking-wide text-slate-500 uppercase">
                              {m.badge}
                            </span>
                          </p>
                          <p className="mt-0.5 text-xs font-medium text-slate-500">
                            {m.desc}
                          </p>
                        </div>
                      </label>
                    ))}
                    <p className="rounded-xl bg-slate-50 px-4 py-3 text-xs leading-relaxed font-medium text-slate-500">
                      Upon submitting your booking, an ATL Travels admin will review
                      your details and provide the exact payment handle / account
                      instructions for your selected method.
                    </p>
                  </div>
                )}

                <div className="mt-6 flex items-center justify-between gap-3">
                  {step === 2 ? (
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
                    >
                      Back
                    </button>
                  ) : (
                    <span />
                  )}
                  {step === 1 ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (validate()) setStep(2);
                      }}
                      className="cursor-pointer rounded-full bg-primary px-7 py-2.5 text-sm font-bold text-white"
                    >
                      Continue
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={submit}
                      className="cursor-pointer rounded-full bg-accent px-7 py-2.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 disabled:opacity-60"
                    >
                      {busy ? "Submitting…" : "Confirm Booking"}
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold text-primary">{label}</span>
      {children}
    </label>
  );
}
