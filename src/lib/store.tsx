/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { PAYMENT_IDS } from "./data";
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
import { requestId, rid } from "./utils";
import useSWR from "swr";
import { neon } from "./neon";
import { deleteBlob, uploadBlob } from "./uploads";

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

interface AuthIdentity {
  id: string;
  email: string;
  name?: string | null;
}

interface CatalogSnapshot {
  destinations: Destination[];
  flights: Flight[];
  media: MediaItem[];
}

interface AccountSnapshot {
  users: User[];
  bookings: Booking[];
  threads: ChatThread[];
  requests: TripRequest[];
  isAdmin: boolean;
}

const EMPTY_ACCOUNT: AccountSnapshot = {
  users: [],
  bookings: [],
  threads: [],
  requests: [],
  isAdmin: false,
};
const EMPTY_CATALOG: CatalogSnapshot = { destinations: [], flights: [], media: [] };

interface ProfileRow {
  id: string;
  email?: string | null;
  full_name?: string | null;
  phone?: string | null;
  role?: string;
  created_at?: string | null;
}

interface TripRequestRow {
  id: string;
  destination: string;
  from_city: string;
  travelers: number | string;
  start_date: string;
  end_date: string;
  budget?: string | null;
  notes?: string | null;
  created_at?: string | null;
  status: TripRequest["status"];
  quote?: number | string | null;
  admin_note?: string | null;
}

function profileToUser(profile: ProfileRow): User {
  return {
    name: profile.full_name ?? profile.email?.split("@")[0] ?? "Traveler",
    email: profile.email ?? "",
    password: "",
    phone: profile.phone ?? "",
    createdAt: profile.created_at ? new Date(profile.created_at).getTime() : Date.now(),
  };
}

function tripRequestFromRow(row: TripRequestRow, profile?: ProfileRow): TripRequest {
  return {
    id: row.id,
    destination: row.destination,
    fromCity: row.from_city,
    travelers: Number(row.travelers),
    checkIn: row.start_date,
    checkOut: row.end_date,
    budget: row.budget ?? "",
    notes: row.notes ?? "",
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
    userEmail: profile?.email ?? "",
    userName: profile?.full_name ?? "Traveler",
    status: row.status,
    quote: Number(row.quote ?? 0),
    adminNote: row.admin_note ?? "",
  };
}

async function loadCatalogSnapshot(): Promise<CatalogSnapshot> {
  if (!neon) return { destinations: [], flights: [], media: [] };
  const [destinationsResult, flightsResult, mediaResult] = await Promise.all([
    neon.from("destinations").select("*").order("updated_at", { ascending: false }),
    neon.from("flights").select("*").order("created_at", { ascending: false }),
    neon.from("media").select("*").order("created_at", { ascending: false }),
  ]);
  const error = destinationsResult.error ?? flightsResult.error ?? mediaResult.error;
  if (error) throw new Error(error.message);
  return {
    destinations: (destinationsResult.data ?? []).map((row) => ({
      ...row,
      id: Number(row.id),
      price: Number(row.price),
      media: Array.isArray(row.media) ? row.media : [],
    })) as Destination[],
    flights: (flightsResult.data ?? []).map((row) => ({
      ...row,
      id: Number(row.id),
      price: Number(row.price),
      available_seats: Number(row.available_seats),
    })) as Flight[],
    media: (mediaResult.data ?? []).map((row) => ({
      id: row.id,
      url: row.file_url,
      type: row.file_type === "video" ? "video" : "photo",
      title: row.title ?? row.file_name ?? "",
      source: row.bucket ?? "media",
    })),
  };
}

