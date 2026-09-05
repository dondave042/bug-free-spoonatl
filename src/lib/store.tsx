/* eslint-disable react-refresh/only-export-components */
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
  PAYMENT_IDS,
  SEED_DESTINATIONS,
  SEED_FLIGHTS,
  SEED_MEDIA,
  getPaymentMethod,
} from "./data";
import type {
  Booking,
  BookableItem,
  ChatFrom,
  ChatMessage,
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
import { money, requestId, rid } from "./utils";
import { supabase } from "./supabase";

function normalizeBookings(raw: unknown): Booking[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((b: Booking) =>
    PAYMENT_IDS.includes(b.paymentMethod) ? b : { ...b, paymentMethod: "zelle" },
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function bookingFromRow(row: Record<string, any>): Booking {
  return {
    id: row.id,
    itemType: row.item_type,
    itemId: row.item_type === "flight" ? row.flight_id : row.destination_id,
    itemName: row.item_name,
    unitPrice: Number(row.unit_price),
    passengers: Number(row.passengers),
    total: Number(row.total_price),
    paymentMethod: row.payment_method,
    traveler: {
      fullName: row.full_name ?? "",
      dob: row.dob ?? "",
      phone: row.phone ?? "",
      passport: row.passport ?? "",
      country: row.country ?? "",
      state: row.state ?? "",
      address: row.address ?? "",
      reason: row.reason ?? "",
      emergencyName: row.emergency_name ?? "",
      emergencyPhone: row.emergency_phone ?? "",
      notes: row.special_requests ?? "",
      checkIn: "",
      checkOut: "",
    },
    userEmail: row.user_id,
    bookedBy: row.full_name ?? "Traveler",
    status: row.status ?? "pending",
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
    paymentInstructions: row.payment_instructions ?? "",
    paymentStatus: row.payment_status ?? "unpaid",
    paymentAmount: row.payment_amount == null ? undefined : Number(row.payment_amount),
    paymentReference: row.payment_reference ?? "",
    paymentUpdatedAt: row.payment_updated_at ? new Date(row.payment_updated_at).getTime() : undefined,
  };
}

interface Store {
  user: User | null;
  isAdmin: boolean;
  adminCheckComplete: boolean;
  users: User[];
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (name: string, email: string, password: string) => Promise<string | null>;
  signOut: () => void;
  updateProfile: (name: string, phone: string) => void;
  destinations: Destination[];
  flights: Flight[];
  media: MediaItem[];
  saveDestination: (d: Destination) => Promise<boolean>;
  deleteDestination: (id: number) => Promise<boolean>;
  saveFlight: (f: Flight) => Promise<boolean>;
  deleteFlight: (id: number) => Promise<boolean>;
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
  updateBookingPayment: (id: string, input: { instructions: string; amount: number; reference: string; status: "unpaid" | "pending" | "paid" | "failed" }) => Promise<boolean>;
  rejectBooking: (id: string, note?: string) => void;
  threads: ChatThread[];
  chatMedia: Record<string, string>;
  sendMessage: (
    threadId: string,
    from: ChatFrom,
    text: string,
    imageDataUrl?: string,
  ) => void;
  uploadReceipt: (bookingId: string, file: File) => Promise<boolean>;
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
  const [users, setUsers] = useState<User[]>([]);
  const [session, setSession] = useState("");
  const [remoteAdmin, setRemoteAdmin] = useState(false);
  const [adminCheckComplete, setAdminCheckComplete] = useState(false);
  const [destinations, setDestinations] = useState<Destination[]>(SEED_DESTINATIONS);
  const [flights, setFlights] = useState<Flight[]>(SEED_FLIGHTS);
  const [media, setMedia] = useState<MediaItem[]>(SEED_MEDIA);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [requests, setRequests] = useState<TripRequest[]>([]);
  const [chatMedia, setChatMedia] = useState<Record<string, string>>({});
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
      else {
        setSession("");
        setRemoteAdmin(false);
        setAdminCheckComplete(true);
      }
    });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    const db = supabase;
    if (!db) return;
    let active = true;
    const loadCatalog = async () => {
      const [destinationsResult, flightsResult, mediaResult] = await Promise.all([
        db.from("destinations").select("*").order("updated_at", { ascending: false }),
        db.from("flights").select("*").order("updated_at", { ascending: false }),
        db.from("media").select("*").order("created_at", { ascending: false }),
      ]);
      if (!active) return;
      if (!destinationsResult.error && destinationsResult.data?.length) setDestinations(destinationsResult.data.map((row) => ({ ...row, media: Array.isArray(row.media) ? row.media : [] })) as Destination[]);
      if (!flightsResult.error && flightsResult.data?.length) setFlights(flightsResult.data as Flight[]);
      if (!mediaResult.error && mediaResult.data?.length) setMedia(mediaResult.data.map((m) => ({ id: m.id, url: m.file_url, type: m.file_type === "video" ? "video" : "photo", title: m.title ?? m.file_name ?? "", source: m.bucket ?? "media" })));
    };
    void loadCatalog();
    const catalogChannel = db.channel("public-catalog").on("postgres_changes", { event: "*", schema: "public", table: "destinations" }, () => void loadCatalog()).on("postgres_changes", { event: "*", schema: "public", table: "flights" }, () => void loadCatalog()).on("postgres_changes", { event: "*", schema: "public", table: "media" }, () => void loadCatalog()).subscribe();
    return () => { active = false; void db.removeChannel(catalogChannel); };
  }, []);

  useEffect(() => {
    const db = supabase;
    if (!db || !session) {
      return;
    }
    let active = true;
    queueMicrotask(() => setAdminCheckComplete(false));
    const syncAdminData = async () => {
      const { data: authData } = await db.auth.getUser();
      const authUser = authData.user;
      if (!authUser) return;
      const [{ data: adminResult }, { data: ownProfile }] = await Promise.all([
        db.rpc("is_admin"),
        db.from("profiles").select("role").eq("id", authUser.id).maybeSingle(),
      ]);
      // Support both the RPC and the profile role so a stale/misconfigured RPC
      // cannot hide valid admin bookings from the dashboard.
      const adminUser = adminResult === true || ownProfile?.role === "admin";
      if (!adminUser) {
        setRemoteAdmin(false);
        setAdminCheckComplete(true);
        return;
      }
      setRemoteAdmin(true);
      setAdminCheckComplete(true);
      const [profilesResult, bookingsResult, destinationsResult, flightsResult, mediaResult] = await Promise.all([
        db.from("profiles").select("id,email,full_name,phone,role,created_at").order("created_at", { ascending: false }),
        db.from("bookings").select("*").order("created_at", { ascending: false }),
        db.from("destinations").select("*").order("created_at", { ascending: false }),
        db.from("flights").select("*").order("created_at", { ascending: false }),
        db.from("media").select("*").order("created_at", { ascending: false }),
      ]);
      if (!active) return;
      if (!profilesResult.error && profilesResult.data) {
        setUsers(profilesResult.data.map((p) => ({ name: p.full_name ?? p.email?.split("@")[0] ?? "Traveler", email: p.email ?? "", password: "", phone: p.phone ?? "", createdAt: p.created_at ? new Date(p.created_at).getTime() : Date.now() })));
      }
      if (!bookingsResult.error && bookingsResult.data) {
        setBookings(normalizeBookings(bookingsResult.data.map((row) => ({
        id: row.id,
        itemType: row.item_type,
        itemId: row.item_type === "flight" ? row.flight_id : row.destination_id,
        itemName: row.item_name,
        unitPrice: Number(row.unit_price),
        passengers: row.passengers,
        total: Number(row.total_price),
        paymentMethod: row.payment_method,
        traveler: { fullName: row.full_name, dob: row.dob ?? "", phone: row.phone ?? "", passport: row.passport ?? "", country: row.country ?? "", state: row.state ?? "", address: row.address ?? "", reason: row.reason ?? "", emergencyName: row.emergency_name ?? "", emergencyPhone: row.emergency_phone ?? "", notes: row.special_requests ?? "", checkIn: "", checkOut: "" },
        userEmail: row.user_id,
        bookedBy: row.full_name,
        status: row.status,
        createdAt: new Date(row.created_at).getTime(),
        paymentInstructions: row.payment_instructions ?? "",
      } as Booking))));
      }
      if (!destinationsResult.error && destinationsResult.data?.length) setDestinations(destinationsResult.data.map((row) => ({ ...row, media: Array.isArray(row.media) ? row.media : [] })) as Destination[]);
      if (!flightsResult.error && flightsResult.data?.length) setFlights(flightsResult.data as Flight[]);
      if (!mediaResult.error && mediaResult.data) setMedia(mediaResult.data.map((m) => ({ id: m.id, url: m.file_url, type: m.file_type === "video" ? "video" : "photo", title: m.file_name ?? "", source: m.bucket })));
    };
    void syncAdminData();
    const bookingChannel = db
      .channel("admin-booking-inbox")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => {
        void syncAdminData();
      })
      .subscribe();
    return () => {
      active = false;
      void db.removeChannel(bookingChannel);
    };
  }, [session]);

  useEffect(() => {
    const db = supabase;
    if (!db || !session) return;
    let active = true;
    const loadUserBookings = async () => {
      const { data: authData } = await db.auth.getUser();
      if (!authData.user) return;
      const { data, error } = await db.from("bookings").select("*").eq("user_id", authData.user.id).order("created_at", { ascending: false });
      if (!active || error || !data) return;
      setBookings((current) => {
        const adminBookings = current.filter((booking) => booking.userEmail !== authData.user.id);
        return [...normalizeBookings(data.map(bookingFromRow)), ...adminBookings];
      });
    };
    void loadUserBookings();
    const channel = db.channel("user-bookings").on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, () => void loadUserBookings()).subscribe();
    return () => { active = false; void db.removeChannel(channel); };
  }, [session]);

  useEffect(() => {
    const db = supabase;
    if (!db || !session) return;
    let active = true;
    const loadMessages = async () => {
      const { data: authData } = await db.auth.getUser();
      if (!authData.user || !active) return;
      const [{ data: remoteThreads }, { data: remoteMessages }, { data: profiles }] = await Promise.all([
        db.from("chat_threads").select("id,booking_id,user_id,created_at").order("created_at", { ascending: true }),
        db.from("chat_messages").select("id,thread_id,sender_id,is_admin,body,created_at").order("created_at", { ascending: true }),
        db.from("profiles").select("id,email,full_name"),
      ]);
      if (!active || !remoteThreads) return;
      const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
      const mapped = remoteThreads.map((t) => ({
        id: t.id,
        bookingId: t.booking_id,
        userEmail: profileMap.get(t.user_id)?.email ?? "",
        userName: profileMap.get(t.user_id)?.full_name ?? "Traveler",
        createdAt: new Date(t.created_at).getTime(),
        messages: (remoteMessages ?? []).filter((m) => m.thread_id === t.id).map((m) => ({ id: m.id, from: m.is_admin ? "admin" : "user", text: m.body, at: new Date(m.created_at).getTime() } as ChatMessage)),
      }));
      setThreads((current) => {
        const localOnly = current.filter((t) => !mapped.some((remote) => remote.id === t.id));
        return [...mapped, ...localOnly];
      });
    };
    void loadMessages();
    const channel = db.channel("live-support-chat")
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_threads" }, () => void loadMessages())
      .on("postgres_changes", { event: "*", schema: "public", table: "chat_messages" }, () => void loadMessages())
      .subscribe();
    return () => { active = false; void db.removeChannel(channel); };
  }, [session]);

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
      createdAt: 0,
    };
  }, [users, session]);
  const isAdmin = remoteAdmin;

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) return "Supabase is not configured";
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    if (error || !data.user) return "Invalid email or password";
    setAdminCheckComplete(false);
    setRemoteAdmin(false);
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
    async (d: Destination) => {
      if (!isAdmin || !supabase) { notify("Admin access required", "error"); return false; }
      const id = d.id > 0 ? d.id : Math.max(0, ...destinations.map((item) => item.id)) + 1;
      const persisted = { ...d, id };
      const { error } = await supabase.from("destinations").upsert({ id, name: d.name, location: d.location, description: d.description, price: d.price, rating: d.rating, reviews: d.reviews, image: d.image, media: d.media ?? [], updated_at: new Date().toISOString() });
      if (error) { notify("Could not save package", "error"); return false; }
      setDestinations((list) => list.some((x) => x.id === id) ? list.map((x) => x.id === id ? persisted : x) : [persisted, ...list]);
      notify("Package published");
      return true;
    },
    [destinations, isAdmin, notify],
  );

  const deleteDestination = useCallback(
    async (id: number) => {
      if (!isAdmin || !supabase) { notify("Admin access required", "error"); return false; }
      const { error } = await supabase.from("destinations").delete().eq("id", id);
      if (error) { notify("Could not delete package", "error"); return false; }
      setDestinations((list) => list.filter((x) => x.id !== id));
      notify("Package deleted");
      return true;
    },
    [isAdmin, notify],
  );

  const saveFlight = useCallback(
    async (f: Flight) => {
      if (!isAdmin || !supabase) { notify("Admin access required", "error"); return false; }
      const departure = new Date(f.departure_date);
      const arrival = new Date(f.arrival_date);
      const price = Number(f.price);
      const availableSeats = Number(f.available_seats);
      if (!Number.isFinite(price) || !Number.isInteger(availableSeats) || availableSeats < 0 || Number.isNaN(departure.getTime()) || Number.isNaN(arrival.getTime())) { notify("Enter valid flight details", "error"); return false; }
      const id = f.id > 0 ? f.id : Math.max(0, ...flights.map((item) => item.id)) + 1;
      const persisted = { ...f, id, price, available_seats: availableSeats, departure_date: departure.toISOString(), arrival_date: arrival.toISOString() };
      const payload = { ...persisted, updated_at: new Date().toISOString() };
      const { error } = await supabase.from("flights").upsert(payload);
      if (error) { notify("Could not save flight", "error"); return false; }
      setFlights((list) => list.some((x) => x.id === id) ? list.map((x) => x.id === id ? persisted : x) : [persisted, ...list]);
      notify("Flight published");
      return true;
    },
    [flights, isAdmin, notify],
  );

  const deleteFlight = useCallback(
    async (id: number) => {
      if (!isAdmin || !supabase) { notify("Admin access required", "error"); return false; }
      const { error } = await supabase.from("flights").delete().eq("id", id);
      if (error) { notify("Could not delete flight", "error"); return false; }
      setFlights((list) => list.filter((x) => x.id !== id));
      notify("Flight deleted");
      return true;
    },
    [isAdmin, notify],
  );

  const addMedia = useCallback((items: MediaItem[]) => {
    setMedia((list) => [...items, ...list]);
  }, []);

  const deleteMedia = useCallback(
    (id: string) => {
      if (!isAdmin || !supabase) return notify("Admin access required", "error");
      void supabase.from("media").delete().eq("id", id).then(async ({ error }) => {
        if (error) return notify("Could not delete media", "error");
        setMedia((list) => list.filter((x) => x.id !== id));
        notify("Media deleted");
      });
    },
    [isAdmin, notify],
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
      const booking: Booking = { ...input, id: crypto.randomUUID(), createdAt: Date.now(), userEmail: user.email, bookedBy: user.name, status: "pending", paymentInstructions: "", paymentStatus: "unpaid" };
      if (!Number.isInteger(input.passengers) || input.passengers < 1 || input.passengers > 20) {
        notify("Please enter between 1 and 20 travelers", "error");
        return null;
      }
      const item = input.itemType === "flight"
        ? flights.find((flight) => flight.id === input.itemId)
        : destinations.find((destination) => destination.id === input.itemId);
      if (!item || input.unitPrice !== Number(item.price) || input.total !== Number(item.price) * input.passengers) {
        notify("Booking price is no longer valid. Please try again.", "error");
        return null;
      }
      const { error } = await supabase.from("bookings").insert({
        id: booking.id,
        user_id: authData.user.id,
        item_type: input.itemType,
        destination_id: input.itemType === "destination" ? input.itemId : null,
        flight_id: input.itemType === "flight" ? input.itemId : null,
        item_name: input.itemType === "flight" ? (item as Flight).airline + " — " + (item as Flight).arrival_city : (item as Destination).name,
        unit_price: Number(item.price),
        passengers: input.passengers,
        total_price: Number(item.price) * input.passengers,
        payment_method: input.paymentMethod,
        full_name: input.traveler.fullName,
        dob: input.traveler.dob || null,
        phone: input.traveler.phone,
        passport: input.traveler.passport,
        country: input.traveler.country,
        state: input.traveler.state,
        address: input.traveler.address,
        reason: input.traveler.reason,
        emergency_name: input.traveler.emergencyName,
        emergency_phone: input.traveler.emergencyPhone,
        special_requests: input.traveler.notes,
        // Keep compatibility with the original bookings table columns.
        destination: input.itemType === "flight" ? (item as Flight).arrival_city : (item as Destination).name,
        // The legacy table requires a travel date; use check-in when supplied,
        // otherwise persist today so every valid booking can be inserted.
        travel_date: input.traveler.checkIn || new Date().toISOString().slice(0, 10),
        travelers: input.passengers,
        notes: input.traveler.notes || null,
      });
      if (error) {
        console.error("[v0] Booking submission failed", { message: error.message, details: error.details, hint: error.hint, code: error.code });
        const code = error.code ?? "";
        notify(code === "42501" ? "Please sign in again before submitting your booking." : code === "23514" ? "Please check the number of travelers and booking dates." : error.message?.toLowerCase().includes("schema") ? "Booking service is being updated. Please try again shortly." : "Could not create booking. Please check your details and try again.", "error");
        return null;
      }
      setBookings((list) => [booking, ...list]);
      notify("Booking submitted for admin approval");
      return booking;
    },
    [user, flights, destinations, notify],
  );

  const approveBooking = useCallback(
    (id: string, instructions: string) => {
      if (!isAdmin) {
        notify("You do not have permission to review bookings", "error");
        return;
      }
      const db = supabase;
      if (db) void db.from("bookings").select("user_id").eq("id", id).maybeSingle().then(async ({ data, error }) => {
        if (error || !data) {
          notify("Could not find that booking", "error");
          return;
        }
        const result = await db.from("bookings").update({ status: "approved", payment_instructions: instructions }).eq("id", id);
        if (result.error) {
          notify("Could not approve booking", "error");
          return;
        }
        const { data: authData } = await db.auth.getUser();
        if (authData.user) {
          const threadId = crypto.randomUUID();
          await db.from("chat_threads").insert({ id: threadId, booking_id: id, user_id: data.user_id });
          await db.from("chat_messages").insert({ id: crypto.randomUUID(), thread_id: threadId, sender_id: authData.user.id, is_admin: true, body: `Your booking #${id} has been approved.\\n\\nPayment instructions:\\n${instructions}` });
        }
      });
      // The remote update above is authoritative; local state updates only after it succeeds.
      setBookings((list) => list.map((b) => b.id === id ? { ...b, status: "approved", paymentInstructions: instructions } : b));
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
      createdAt: 0,
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
    [isAdmin, notify],
  );

  const updateBookingPayment = useCallback(async (id: string, input: { instructions: string; amount: number; reference: string; status: "unpaid" | "pending" | "paid" | "failed" }) => {
    if (!isAdmin || !supabase) return false;
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return false;
    const { error } = await supabase.from("bookings").update({ payment_instructions: input.instructions, payment_amount: input.amount, payment_reference: input.reference, payment_status: input.status, payment_updated_at: new Date().toISOString(), payment_updated_by: authData.user.id }).eq("id", id);
    if (error) { notify("Could not save payment details", "error"); return false; }
    setBookings((list) => list.map((b) => b.id === id ? { ...b, paymentInstructions: input.instructions, paymentAmount: input.amount, paymentReference: input.reference, paymentStatus: input.status, paymentUpdatedAt: Date.now() } : b));
    notify("Payment details saved and sent to traveler");
    return true;
  }, [isAdmin, notify]);

  const rejectBooking = useCallback(
    (id: string, note?: string) => {
      if (!isAdmin) {
        notify("You do not have permission to review bookings", "error");
        return;
      }
      const db = supabase;
      if (db) void db.from("bookings").update({ status: "rejected", payment_instructions: note || "Booking rejected by admin" }).eq("id", id).then(({ error }) => {
        if (error) notify("Could not reject booking", "error");
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
    [isAdmin, notify],
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
      const messageId = crypto.randomUUID();
      const sentAt = Date.now();
      setThreads((list) =>
        list.map((t) =>
          t.id === threadId
            ? {
                ...t,
                messages: [...t.messages, { id: messageId, from, text, ...(imageId ? { imageId } : {}), at: sentAt }],
              }
            : t,
        ),
      );
      const db = supabase;
      if (db) {
        void db.auth.getUser().then(({ data }) => {
          if (!data.user) return;
          void db.from("chat_messages").insert({ id: messageId, thread_id: threadId, sender_id: data.user.id, is_admin: from === "admin", body: text });
        });
      }
    },
    [],
  );

  const uploadReceipt = useCallback(async (bookingId: string, file: File) => {
    if (!supabase || !user || !file.type.startsWith("image/") || file.size > 10 * 1024 * 1024) { notify("Choose an image smaller than 10 MB", "error"); return false; }
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return false;
    const path = `${authData.user.id}/${bookingId}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
    const upload = await supabase.storage.from("booking-receipts").upload(path, file, { contentType: file.type, upsert: false });
    if (upload.error) { notify("Could not upload receipt", "error"); return false; }
    const { error } = await supabase.from("booking_receipts").insert({ booking_id: bookingId, uploader_id: authData.user.id, storage_path: path, file_name: file.name, mime_type: file.type, file_size: file.size });
    if (error) { await supabase.storage.from("booking-receipts").remove([path]); notify("Could not save receipt", "error"); return false; }
    notify("Receipt uploaded"); return true;
  }, [notify, user]);

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
      const db = supabase;
      if (db) {
        void db.auth.getUser().then(({ data }) => {
          if (!data.user) return;
          return db.from("trip_requests").insert({
            id: req.id,
            user_id: data.user.id,
            destination: req.destination,
            from_city: req.fromCity,
            travelers: req.travelers,
            start_date: req.checkIn,
            end_date: req.checkOut,
            budget: req.budget,
            notes: req.notes,
          });
        }).then((result) => {
          if (result?.error) notify("Could not save trip request", "error");
        });
      }
      setRequests((list) => [req, ...list]);
      return req;
    },
    [notify, user],
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
    setUsers([]);
    notify("Demo data reset");
  }, [notify]);

const value: Store = {
  user,
  isAdmin,
  adminCheckComplete,
  users,
  signIn,
    signUp,
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
    updateBookingPayment,
    rejectBooking,
    threads,
    chatMedia,
    sendMessage,
    uploadReceipt,
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
