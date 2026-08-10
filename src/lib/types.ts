export type PaymentMethodId =
  | 'cashapp'
  | 'venmo'
  | 'zelle'
  | 'cryptocurrency'
  | 'bank_transfer'
  | 'paypal';

export type BookingStatus = 'pending' | 'approved' | 'rejected';

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

export interface MediaItem {
  id: string;
  url: string;
  type: 'photo' | 'video';
  title: string;
  source: 'seed' | 'upload';
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
}

export interface Booking {
  id: string;
  createdAt: number;
  userEmail: string;
  bookedBy: string;
  itemType: 'flight' | 'destination';
  itemId: number;
  itemName: string;
  unitPrice: number;
  passengers: number;
  total: number;
  status: BookingStatus;
  paymentMethod: PaymentMethodId;
  paymentInstructions: string;
  traveler: TravelerDetails;
}

export interface UserAccount {
  name: string;
  email: string;
  password: string;
  phone: string;
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  from: 'user' | 'admin';
  text: string;
  at: number;
}

export interface ChatThread {
  id: string;
  bookingId: string;
  userEmail: string;
  userName: string;
  messages: ChatMessage[];
  createdAt: number;
}

export interface PaymentMethodMeta {
  id: PaymentMethodId;
  name: string;
  badge: string;
  desc: string;
  templateLabel: string;
  template: (bookingId: string) => string;
}

export interface ToastMsg {
  id: number;
  msg: string;
  kind: 'ok' | 'error';
}