async function loadAccountSnapshot(authUser: AuthIdentity): Promise<AccountSnapshot> {
  if (!neon) throw new Error("Neon is not configured");

  const profileColumns = "id,email,full_name,phone,role,created_at";
  const ownProfileResult = await neon
    .from("profiles")
    .select(profileColumns)
    .eq("id", authUser.id)
    .maybeSingle();
  if (ownProfileResult.error) throw new Error(ownProfileResult.error.message);

  let ownProfile = ownProfileResult.data;
  if (!ownProfile) {
    const { error } = await neon.from("profiles").insert({
      id: authUser.id,
      email: authUser.email,
      full_name: authUser.name ?? authUser.email.split("@")[0],
      role: "user",
    });
    if (error && error.code !== "23505") throw new Error(error.message);
    const refreshedProfile = await neon
      .from("profiles")
      .select(profileColumns)
      .eq("id", authUser.id)
      .maybeSingle();
    if (refreshedProfile.error || !refreshedProfile.data) {
      throw new Error(refreshedProfile.error?.message ?? "Could not load your profile");
    }
    ownProfile = refreshedProfile.data;
  }

  const { data: adminResult } = await neon.rpc("is_admin");
  const isAdmin = adminResult === true || ownProfile.role === "admin";
  const profilesResult = isAdmin
    ? await neon.from("profiles").select(profileColumns).order("created_at", { ascending: false })
    : { data: [ownProfile], error: null };
  if (profilesResult.error) throw new Error(profilesResult.error.message);
  const profileRows = profilesResult.data ?? [ownProfile];
  const profileMap = new Map(profileRows.map((profile) => [profile.id, profile]));

  const [bookingsResult, threadsResult, messagesResult, requestsResult] = await Promise.all([
    isAdmin
      ? neon.from("bookings").select("*").order("created_at", { ascending: false })
      : neon.from("bookings").select("*").eq("user_id", authUser.id).order("created_at", { ascending: false }),
    neon.from("chat_threads").select("id,booking_id,user_id,created_at").order("created_at", { ascending: true }),
    neon.from("chat_messages").select("id,thread_id,sender_id,is_admin,body,created_at").order("created_at", { ascending: true }),
    neon.from("trip_requests").select("*").order("created_at", { ascending: false }),
  ]);
  const dataError = bookingsResult.error ?? threadsResult.error ?? messagesResult.error ?? requestsResult.error;
  if (dataError) throw new Error(dataError.message);

  const bookings = normalizeBookings((bookingsResult.data ?? []).map((row) => {
    const booking = bookingFromRow(row);
    const owner = profileMap.get(row.user_id);
    return {
      ...booking,
      userEmail: owner?.email ?? (row.user_id === authUser.id ? authUser.email : ""),
      bookedBy: owner?.full_name ?? row.full_name ?? "Traveler",
    };
  }));
  const messagesByThread = new Map<string, ChatMessage[]>();
  for (const message of messagesResult.data ?? []) {
    const messages = messagesByThread.get(message.thread_id) ?? [];
    messages.push({
      id: message.id,
      from: message.is_admin ? "admin" : "user",
      text: message.body,
      at: new Date(message.created_at).getTime(),
    });
    messagesByThread.set(message.thread_id, messages);
  }
  const threads = (threadsResult.data ?? []).map((thread) => {
    const owner = profileMap.get(thread.user_id);
    return {
      id: thread.id,
      bookingId: thread.booking_id,
      userEmail: owner?.email ?? "",
      userName: owner?.full_name ?? "Traveler",
      createdAt: new Date(thread.created_at).getTime(),
      messages: messagesByThread.get(thread.id) ?? [],
    };
  });
  const requests = (requestsResult.data ?? []).map((row) =>
    tripRequestFromRow(row, profileMap.get(row.user_id)),
  );

  return {
    users: profileRows.map(profileToUser),
    bookings,
    threads,
    requests,
    isAdmin,
  };
}

interface Store {
  user: User | null;
  authCheckComplete: boolean;
  isAdmin: boolean;
  adminCheckComplete: boolean;
  users: User[];
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (name: string, email: string, password: string) => Promise<string | null>;
  signOut: () => void;
  updateProfile: (name: string, phone: string) => Promise<boolean>;
  destinations: Destination[];
  flights: Flight[];
  media: MediaItem[];
  catalogLoading: boolean;
  saveDestination: (d: Destination) => Promise<boolean>;
  deleteDestination: (id: number) => Promise<boolean>;
  saveFlight: (f: Flight) => Promise<boolean>;
  deleteFlight: (id: number) => void;
  addMedia: (items: MediaItem[]) => Promise<boolean>;
  deleteMedia: (id: string) => Promise<boolean>;
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
  const [chatMedia, setChatMedia] = useState<Record<string, string>>({});
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastSeq = useRef(0);

