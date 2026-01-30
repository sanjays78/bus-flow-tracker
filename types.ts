
// ==================== BUS TYPES ====================

export interface SeatLayout {
  rows: number;
  seatsPerRow: number;
  aisleAfter: number;
}

export interface Bus {
  id: string;
  busNumber: string;
  name: string;
  type: 'AC' | 'Non-AC' | 'Sleeper' | 'Semi-Sleeper';
  source: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  totalSeats: number;
  availableSeats: number;
  price: number;
  rating: number;
  // Enhanced fields
  amenities?: string[];
  seatLayout?: SeatLayout;
  operator?: string;
  images?: string[];
}

export interface SearchParams {
  source: string;
  destination: string;
  date?: string;
}

export enum AvailabilityStatus {
  AVAILABLE = 'AVAILABLE',
  FILLING_FAST = 'FILLING_FAST',
  FULL = 'FULL'
}

// ==================== USER TYPES ====================

export type UserRole = 'user' | 'admin';

export interface UserData {
  uid: string;
  email: string;
  name?: string;
  phone?: string;
  role: UserRole;
  createdAt?: any;
  updatedAt?: any;
}

// ==================== BOOKING TYPES ====================

export type Gender = 'M' | 'F' | 'O';
export type PaymentStatus = 'pending' | 'completed' | 'refunded';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';
export type PaymentMethod = 'card' | 'upi' | 'netbanking';

export interface Passenger {
  name: string;
  age: number;
  gender: Gender;
  seatNumber: string;
}

export interface Booking {
  id: string;
  bookingRef: string;
  userId: string;
  busId: string;

  // Journey Details
  source: string;
  destination: string;
  journeyDate: string;
  departureTime: string;
  arrivalTime: string;
  busName: string;
  busType: string;

  // Passenger & Seats
  passengers: Passenger[];
  selectedSeats: string[];

  // Payment
  totalAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;

  // Booking Status
  status: BookingStatus;

  // Timestamps
  createdAt?: any;
  updatedAt?: any;
}

// ==================== REVIEW TYPES ====================

export interface Review {
  id: string;
  busId: string;
  userId: string;
  bookingId: string;

  rating: number;
  review: string;
  userName: string;

  createdAt?: any;
}

// ==================== SEAT AVAILABILITY ====================

export interface BookedSeats {
  id: string;
  busId: string;
  journeyDate: string;
  bookedSeats: string[];
  updatedAt?: any;
}
