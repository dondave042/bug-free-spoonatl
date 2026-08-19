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
import { supabase } from "./supabase";

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
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (name: string, email: string, password: string) => Promise<string | null>;
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
  }) => Promise<Booking | null>;
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

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    void supabase.auth.getUser().then(({ data }) => {
      if (active && data.user?.email) setSession(data.user.email);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, authSession) => {
      if (authSession?.user?.email) setSession(authSession.user.email);
      else setSession("");
    });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, []);

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

  const user = useMemo(() => {
    if (!session) return null;
    return users.find((u) => u.email.toLowerCase() === session.toLowerCase()) ?? {
      name: session.split("@")[0] || "Traveler",
      email: session.toLowerCase(),
      password: "",
      phone: "",
      createdAt: Date.now(),
    };
  }, [users, session]);
  const isAdmin =
    session.trim().toLowerCase() === ADMIN_EMAIL.trim().toLowerCase() ||
    user?.email.trim().toLowerCase() === ADMIN_EMAIL.trim().toLowerCase();

  useEffect(() => {
    if (!supabase || !user) return;
    void supabase.from("bookings").select("id, user_id, destination, travelers, status, notes, created_at").order("created_at", { ascending: false }).then(({ data }) => {
      if (!data) return;
      const remote = data.flatMap((row) => {
        try { return [JSON.parse(row.notes ?? "{}")] as Booking[]; } catch { return []; }
      });
      setBookings((local) => normalizeBookings([...remote, ...local.filter((item) => !remote.some((remoteItem) => remoteItem.id === item.id))]));
    });
  }, [user, isAdmin]);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) return "Supabase is not configured";
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    if (error || !data.user) return "Invalid email or password";
    setSession(data.user.email ?? email.trim().toLowerCase());
    return null;
  }, []);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    if (password.length < 6) return "Password is too weak. Please use a stronger password.";
    if (!supabase) return "Supabase is not configured";
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: { full_name: name.trim() },
        emailRedirectTo: `${window.location.origin}/login`,
      },
    });
    if (error) {
      if (error.message.toLowerCase().includes("already") || error.message.toLowerCase().includes("registered")) return "This email is already registered. Please sign in instead.";
      return error.message;
    }
    if (data.session?.user?.email) setSession(data.session.user.email);
    return null;
  }, []);

  const signOut = useCallback(() => {
    void supabase?.auth.signOut();
    setSession("");
  }, []);

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
    async (input: {
      itemType: ItemType;
      itemId: number;
      itemName: string;
      unitPrice: number;
      passengers: number;
      total: number;
      paymentMethod: PaymentMethodId;
      traveler: TravelerDetails;
    }) => {
      if (!user || !supabase) return null;
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) return null;
      const booking = { ...input, id: bookingId(), createdAt: Date.now(), userEmail: user.email, bookedBy: user.name, status: "pending" as const, paymentInstructions: "" };
      const { error } = await supabase.from("bookings").insert({
        id: booking.id,
        user_id: authData.user.id,
        destination: input.itemName,
        travel_date: new Date().toISOString().slice(0, 10),
        travelers: input.passengers,
        notes: JSON.stringify(booking),
      });
      if (error) { notify("Could not create booking", "error"); return null; }
      setBookings((list) => [booking, ...list]);
      return booking;
    },
    [user, notify],
  );

  const approveBooking = useCallback(
    (id: string, instructions: string) => {
      const db = supabase;
      if (db) void db.from("bookings").select("notes").eq("id", id).maybeSingle().then(({ data }) => {
        if (!data) return;
        try { const current = JSON.parse(data.notes ?? "{}"); void db.from("bookings").update({ status: "approved", notes: JSON.stringify({ ...current, status: "approved", paymentInstructions: instructions }) }).eq("id", id); } catch { /* preserve local fallback */ }
      });
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
      const db = supabase;
      if (db) void db.from("bookings").select("notes").eq("id", id).maybeSingle().then(({ data }) => {
        if (!data) return;
        try { const current = JSON.parse(data.notes ?? "{}"); void db.from("bookings").update({ status: "rejected", notes: JSON.stringify({ ...current, status: "rejected", paymentInstructions: note || "Booking rejected by admin" }) }).eq("id", id); } catch { /* preserve local fallback */ }
      });
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