  const notify = useCallback((msg: string, kind: Toast["kind"] = "ok") => {
    const id = ++toastSeq.current;
    setToasts((current) => [...current, { id, msg, kind }]);
    window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 3200);
  }, []);

  const { data: authUser, isLoading: authIsLoading, isValidating: authIsValidating, mutate: refreshAuth } = useSWR<AuthIdentity | null>(
    neon ? "neon-auth-session" : null,
    async () => {
      if (!neon) return null;
      const { data, error } = await neon.auth.getSession();
      if (error || !data?.user) return null;
      return { id: data.user.id, email: data.user.email, name: data.user.name };
    },
    { revalidateOnFocus: true },
  );
  const { data: catalogSnapshot, isLoading: catalogIsLoading, mutate: refreshCatalog } = useSWR<CatalogSnapshot>(
    neon ? "neon-public-catalog" : null,
    loadCatalogSnapshot,
    {
      refreshInterval: 30_000,
      revalidateOnFocus: true,
      onError: () => notify("Could not load travel catalog", "error"),
    },
  );
  const {
    data: accountSnapshot,
    error: accountError,
    mutate: refreshAccount,
  } = useSWR<AccountSnapshot>(
    neon && authUser?.id ? `neon-account:${authUser.id}` : null,
    () => authUser ? loadAccountSnapshot(authUser) : Promise.reject(new Error("Not signed in")),
    {
      refreshInterval: 20_000,
      revalidateOnFocus: true,
      onError: () => notify("Could not load your account data", "error"),
    },
  );

  const accountData = accountSnapshot ?? EMPTY_ACCOUNT;
  const catalogData = catalogSnapshot ?? EMPTY_CATALOG;
  const users = accountData.users;
  const bookings = accountData.bookings;
  const threads = accountData.threads;
  const requests = accountData.requests;
  const destinations = catalogData.destinations;
  const flights = catalogData.flights;
  const media = catalogData.media;
  const isAdmin = accountSnapshot?.isAdmin ?? false;
  const authCheckComplete = !authIsLoading && !authIsValidating;
  const adminCheckComplete = authCheckComplete && (!authUser || Boolean(accountSnapshot) || Boolean(accountError));




  const user = useMemo(() => {
    if (!authUser?.email) return null;
    return users.find((profile) => profile.email.toLowerCase() === authUser.email.toLowerCase()) ?? {
      name: authUser.name || authUser.email.split("@")[0] || "Traveler",
      email: authUser.email.toLowerCase(),
      password: "",
      phone: "",
      createdAt: 0,
    };
  }, [authUser, users]);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!neon) return "Neon Auth is not configured";
    const result = await neon.auth.signIn.email({ email: email.trim().toLowerCase(), password });
    if (result.error) return "Invalid email or password";
    await refreshAuth();
    return null;
  }, [refreshAuth]);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    if (password.length < 8) return "Password must be at least 8 characters.";
    if (!neon) return "Neon Auth is not configured";
    const result = await neon.auth.signUp.email({
      email: email.trim().toLowerCase(),
      password,
      name: name.trim(),
    });
    if (result.error) {
      const message = result.error.message?.toLowerCase() ?? "";
      if (message.includes("already") || message.includes("registered")) return "This email is already registered. Please sign in instead.";
      return result.error.message ?? "Could not create account.";
    }
    await neon.auth.signOut();
    await refreshAuth();
    return null;
  }, [refreshAuth]);

  const signOut = useCallback(() => {
    void (async () => {
      await neon?.auth.signOut();
      await refreshAuth();
    })();
  }, [refreshAuth]);

  const updateProfile = useCallback(
    async (name: string, phone: string) => {
      if (!user || !authUser || !neon) return false;
      const { error } = await neon.from("profiles").update({ full_name: name, phone }).eq("id", authUser.id);
      if (error) {
        notify("Could not save profile", "error");
        return false;
      }
      void refreshAccount();
      notify("Profile saved");
      return true;
    },
    [authUser, notify, refreshAccount, user],
  );

  const saveDestination = useCallback(
    async (destination: Destination) => {
      if (!isAdmin || !neon) {
        notify("Admin access required", "error");
        return false;
      }
      const { error } = await neon.from("destinations").upsert({
        id: destination.id,
        name: destination.name,
        location: destination.location,
        description: destination.description,
        price: destination.price,
        rating: destination.rating,
        reviews: destination.reviews,
        image: destination.image,
        media: destination.media ?? [],
        updated_at: new Date().toISOString(),
      });
      if (error) {
        notify("Could not save package", "error");
        return false;
      }
      void refreshCatalog();
      notify("Package published");
      return true;
    },
    [isAdmin, notify, refreshCatalog],
  );

  const deleteDestination = useCallback(
    async (id: number) => {
      if (!isAdmin || !neon) {
        notify("Admin access required", "error");
        return false;
      }
      const destination = destinations.find((item) => item.id === id);
      const { error } = await neon.from("destinations").delete().eq("id", id);
      if (error) {
        notify("Could not delete package", "error");
        return false;
      }
      const paths = (destination?.media ?? []).flatMap((item) => {
        try {
          const pathname = new URL(item.url, window.location.origin).searchParams.get("pathname");
          return pathname ? [pathname] : [];
        } catch {
          return [];
        }
      });
      await Promise.all(paths.map((pathname) => deleteBlob(pathname)));
      void refreshCatalog();
      notify("Package deleted");
      return true;
    },
    [destinations, isAdmin, notify, refreshCatalog],
  );

  const saveFlight = useCallback(
    async (f: Flight) => {
      if (!isAdmin || !neon) { notify("Admin access required", "error"); return false; }
      const isExisting = flights.some((flight) => flight.id === f.id);
      const flightRow = {
        airline: f.airline,
        departure_city: f.departure_city,
        arrival_city: f.arrival_city,
        departure_date: f.departure_date || null,
        arrival_date: f.arrival_date || null,
        price: f.price,
        available_seats: f.available_seats,
        duration: f.duration,
        stops: f.stops,
      };
      const query = isExisting
        ? neon.from("flights").update(flightRow).eq("id", f.id)
        : neon.from("flights").insert(flightRow);
      const { data, error } = await query.select().single();
      if (error || !data) { notify("Could not save flight", "error"); return false; }
      void refreshCatalog();
      notify("Flight published");
      return true;
    },
    [flights, isAdmin, notify, refreshCatalog],
  );

  const deleteFlight = useCallback(
    (id: number) => {
      if (!isAdmin || !neon) return notify("Admin access required", "error");
      void neon.from("flights").delete().eq("id", id).then(({ error }) => {
        if (error) notify("Could not delete flight", "error");
        else {
          void refreshCatalog();
          notify("Flight deleted");
        }
      });
    },
    [isAdmin, notify, refreshCatalog],
  );

  const addMedia = useCallback(async (items: MediaItem[]) => {
    if (!isAdmin || !neon) {
      notify("Admin access required", "error");
      return false;
    }
    if (items.some((item) => !item.storagePath)) {
      notify("Media must be uploaded to Blob before it can be published", "error");
      return false;
    }
    const rows = items.map((item) => ({
      id: item.id,
      file_name: item.title,
      file_url: item.url,
      storage_path: item.storagePath,
      file_type: item.type === "video" ? "video" : "photo",
      bucket: "media",
      title: item.title,
    }));
    const { error } = await neon.from("media").insert(rows);
    if (error) {
      await Promise.all(items.flatMap((item) => item.storagePath ? [deleteBlob(item.storagePath)] : []));
      notify("Could not publish media", "error");
      return false;
    }
    void refreshCatalog();
    notify("Media published");
    return true;
  }, [isAdmin, notify, refreshCatalog]);

  const deleteMedia = useCallback(
    async (id: string) => {
      if (!isAdmin || !neon) {
        notify("Admin access required", "error");
        return false;
      }
      const { data: row, error: lookupError } = await neon.from("media").select("storage_path").eq("id", id).maybeSingle();
      if (lookupError || !row) {
        notify("Could not find media", "error");
        return false;
      }
      const { error } = await neon.from("media").delete().eq("id", id);
      if (error) {
        notify("Could not delete media", "error");
        return false;
      }
      await deleteBlob(row.storage_path);
      void refreshCatalog();
      notify("Media deleted");
      return true;
    },
    [isAdmin, notify, refreshCatalog],
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
      if (!user || !authUser || !neon) return null;
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
      const { error } = await neon.from("bookings").insert({
        id: booking.id,
        user_id: authUser.id,
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
      void refreshAccount();
      notify("Booking submitted for admin approval");
      return booking;
    },
    [authUser, user, flights, destinations, notify, refreshAccount],
  );

  const approveBooking = useCallback(
    async (id: string, instructions: string) => {
      if (!isAdmin || !authUser || !neon) {
        notify("You do not have permission to review bookings", "error");
        return;
      }
      const { data: bookingRow, error: lookupError } = await neon
        .from("bookings")
        .select("user_id")
        .eq("id", id)
        .maybeSingle();
      if (lookupError || !bookingRow) {
        notify("Could not find that booking", "error");
        return;
      }
      const { error: updateError } = await neon
        .from("bookings")
        .update({ status: "approved", payment_instructions: instructions })
        .eq("id", id);
      if (updateError) {
        notify("Could not approve booking", "error");
        return;
      }

      let threadId = threads.find((thread) => thread.bookingId === id)?.id;
      if (!threadId) {
        threadId = crypto.randomUUID();
        const { error: threadError } = await neon.from("chat_threads").insert({
          id: threadId,
          booking_id: id,
          user_id: bookingRow.user_id,
        });
        if (threadError) {
          notify("Booking approved, but its support thread could not be created", "error");
          void refreshAccount();
          return;
        }
      }

      const messageText = `Your booking #${id} has been approved.\n\nPayment instructions:\n${instructions}`;
      const { error: messageError } = await neon.from("chat_messages").insert({
        id: crypto.randomUUID(),
        thread_id: threadId,
        sender_id: authUser.id,
        is_admin: true,
        body: messageText,
      });
      void refreshAccount();
      if (messageError) {
        notify("Booking approved, but the support message could not be sent", "error");
        return;
      }
      notify(`Booking #${id} approved — payment details sent to traveler`);
    },
    [authUser, isAdmin, notify, refreshAccount, threads],
  );

  const updateBookingPayment = useCallback(async (id: string, input: { instructions: string; amount: number; reference: string; status: "unpaid" | "pending" | "paid" | "failed" }) => {
    if (!isAdmin || !authUser || !neon) return false;
    const { error } = await neon.from("bookings").update({
      payment_instructions: input.instructions,
      payment_amount: input.amount,
      payment_reference: input.reference,
      payment_status: input.status,
      payment_updated_at: new Date().toISOString(),
      payment_updated_by: authUser.id,
    }).eq("id", id);
    if (error) { notify("Could not save payment details", "error"); return false; }
    void refreshAccount();
    notify("Payment details saved and sent to traveler");
    return true;
  }, [authUser, isAdmin, notify, refreshAccount]);

  const rejectBooking = useCallback(
    async (id: string, note?: string) => {
      if (!isAdmin || !neon) {
        notify("You do not have permission to review bookings", "error");
        return;
      }
      const paymentInstructions = note || "Booking rejected by admin";
      const { error } = await neon.from("bookings").update({
        status: "rejected",
        payment_instructions: paymentInstructions,
      }).eq("id", id);
      if (error) {
        notify("Could not reject booking", "error");
        return;
      }
      void refreshAccount();
      notify(`Booking #${id} rejected`);
    },
    [isAdmin, notify, refreshAccount],
  );

  const myBookings = useMemo(
    () => (user ? bookings.filter((b) => b.userEmail === user.email) : []),
    [bookings, user],
  );

  const sendMessage = useCallback(
    (threadId: string, from: ChatFrom, text: string, imageDataUrl?: string) => {
      if (!authUser || !neon) return;
      const imageId = imageDataUrl ? rid() : undefined;
      if (imageDataUrl && imageId) setChatMedia((current) => ({ ...current, [imageId]: imageDataUrl }));
      const messageId = crypto.randomUUID();
      void neon.from("chat_messages").insert({
        id: messageId,
        thread_id: threadId,
        sender_id: authUser.id,
        is_admin: from === "admin",
        body: text,
      }).then(({ error }) => {
        if (error) notify("Could not send message", "error");
        else void refreshAccount();
      });
    },
    [authUser, notify, refreshAccount],
  );

  const uploadReceipt = useCallback(async (bookingId: string, file: File) => {
    if (!neon || !user || !authUser || !file.type.startsWith("image/") || file.size > 10 * 1024 * 1024) {
      notify("Choose an image smaller than 10 MB", "error");
      return false;
    }
    let uploaded: Awaited<ReturnType<typeof uploadBlob>> | null = null;
    try {
      uploaded = await uploadBlob(file, "receipt", bookingId);
      const { error } = await neon.from("booking_receipts").insert({
        booking_id: bookingId,
        uploader_id: authUser.id,
        storage_path: uploaded.pathname,
        file_name: file.name,
        mime_type: file.type,
        file_size: file.size,
      });
      if (error) {
        await deleteBlob(uploaded.pathname);
        notify("Could not save receipt", "error");
        return false;
      }
      notify("Receipt uploaded");
      return true;
    } catch {
      if (uploaded) await deleteBlob(uploaded.pathname);
      notify("Could not upload receipt", "error");
      return false;
    }
  }, [authUser, notify, user]);

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
      if (!user || !authUser || !neon) return null;
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
      void neon.from("trip_requests").insert({
        id: req.id,
        user_id: authUser.id,
        destination: req.destination,
        from_city: req.fromCity,
        travelers: req.travelers,
        start_date: req.checkIn,
        end_date: req.checkOut,
        budget: req.budget,
        notes: req.notes,
      }).then(({ error }) => {
        if (error) {
          notify("Could not save trip request", "error");
        } else {
          void refreshAccount();
        }
      });
      return req;
    },
    [authUser, notify, refreshAccount, user],
  );

  const quoteTripRequest = useCallback(
    async (id: string, quote: number, note: string) => {
      if (!isAdmin || !neon) {
        notify("Admin access required", "error");
        return;
      }
      const { error } = await neon.from("trip_requests").update({
        status: "approved",
        quote,
        admin_note: note,
        updated_at: new Date().toISOString(),
      }).eq("id", id);
      if (error) {
        notify("Could not save quote", "error");
        return;
      }
      void refreshAccount();
      notify(`Request #${id} approved — quote sent to traveler`);
    },
    [isAdmin, notify, refreshAccount],
  );

  const declineTripRequest = useCallback(
    async (id: string, note?: string) => {
      if (!isAdmin || !neon) {
        notify("Admin access required", "error");
        return;
      }
      const adminNote = note || "Not available for the selected dates.";
      const { error } = await neon.from("trip_requests").update({
        status: "rejected",
        admin_note: adminNote,
        updated_at: new Date().toISOString(),
      }).eq("id", id);
      if (error) {
        notify("Could not decline trip request", "error");
        return;
      }
      void refreshAccount();
      notify(`Request #${id} declined`);
    },
    [isAdmin, notify, refreshAccount],
  );

  const myTripRequests = useMemo(
    () => (user ? requests.filter((r) => r.userEmail === user.email) : []),
    [requests, user],
  );

  const resetAll = useCallback(() => {
    setChatMedia({});
    void refreshCatalog();
    if (authUser) void refreshAccount();
    notify("Live database data refreshed");
  }, [authUser, notify, refreshAccount, refreshCatalog]);

  const value: Store = {
    user,
    authCheckComplete,
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
    catalogLoading: catalogIsLoading,
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
