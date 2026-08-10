import { Bitcoin, Building2, DollarSign, Landmark, Mail } from 'lucide-react';
import type { BookingStatus, PaymentMethodId } from '../lib/types';
import { methodMeta } from '../lib/data';

/** PayPal brand mark (Font Awesome glyph, viewBox 0 0 384 512). */
export function PayPalMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 384 512" fill="currentColor" className={className} aria-label="PayPal">
      <path d="M111.4 295.9c-3.5 19.2-17.4 108.7-21.5 134-.3 1.8-1 2.5-3 2.5H12.3c-7.6 0-13.1-6.6-12.1-13.9L58.8 46.6c1.5-9.6 10.1-16.9 20-16.9 152.3 0 165.1-3.7 204 11.4 60.1 23.3 65.6 79.5 44 140.3-21.5 62.6-72.5 89.5-140.1 90.3-43.4.8-61.4-6.3-75.3 24.2zM357.1 152c-1.8-1.3-2.5-1.8-3 1.3-2 11.4-5.1 22.5-8.8 33.6-39.9 113.8-150.5 103.9-204.5 103.9-6.1 0-10.1 3.3-10.9 9.4-22.6 140.4-27.1 169.7-27.1 169.7-1 7.1 3.5 12.9 10.6 12.9h63.5c8.6 0 15.9-6.5 17-15.1.3-1.8.8-3.5.8-5.3l7.6-48.5c1.5-9.6 10.1-16.9 20-16.9 12.7 0 61.2 2.7 99.1-41.3 46.4-53.8 20.9-111.7 15.2-123z" />
    </svg>
  );
}

export function MethodIcon({ id, className }: { id: PaymentMethodId; className?: string }) {
  switch (id) {
    case 'cashapp':
      return <DollarSign className={className} />;
    case 'venmo':
      return <Mail className={className} />;
    case 'zelle':
      return <Landmark className={className} />;
    case 'cryptocurrency':
      return <Bitcoin className={className} />;
    case 'bank_transfer':
      return <Building2 className={className} />;
    case 'paypal':
      return <PayPalMark className={className} />;
  }
}

const METHOD_CHIP: Record<PaymentMethodId, string> = {
  cashapp: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  venmo: 'bg-blue-50 text-blue-700 border border-blue-200',
  zelle: 'bg-purple-50 text-purple-700 border border-purple-200',
  cryptocurrency: 'bg-amber-50 text-amber-700 border border-amber-200',
  bank_transfer: 'bg-slate-100 text-slate-700 border border-slate-300',
  paypal: 'bg-[#E8F0FB] text-[#003087] border border-[#B9CFF0]',
};

export function MethodBadge({ id, size = 'md' }: { id: PaymentMethodId; size?: 'sm' | 'md' }) {
  const m = methodMeta(id);
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg font-bold ${
        METHOD_CHIP[id]
      } ${size === 'sm' ? 'px-2 py-1 text-[11px]' : 'px-3 py-1.5 text-xs'}`}
    >
      <MethodIcon id={id} className={size === 'sm' ? 'h-3 w-3' : 'h-3.5 w-3.5'} />
      {m.name}
    </span>
  );
}

const STATUS_CHIP: Record<BookingStatus, string> = {
  pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  approved: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  rejected: 'bg-red-50 text-red-700 border border-red-200',
};

export function StatusBadge({ status }: { status: BookingStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold capitalize ${STATUS_CHIP[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

export function SectionHeading({
  title,
  sub,
  center = false,
}: {
  title: string;
  sub: string;
  center?: boolean;
}) {
  return (
    <div className={`mb-12 ${center ? 'text-center' : ''}`}>
      <h2 className="font-display text-4xl font-bold text-primary sm:text-5xl">{title}</h2>
      <p className="mt-2 text-base font-bold text-primary/70">{sub}</p>
    </div>
  );
}
