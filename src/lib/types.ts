export type PaymentMethodId =
  | "cashapp"
  | "venmo"
  | "zelle"
  | "cryptocurrency"
  | "bank"
  | "paypal";

export type BookingStatus = "pending" | "approved" | "rejected" | "canceled";
export type RequestStatus = "pending" | "approved" | "rejected";
export type MediaType = "photo" | "video";
export type ItemType = "destination" | "flight";
export type ChatFrom = "user" | "admin";

export interface User {
  name: string;
  email: string;
  password: string;
  phone: string;
  createdAt: number;
}

export interface Destination {
  id: number;
  name: string;
  location: string;
  description: string;
  price: number;
  rating: string;
  reviews: string;
  image: string;
}

export interface Flight {
  id: number;
  airline: string;
  departure_city: string;
  arrival_city: string;
  departure_date: string;
  arrival_date: string;
  price: number;
  available_seats: number;
  duration: string;
  stops: string;
}

export interface Excursion {
  id: number;
  location: string;
  title: string;
  price: number;
  rating: string;
  reviews: string;
  image: string;
  slug: string;
}

export interface Testimonial {
  id: number;
  name: string;
  location: string;
  rating: number;
  text: string;
  initials: string;
}

export interface MediaItem {
  id: string;
  url: string;
  type: MediaType;
  title: string;
  source: string;
}

export interface TravelerDetails {
  fullName: string;
  dob: string;
  phone: string;
  passport: string;
  country: string;
  state: string;
  address: string;
  reason: string;
  emergencyName: string;
  emergencyPhone: string;
  notes: string;
  checkIn: string;
  checkOut: string;
}

export interface Booking {
  id: string;
  itemType: ItemType;
  itemId: number;
  itemName: string;
  unitPrice: number;
  passengers: number;
  total: number;
  paymentMethod: PaymentMethodId;
  traveler: TravelerDetails;
  createdAt: number;
  userEmail: string;
  bookedBy: string;
  status: BookingStatus;
  paymentInstructions: string;
}

export interface ChatMessage {
  id: string;
  from: ChatFrom;
  text: string;
  imageId?: string;
  at: number;
}

export interface ChatThread {
  id: string;
  bookingId: string;
  userEmail: string;
  userName: string;
  createdAt: number;
  messages: ChatMessage[];
}

export interface TripRequest {
  id: string;
  destination: string;
  fromCity: string;
  travelers: number;
  checkIn: string;
  checkOut: string;
  budget: string;
  notes: string;
  createdAt: number;
  userEmail: string;
  userName: string;
  status: RequestStatus;
  quote: number;
  adminNote: string;
}

export interface PaymentMethod {
  id: PaymentMethodId;
  name: string;
  badge: string;
  desc: string;
  templateLabel: string;
  template: (bookingId: string) => string;
}

export interface BookableItem {
  id: number;
  name: string;
  price: number;
}

export interface Toast {
  id: number;
  msg: string;
  kind: "ok" | "error";
}
