import type {
  Destination,
  Excursion,
  Flight,
  MediaItem,
  PaymentMethod,
  Testimonial,
} from "./types";

export const CONTACT_EMAIL = "atltravels@hotmail.com";
export const CONTACT_PHONE = "+1 754-342-3805";
export const CONTACT_OFFICE = "Miami Beach 33105, United States";

export const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "cashapp",
    name: "Cash App",
    badge: "$Tag",
    desc: "Fast mobile payment via Cash App",
    templateLabel: "$ATLTravels (Cash App)",
    template: (id) =>
      `Pay via Cash App to $ATLTravels. Include Booking #${id} in note.`,
  },
  {
    id: "venmo",
    name: "Venmo",
    badge: "@Handle",
    desc: "Instant Venmo transfer",
    templateLabel: "@ATLTravels (Venmo)",
    template: (id) =>
      `Pay via Venmo to @ATLTravels. Include Booking #${id} in note.`,
  },
  {
    id: "zelle",
    name: "Zelle",
    badge: "Email/Phone",
    desc: "Direct bank transfer via Zelle",
    templateLabel: "Zelle Email",
    template: (id) =>
      `Pay via Zelle to payments@atltravels.com. Include Booking #${id} in memo.`,
  },
  {
    id: "cryptocurrency",
    name: "Cryptocurrency",
    badge: "BTC / USDT",
    desc: "Bitcoin, USDT, or Ethereum",
    templateLabel: "Crypto Address",
    template: () =>
      "Send USDT (TRC20): T123ATLTravelsCryptoWalletAddress... or BTC: 1ATLTravelsBtc... Include Booking # in the transfer memo/email.",
  },
  {
    id: "bank",
    name: "Bank Transfer",
    badge: "Bank Wire Info",
    desc: "Direct bank wire or ACH deposit",
    templateLabel: "Bank Wire Info",
    template: () =>
      "Bank: Chase Bank | Routing: 123456789 | Account: 9876543210 | Name: ATL Travels LLC. Include your Booking # in the wire memo.",
  },
  {
    id: "paypal",
    name: "PayPal",
    badge: "PayPal Email",
    desc: "Secure payment via PayPal — cards accepted",
    templateLabel: "PayPal (payments@atltravels.com)",
    template: (id) =>
      `Pay via PayPal to payments@atltravels.com. Include Booking #${id} in the payment note before sending.`,
  },
];

export const PAYMENT_IDS = PAYMENT_METHODS.map((m) => m.id);

export function getPaymentMethod(id: string): PaymentMethod {
  return PAYMENT_METHODS.find((m) => m.id === id) ?? PAYMENT_METHODS[2];
}

