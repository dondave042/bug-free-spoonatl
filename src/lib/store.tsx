import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  ADMIN_EMAIL,
  ADMIN_USER,
  PAYMENT_IDS,
  SEED_DESTINATIONS,
  SEED_FLIGHTS,
  SEED_MEDIA,
  STORAGE_KEYS as K,
  getPaymentMethod,
} from "./data";
import type {
  Booking,
  BookableItem,
  ChatFrom,
  ChatThread,
  Destination,
  Flight,
  ItemType,
  MediaItem,
  PaymentMethodId,
  Toast,
  TravelerDetails,
  TripRequest,
  User,
} from "./types";
import { bookingId, money, requestId, rid } from "./utils";

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota */
  }
}

function normalizeBookings(raw: unknown): Booking[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((b: Booking) =>
    PAYMENT_IDS.includes(b.paymentMethod) ? b : { ...b, paymentMethod: "zelle" },
  );
}

interface Store {
  user: User | null;
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
  createBooking: (input: {
    itemType: ItemType;
    itemId: number;
    itemName: string;
    unitPrice: number;
    passengers: number;
    total: number;
    paymentMethod: PaymentMethodId;
    traveler: TravelerDetails;
  }) => Booking | null;
  approveBooking: (id: string, instructions: string) => void;
  rejectBooking: (id: string, note?: string) => void;
  threads: ChatThread[];
  chatMedia: Record<string, string>;
  sendMessage: (
    threadId: string,
    from: ChatFrom,
    text: string,
    imageDataUrl?: string,
  ) => void;
  tripRequests: TripRequest[];
  myTripRequests: TripRequest[];
  createTripRequest: (input: {
    destination: string;
    fromCity: string;
    travelers: number;
    checkIn: string;
    checkOut: string;
    budget: string;
    notes: string;
  }) => TripRequest | null;
  quoteTripRequest: (id: string, quote: number, note: string) => void;
  declineTripRequest: (id: string, note?: string) => void;
  toasts: Toast[];
  notify: (msg: string, kind?: Toast["kind"]) => void;
  resetAll: () => void;
}

