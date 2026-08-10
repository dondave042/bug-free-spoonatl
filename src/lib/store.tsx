import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { ReactNode } from 'react';
import type {
  Booking,
  BookingStatus,
  ChatThread,
  Destination,
  Flight,
  MediaItem,
  PaymentMethodId,
  ToastMsg,
  TravelerDetails,
  UserAccount,
} from './types';
import {
  ADMIN_EMAIL,
  PAYMENT_METHOD_IDS,
  SEED_ADMIN,
  SEED_DESTINATIONS,
  SEED_FLIGHTS,
  SEED_MEDIA,
  fmt,
  methodMeta,
} from './data';

const K = {
  users: 'atl.users.v1',
  session: 'atl.session.v1',
  bookings: 'atl.bookings.v1',
  destinations: 'atl.destinations.v1',
  flights: 'atl.flights.v1',
  media: 'atl.media.v1',
  threads: 'atl.threads.v1',
};

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function persist(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota exceeded — ignore in standalone mode */
  }
}

const uid = () => Math.random().toString(36).slice(2, 10);
const newBookingId = () => 'ATL-' + Math.floor(1000 + Math.random() * 9000);

/** Ensure stored data never references a payment method that no longer exists. */
function sanitizeBookings(bookings: Booking[]): Booking[] {
  if (!Array.isArray(bookings)) return [];
  return bookings.map((b) =>
    (PAYMENT_METHOD_IDS as string[]).includes(b.paymentMethod)
      ? b
      : { ...b, paymentMethod: 'zelle' as const },
  );
}

interface StoreCtx {
  user: UserAccount | null;
  isAdmin: boolean;
  signIn: (email: string, password: string) => string | null;
  signUp: (name: string, email: string, password: string) => string | null;
  googleDemoSignIn: () => void;
  signOut: () => void;
  updateProfile: (name: string, phone: string) => void;

  destinations: Destination[];
  flights: Flight[];
  media: MediaItem[];
  saveDestination: (d: Destination) => void;
  deleteDestination: (id: number) => void;
  saveFlight: (f: Flight) => void;
  deleteFlight: (id: number) => void;
  addMedia: (items: MediaItem[]) => void;
  deleteMedia: (id: string) => void;

  bookings: Booking[];
  myBookings: Booking[];
  createBooking: (
    input: Omit<Booking, 'id' | 'createdAt' | 'userEmail' | 'bookedBy' | 'status' | 'paymentInstructions'>,
  ) => Booking | null;
  approveBooking: (id: string, instructions: string) => void;
  rejectBooking: (id: string, note: string) => void;

  threads: ChatThread[];
  sendMessage: (threadId: string, from: 'user' | 'admin', text: string) => void;

  toasts: ToastMsg[];
  notify: (msg: string, kind?: 'ok' | 'error') => void;
  resetAll: () => void;
}