export const SEED_DESTINATIONS: Destination[] = [
  {
    id: 1,
    name: "Yacht & Skyline Sunset",
    location: "Port Canaveral, Florida",
    description:
      "Sail aboard the beautiful Disney Fantasy from Florida on a fun filled 3-night to Bahamas cruise perfect for a family getaway!",
    price: 1600,
    rating: "5.0",
    reviews: "2.4k",
    image: "/dest/dest-1.jpeg",
  },
  {
    id: 2,
    name: "Grand Costa Mujeres",
    location: "Cancun, Mexico",
    description:
      "Enjoy an unforgettable week at Catalonia Grand Costa Mujeres, a beautiful all-inclusive resort in Cancun, Mexico!",
    price: 3640,
    rating: "5.0",
    reviews: "6.8k",
    image: "/dest/dest-2.jpeg",
  },
  {
    id: 3,
    name: "Bahia Principe Explore Jamaica (Runaway Bay)",
    location: "Jamaica",
    description: "Great price for Jamaica",
    price: 2579,
    rating: "5.0",
    reviews: "3.1k",
    image: "/dest/dest-3.jpeg",
  },
  {
    id: 4,
    name: "Amsterdam / Cologne / Brussels",
    location: "Amsterdam, Netherlands, Europe",
    description:
      "Discover the magic of the festive season on this European journey through Amsterdam, Cologne, and Brussels, with a visit to Luxembourg City. From twinkling canals and charming Christmas markets to festive lights and seasonal treats, this itinerary offers the perfect blend of iconic sights and holiday spirit.",
    price: 3289,
    rating: "5.0",
    reviews: "8.2k",
    image: "/dest/dest-4.jpeg",
  },
  {
    id: 6,
    name: "Hilton Hawaiian Village",
    location: "Hawaii",
    description:
      "A lovely experience here, dm to book. This is not all inclusive — flight and hotel only!",
    price: 1889,
    rating: "5.0",
    reviews: "9.6k",
    image: "/dest/dest-6.jpeg",
  },
  {
    id: 7,
    name: "Cancún's famous Hotel Zone",
    location: "Coral Cancun, Mexico",
    description:
      "Cancún's famous Hotel Zone offers a beautiful white-sand beach, stunning turquoise Caribbean waters, and is just a short drive from shopping, restaurants, nightlife, and downtown Cancun. It's the perfect balance of a relaxing beachfront vacation with easy access to everything Cancún has to offer.",
    price: 985,
    rating: "5.0",
    reviews: "3.6k",
    image: "/dest/dest-7.jpeg",
  },
  {
    id: 8,
    name: "MSC Seaside",
    location: "Miami, Florida",
    description:
      "Cruise the Caribbean in style aboard MSC Seaside — oceanfront pools, world-class dining, and stops at private island Ocean Cay.",
    price: 839,
    rating: "5.0",
    reviews: "10.5k",
    image: "/dest/dest-8.jpeg",
  },
  {
    id: 9,
    name: "Riu Montego Bay",
    location: "Montego Bay, Jamaica",
    description:
      "Escape to paradise for Thanksgiving with the squad! Soak up the sun on white sand beaches, sip cocktails at the swim-up bar, and enjoy 24-hour all-inclusive luxury at this adults-only resort on Jamaica's north coast.",
    price: 985,
    rating: "5.0",
    reviews: "",
    image: "/dest/dest-9.jpeg",
  },
];

export const SEED_FLIGHTS: Flight[] = [
  {
    id: 1,
    airline: "Delta Airways",
    departure_city: "ATL",
    arrival_city: "MIA",
    departure_date: "2025-09-15T08:30:00+00:00",
    arrival_date: "2025-09-15T10:15:00+00:00",
    price: 245,
    available_seats: 45,
    duration: "1h 45m",
    stops: "Non-stop",
  },
  {
    id: 2,
    airline: "United Airlines",
    departure_city: "ATL",
    arrival_city: "NYC",
    departure_date: "2025-09-16T14:00:00+00:00",
    arrival_date: "2025-09-16T16:30:00+00:00",
    price: 189,
    available_seats: 32,
    duration: "2h 30m",
    stops: "Non-stop",
  },
  {
    id: 3,
    airline: "American Airlines",
    departure_city: "ATL",
    arrival_city: "LAX",
    departure_date: "2025-09-17T11:15:00+00:00",
    arrival_date: "2025-09-17T14:45:00+00:00",
    price: 320,
    available_seats: 67,
    duration: "5h 30m",
    stops: "Non-stop",
  },
  {
    id: 4,
    airline: "Southwest Airlines",
    departure_city: "ATL",
    arrival_city: "DEN",
    departure_date: "2025-09-18T09:45:00+00:00",
    arrival_date: "2025-09-18T11:30:00+00:00",
    price: 156,
    available_seats: 28,
    duration: "2h 45m",
    stops: "Non-stop",
  },
  {
    id: 5,
    airline: "JetBlue",
    departure_city: "ATL",
    arrival_city: "BOS",
    departure_date: "2025-09-19T07:00:00+00:00",
    arrival_date: "2025-09-19T09:30:00+00:00",
    price: 210,
    available_seats: 50,
    duration: "2h 30m",
    stops: "Non-stop",
  },
  {
    id: 6,
    airline: "Spirit Airlines",
    departure_city: "ATL",
    arrival_city: "LAS",
    departure_date: "2025-09-20T13:00:00+00:00",
    arrival_date: "2025-09-20T15:15:00+00:00",
    price: 135,
    available_seats: 40,
    duration: "4h 15m",
    stops: "Non-stop",
  },
];

