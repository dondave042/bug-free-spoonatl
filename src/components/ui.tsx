import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import type { ReactNode } from "react";

export function SectionTitle({
  title,
  sub,
  center = false,
}: {
  title: string;
  sub?: string;
  center?: boolean;
}) {
  return (
    <div className={`mb-12 ${center ? "text-center" : ""}`}>
      <h2 className="font-display text-4xl font-bold text-primary sm:text-5xl">
        {title}
      </h2>
      {sub && (
        <p className="mt-2 text-base font-bold text-primary/70">{sub}</p>
      )}
    </div>
  );
}

export function ModalShell({
  children,
  onClose,
  title,
  wide,
}: {
  children: ReactNode;
  onClose: () => void;
  title: string;
  wide?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[70] flex items-end justify-center bg-primary/60 backdrop-blur-sm sm:items-center sm:p-4"
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className={`max-h-[90vh] w-full overflow-y-auto rounded-t-[2rem] bg-white shadow-2xl sm:rounded-[2rem] ${wide ? "max-w-3xl" : "max-w-xl"}`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-7 py-5">
          <h3 className="font-display text-2xl font-bold text-primary">
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-7 py-6">{children}</div>
      </motion.div>
    </motion.div>
  );
}

export function Overlay({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose?: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-primary/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      {children}
    </motion.div>
  );
}

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    rejected: "bg-red-50 text-red-700 border-red-200",
  };
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-0.5 text-[11px] font-bold tracking-wide uppercase ${map[status] ?? "bg-slate-50 text-slate-600 border-slate-200"}`}
    >
      {status}
    </span>
  );
}

export { AnimatePresence, motion };