const Ctx = createContext<StoreCtx | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<UserAccount[]>(() => {
    const stored = load<UserAccount[]>(K.users, []);
    // make sure the admin account always exists with current credentials
    const hasAdmin = stored.some((u) => u.email === SEED_ADMIN.email);
    const list = hasAdmin ? stored : [SEED_ADMIN, ...stored];
    return list.map((u) =>
      u.email === SEED_ADMIN.email ? { ...u, password: SEED_ADMIN.password } : u,
    );
  });
  const [sessionEmail, setSessionEmail] = useState<string>(() => load(K.session, ''));
  const [destinations, setDestinations] = useState<Destination[]>(() =>
    load(K.destinations, SEED_DESTINATIONS),
  );
  const [flights, setFlights] = useState<Flight[]>(() => load(K.flights, SEED_FLIGHTS));
  const [media, setMedia] = useState<MediaItem[]>(() => load(K.media, SEED_MEDIA));
  const [bookings, setBookings] = useState<Booking[]>(() =>
    sanitizeBookings(load(K.bookings, [])),
  );
  const [threads, setThreads] = useState<ChatThread[]>(() => load(K.threads, []));
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const toastId = useRef(0);

  useEffect(() => persist(K.users, users), [users]);
  useEffect(() => persist(K.session, sessionEmail), [sessionEmail]);
  useEffect(() => persist(K.destinations, destinations), [destinations]);
  useEffect(() => persist(K.flights, flights), [flights]);
  useEffect(() => persist(K.media, media), [media]);
  useEffect(() => persist(K.bookings, bookings), [bookings]);
  useEffect(() => persist(K.threads, threads), [threads]);

  const notify = useCallback((msg: string, kind: 'ok' | 'error' = 'ok') => {
    const id = ++toastId.current;
    setToasts((t) => [...t, { id, msg, kind }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  const user = useMemo(
    () => users.find((u) => u.email === sessionEmail) ?? null,
    [users, sessionEmail],
  );
  const isAdmin = user?.email === ADMIN_EMAIL;

  const signIn = useCallback(
    (email: string, password: string): string | null => {
      const match = users.find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password,
      );
      if (!match) return 'Invalid email or password';
      setSessionEmail(match.email);
      return null;
    },
    [users],
  );

  const signUp = useCallback(
    (name: string, email: string, password: string): string | null => {
      const clean = email.trim().toLowerCase();
      if (users.some((u) => u.email.toLowerCase() === clean))
        return 'This email is already registered. Please sign in instead.';
      if (password.length < 6) return 'Password is too weak. Please use a stronger password.';
      const account: UserAccount = {
        name: name.trim(),
        email: clean,
        password,
        phone: '',
        createdAt: Date.now(),
      };
      setUsers((u) => [...u, account]);
      return null;
    },
    [users],
  );

  const signOut = useCallback(() => setSessionEmail(''), []);

  /** Stands in for Google OAuth in this standalone copy (no OAuth backend wired). */
  const googleDemoSignIn = useCallback(() => {
    const email = 'google.traveler@gmail.com';
    setUsers((us) => {
      if (us.some((u) => u.email === email)) return us;
      return [
        ...us,
        { name: 'Google Traveler', email, password: 'google-oauth-demo', phone: '', createdAt: Date.now() },
      ];
    });
    setSessionEmail(email);
  }, []);

  const updateProfile = useCallback(
    (name: string, phone: string) => {
      if (!user) return;
      setUsers((us) => us.map((u) => (u.email === user.email ? { ...u, name, phone } : u)));
      notify('Profile saved');
    },
    [user, notify],
  );

  /* ---------- catalog CRUD ---------- */

  const saveDestination = useCallback(
    (d: Destination) => {
      setDestinations((list) => {
        const exists = list.some((x) => x.id === d.id);
        return exists ? list.map((x) => (x.id === d.id ? d : x)) : [...list, d];
      });
      notify('Destination saved');
    },
    [notify],
  );

  const deleteDestination = useCallback(
    (id: number) => {
      setDestinations((list) => list.filter((x) => x.id !== id));
      notify('Destination deleted');
    },
    [notify],
  );

  const saveFlight = useCallback(
    (f: Flight) => {
      setFlights((list) => {
        const exists = list.some((x) => x.id === f.id);
        return exists ? list.map((x) => (x.id === f.id ? f : x)) : [...list, f];
      });
      notify('Flight saved');
    },
    [notify],
  );

  const deleteFlight = useCallback(
    (id: number) => {
      setFlights((list) => list.filter((x) => x.id !== id));
      notify('Flight deleted');
    },
    [notify],
  );

  const addMedia = useCallback((items: MediaItem[]) => {
    setMedia((m) => [...items, ...m]);
  }, []);

  const deleteMedia = useCallback(
    (id: string) => {
      setMedia((m) => m.filter((x) => x.id !== id));
      notify('Media deleted');
    },
    [notify],
  );

  /* ---------- bookings ---------- */

  const createBooking: StoreCtx['createBooking'] = useCallback(
    (input) => {
      if (!user) return null;
      const booking: Booking = {
        ...input,
        id: newBookingId(),
        createdAt: Date.now(),
        userEmail: user.email,
        bookedBy: user.name,
        status: 'pending',
        paymentInstructions: '',
      };
      setBookings((b) => [booking, ...b]);
      return booking;
    },
    [user],
  );

  const approveBooking = useCallback(
    (id: string, instructions: string) => {
      setBookings((bs) =>
        bs.map((b) =>
          b.id === id ? { ...b, status: 'approved' as const, paymentInstructions: instructions } : b,
        ),
      );
      // create a support chat thread for this booking, seeded with the payment instructions
      setBookings((current) => {
        const booking = current.find((b) => b.id === id);
        if (booking) {
          setThreads((ts) => {
            if (ts.some((t) => t.bookingId === id)) return ts;
            const thread: ChatThread = {
              id: uid(),
              bookingId: id,
              userEmail: booking.userEmail,
              userName: booking.bookedBy,
              createdAt: Date.now(),
              messages: [
                {
                  id: uid(),
                  from: 'admin',
                  text: `Your booking #${id} for "${booking.itemName}" has been approved. Total due: ${fmt(
                    booking.total,
                  )} via ${methodMeta(booking.paymentMethod).name}.\n\nPayment instructions:\n${instructions}\n\nReply here once payment is sent and we will confirm your reservation.`,
                  at: Date.now(),
                },
              ],
            };
            return [thread, ...ts];
          });
        }
        return current;
      });
      notify(`Booking #${id} approved — payment details sent to traveler`);
    },
    [notify],
  );

  const rejectBooking = useCallback(
    (id: string, note: string) => {
      setBookings((bs) =>
        bs.map((b) =>
          b.id === id
            ? {
                ...b,
                status: 'rejected' as const,
                paymentInstructions: note || 'Booking rejected by admin',
              }
            : b,
        ),
      );
      notify(`Booking #${id} rejected`);
    },
    [notify],
  );

  const myBookings = useMemo(
    () => (user ? bookings.filter((b) => b.userEmail === user.email) : []),
    [bookings, user],
  );

  /* ---------- chat ---------- */

  const sendMessage = useCallback(
    (threadId: string, from: 'user' | 'admin', text: string) => {
      setThreads((ts) =>
        ts.map((t) =>
          t.id === threadId
            ? { ...t, messages: [...t.messages, { id: uid(), from, text, at: Date.now() }] }
            : t,
        ),
      );
    },
    [],
  );

  const resetAll = useCallback(() => {
    setDestinations(SEED_DESTINATIONS);
    setFlights(SEED_FLIGHTS);
    setMedia(SEED_MEDIA);
    setBookings([]);
    setThreads([]);
    setUsers((us) => us.filter((u) => u.email === ADMIN_EMAIL));
    notify('Demo data reset');
  }, [notify]);

  const value: StoreCtx = {
    user,
    isAdmin,
    signIn,
    signUp,
    googleDemoSignIn,
    signOut,
    updateProfile,
    destinations,
    flights,
    media,
    saveDestination,
    deleteDestination,
    saveFlight,
    deleteFlight,
    addMedia,
    deleteMedia,
    bookings,
    myBookings,
    createBooking,
    approveBooking,
    rejectBooking,
    threads,
    sendMessage,
    toasts,
    notify,
    resetAll,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): StoreCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useStore must be used inside AppProvider');
  return ctx;
}

export type { TravelerDetails, PaymentMethodId, BookingStatus };