const Ctx = createContext<Store | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>(() => {
    const list = load<User[]>(K.users, []);
    const withAdmin = list.some((u) => u.email === ADMIN_USER.email)
      ? list
      : [ADMIN_USER, ...list];
    return withAdmin.map((u) =>
      u.email === ADMIN_USER.email ? { ...u, password: ADMIN_USER.password } : u,
    );
  });
  const [session, setSession] = useState(() => load<string>(K.session, ""));
  const [destinations, setDestinations] = useState(() =>
    load(K.destinations, SEED_DESTINATIONS),
  );
  const [flights, setFlights] = useState(() => load(K.flights, SEED_FLIGHTS));
  const [media, setMedia] = useState(() => load(K.media, SEED_MEDIA));
  const [bookings, setBookings] = useState(() =>
    normalizeBookings(load(K.bookings, [])),
  );
  const [threads, setThreads] = useState<ChatThread[]>(() => {
    const list = load<ChatThread[]>(K.threads, []);
    let migrated = false;
    const mediaMap = load<Record<string, string>>(K.chatMedia, {});
    const next = list.map((t) => ({
      ...t,
      messages: t.messages.map((m) => {
        const img = (m as ChatThread["messages"][number] & { image?: string })
          .image;
        if (img && !m.imageId) {
          const id = rid();
          mediaMap[id] = img;
          migrated = true;
          const { image: _drop, ...rest } = m as typeof m & { image?: string };
          void _drop;
          return { ...rest, imageId: id };
        }
        return m;
      }),
    }));
    if (migrated) save(K.chatMedia, mediaMap);
    return next;
  });
  const [requests, setRequests] = useState<TripRequest[]>(() =>
    load<TripRequest[]>(K.requests, []).filter((r) =>
      ["pending", "approved", "rejected"].includes(r.status),
    ),
  );
  const [chatMedia, setChatMedia] = useState<Record<string, string>>(() =>
    load(K.chatMedia, {}),
  );
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastSeq = useRef(0);

  useEffect(() => save(K.users, users), [users]);
  useEffect(() => save(K.session, session), [session]);
  useEffect(() => save(K.destinations, destinations), [destinations]);
  useEffect(() => save(K.flights, flights), [flights]);
  useEffect(() => save(K.media, media), [media]);
  useEffect(() => save(K.bookings, bookings), [bookings]);
  useEffect(() => save(K.threads, threads), [threads]);
  useEffect(() => save(K.requests, requests), [requests]);
  useEffect(() => save(K.chatMedia, chatMedia), [chatMedia]);

  const notify = useCallback((msg: string, kind: Toast["kind"] = "ok") => {
    const id = ++toastSeq.current;
    setToasts((t) => [...t, { id, msg, kind }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  }, []);

  const user = useMemo(
    () => users.find((u) => u.email === session) ?? null,
    [users, session],
  );
  const isAdmin = user?.email === ADMIN_EMAIL;

  const signIn = useCallback(
    (email: string, password: string) => {
      const found = users.find(
        (u) =>
          u.email.toLowerCase() === email.trim().toLowerCase() &&
          u.password === password,
      );
      if (!found) return "Invalid email or password";
      setSession(found.email);
      return null;
    },
    [users],
  );

  const signUp = useCallback(
    (name: string, email: string, password: string) => {
      const ae = email.trim().toLowerCase();
      if (users.some((u) => u.email.toLowerCase() === ae))
        return "This email is already registered. Please sign in instead.";
      if (password.length < 6)
        return "Password is too weak. Please use a stronger password.";
      const nu: User = {
        name: name.trim(),
        email: ae,
        password,
        phone: "",
        createdAt: Date.now(),
      };
      setUsers((u) => [...u, nu]);
      return null;
    },
    [users],
  );

  const signOut = useCallback(() => setSession(""), []);

  const googleDemoSignIn = useCallback(() => {
    const email = "google.traveler@gmail.com";
    setUsers((list) =>
      list.some((u) => u.email === email)
        ? list
        : [
            ...list,
            {
              name: "Google Traveler",
              email,
              password: "google-oauth-demo",
              phone: "",
              createdAt: Date.now(),
            },
          ],
    );
    setSession(email);
  }, []);

  const updateProfile = useCallback(
    (name: string, phone: string) => {
      if (!user) return;
      setUsers((list) =>
        list.map((u) => (u.email === user.email ? { ...u, name, phone } : u)),
      );
      notify("Profile saved");
    },
    [user, notify],
  );

  const saveDestination = useCallback(
    (d: Destination) => {
      setDestinations((list) =>
        list.some((x) => x.id === d.id)
          ? list.map((x) => (x.id === d.id ? d : x))
          : [...list, d],
      );
      notify("Destination saved");
    },
    [notify],
  );

  const deleteDestination = useCallback(
    (id: number) => {
      setDestinations((list) => list.filter((x) => x.id !== id));
      notify("Destination deleted");
    },
    [notify],
  );

  const saveFlight = useCallback(
    (f: Flight) => {
      setFlights((list) =>
        list.some((x) => x.id === f.id)
          ? list.map((x) => (x.id === f.id ? f : x))
          : [...list, f],
      );
      notify("Flight saved");
    },
    [notify],
  );

  const deleteFlight = useCallback(
    (id: number) => {
      setFlights((list) => list.filter((x) => x.id !== id));
      notify("Flight deleted");
    },
    [notify],
  );

  const addMedia = useCallback((items: MediaItem[]) => {
    setMedia((list) => [...items, ...list]);
  }, []);

  const deleteMedia = useCallback(
    (id: string) => {
      setMedia((list) => list.filter((x) => x.id !== id));
      notify("Media deleted");
    },
    [notify],
  );

  const createBooking = useCallback(
    (input: {
      itemType: ItemType;
      itemId: number;
      itemName: string;
      unitPrice: number;
      passengers: number;
      total: number;
      paymentMethod: PaymentMethodId;
      traveler: TravelerDetails;
    }) => {
      if (!user) return null;
      const b: Booking = {
        ...input,
        id: bookingId(),
        createdAt: Date.now(),
        userEmail: user.email,
        bookedBy: user.name,
        status: "pending",
        paymentInstructions: "",
      };
      setBookings((list) => [b, ...list]);
      return b;
    },
    [user],
  );

  const approveBooking = useCallback(
    (id: string, instructions: string) => {
      setBookings((list) =>
        list.map((b) =>
          b.id === id
            ? { ...b, status: "approved", paymentInstructions: instructions }
            : b,
        ),
      );
      setBookings((list) => {
        const b = list.find((x) => x.id === id);
        if (b) {
          setThreads((ts) =>
            ts.some((t) => t.bookingId === id)
              ? ts
              : [
                  {
                    id: rid(),
                    bookingId: id,
                    userEmail: b.userEmail,
                    userName: b.bookedBy,
                    createdAt: Date.now(),
                    messages: [
                      {
                        id: rid(),
                        from: "admin",
                        text: `Your booking #${id} for "${b.itemName}" has been approved. Total due: ${money(b.total)} via ${getPaymentMethod(b.paymentMethod).name}.

Payment instructions:
${instructions}

Reply here once payment is sent and we will confirm your reservation.`,
                        at: Date.now(),
                      },
                    ],
                  },
                  ...ts,
                ],
          );
        }
        return list;
      });
      notify(`Booking #${id} approved — payment details sent to traveler`);
    },
    [notify],
  );

  const rejectBooking = useCallback(
    (id: string, note?: string) => {
      setBookings((list) =>
        list.map((b) =>
          b.id === id
            ? {
                ...b,
                status: "rejected",
                paymentInstructions: note || "Booking rejected by admin",
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

  const sendMessage = useCallback(
    (threadId: string, from: ChatFrom, text: string, imageDataUrl?: string) => {
      const imageId = imageDataUrl ? rid() : undefined;
      if (imageDataUrl && imageId) {
        setChatMedia((m) => ({ ...m, [imageId]: imageDataUrl }));
      }
      setThreads((list) =>
        list.map((t) =>
          t.id === threadId
            ? {
                ...t,
                messages: [
                  ...t.messages,
                  {
                    id: rid(),
                    from,
                    text,
                    ...(imageId ? { imageId } : {}),
                    at: Date.now(),
                  },
                ],
              }
            : t,
        ),
      );
    },
    [],
  );

  const createTripRequest = useCallback(
    (input: {
      destination: string;
      fromCity: string;
      travelers: number;
      checkIn: string;
      checkOut: string;
      budget: string;
      notes: string;
    }) => {
      if (!user) return null;
      const req: TripRequest = {
        ...input,
        id: requestId(),
        createdAt: Date.now(),
        userEmail: user.email,
        userName: user.name,
        status: "pending",
        quote: 0,
        adminNote: "",
      };
      setRequests((list) => [req, ...list]);
      return req;
    },
    [user],
  );

  const quoteTripRequest = useCallback(
    (id: string, quote: number, note: string) => {
      setRequests((list) =>
        list.map((r) =>
          r.id === id ? { ...r, status: "approved", quote, adminNote: note } : r,
        ),
      );
      notify(`Request #${id} approved — quote sent to traveler`);
    },
    [notify],
  );

  const declineTripRequest = useCallback(
    (id: string, note?: string) => {
      setRequests((list) =>
        list.map((r) =>
          r.id === id
            ? {
                ...r,
                status: "rejected",
                adminNote: note || "Not available for the selected dates.",
              }
            : r,
        ),
      );
      notify(`Request #${id} declined`);
    },
    [notify],
  );

  const myTripRequests = useMemo(
    () => (user ? requests.filter((r) => r.userEmail === user.email) : []),
    [requests, user],
  );

  const resetAll = useCallback(() => {
    setDestinations(SEED_DESTINATIONS);
    setFlights(SEED_FLIGHTS);
    setMedia(SEED_MEDIA);
    setBookings([]);
    setThreads([]);
    setRequests([]);
    setChatMedia({});
    setUsers((list) => list.filter((u) => u.email === ADMIN_EMAIL));
    notify("Demo data reset");
  }, [notify]);

  const value: Store = {
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
    chatMedia,
    sendMessage,
    tripRequests: requests,
    myTripRequests,
    createTripRequest,
    quoteTripRequest,
    declineTripRequest,
    toasts,
    notify,
    resetAll,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore must be used inside AppProvider");
  return s;
}

export type { BookableItem };