export const EXCURSIONS: Excursion[] = [
  {
    id: 1,
    location: "Miami, FL",
    title: "Yacht & Skyline Sunset",
    price: 189,
    rating: "5.0",
    reviews: "2.4k",
    image:
      "https://images.unsplash.com/photo-1535498730771-e735b998cd64?auto=format&fit=crop&w=800&q=80",
    slug: "miami",
  },
  {
    id: 2,
    location: "Turks & Caicos",
    title: "Floating Pool Villa Escape",
    price: 429,
    rating: "5.0",
    reviews: "2.4k",
    image:
      "https://images.unsplash.com/photo-1544144433-d50aff500b91?auto=format&fit=crop&w=800&q=80",
    slug: "turks-caicos",
  },
  {
    id: 3,
    location: "Jamaica",
    title: "Horseback Beach Ride at Sunset",
    price: 129,
    rating: "5.0",
    reviews: "2.4k",
    image:
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80",
    slug: "jamaica",
  },
  {
    id: 4,
    location: "Phuket",
    title: "Phi Phi Islands Speedboat",
    price: 99,
    rating: "5.0",
    reviews: "2.4k",
    image:
      "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?auto=format&fit=crop&w=800&q=80",
    slug: "thailand",
  },
  {
    id: 5,
    location: "Cancun",
    title: "Cenote & Tulum Private Tour",
    price: 159,
    rating: "5.0",
    reviews: "2.4k",
    image:
      "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=800&q=80",
    slug: "cancun",
  },
  {
    id: 6,
    location: "Bali",
    title: "Ubud Jungle Swing & Rice Terraces",
    price: 79,
    rating: "5.0",
    reviews: "2.4k",
    image:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80",
    slug: "bali",
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 1,
    name: "Sarah Anderson",
    location: "New York, USA",
    rating: 5,
    text: "ATL Travels made our honeymoon absolutely perfect. The attention to detail was incredible!",
    initials: "SA",
  },
  {
    id: 2,
    name: "Michael Johnson",
    location: "Los Angeles, USA",
    rating: 5,
    text: "Best vacation planning service we've ever used. Highly recommended for anyone seeking luxury travel!",
    initials: "MJ",
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    location: "Miami, USA",
    rating: 5,
    text: "The experiences curated by ATL Travels were beyond our expectations. Pure paradise!",
    initials: "ER",
  },
  {
    id: 4,
    name: "James Wilson",
    location: "Chicago, USA",
    rating: 5,
    text: "Exceptional service and unforgettable memories. We're already planning our next trip!",
    initials: "JW",
  },
];

export const SEED_MEDIA: MediaItem[] = Array.from({ length: 14 }, (_, n) => ({
  id: `seed-${n + 1}`,
  url: `/gallery/g${String(n + 1).padStart(2, "0")}.jpeg`,
  type: "photo" as const,
  title: `Travel photo ${n + 1}`,
  source: "seed",
}));

export const TRIP_REASONS = [
  "Vacation / Leisure",
  "Business Trip",
  "Family Visit",
  "Medical Treatment",
  "Education / Study",
];

export const EMPTY_TRAVELER = {
  fullName: "",
  dob: "",
  phone: "",
  passport: "",
  country: "",
  state: "",
  address: "",
  reason: "",
  emergencyName: "",
  emergencyPhone: "",
  notes: "",
  checkIn: "",
  checkOut: "",
};

export const NAV_LINKS = [
  { href: "/destinations", label: "Destinations" },
  { href: "/bookings", label: "Bookings" },
  { href: "/gallery", label: "Gallery" },
  { href: "/#testimonials", label: "Reviews" },
  { href: "/#contact", label: "Contact" },
];

export const STORAGE_KEYS = {
  users: "atl.users.v1",
  session: "atl.session.v1",
  bookings: "atl.bookings.v1",
  destinations: "atl.destinations.v1",
  flights: "atl.flights.v1",
  media: "atl.media.v1",
  threads: "atl.threads.v1",
  requests: "atl.requests.v1",
  chatMedia: "atl.chatmedia.v1",
};
