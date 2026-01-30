import { db } from './firebase';
import {
    collection,
    doc,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    query,
    where,
    orderBy,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { Booking, BookingStatus, PaymentStatus, Passenger } from '../types';

const BOOKINGS_COLLECTION = 'bookings';
const BOOKED_SEATS_COLLECTION = 'bookedSeats';

// Generate booking reference
const generateBookingRef = (): string => {
    return `BF-${Date.now()}`;
};

// Create a new booking
export const createBooking = async (
    userId: string,
    busId: string,
    busDetails: {
        source: string;
        destination: string;
        journeyDate: string;
        departureTime: string;
        arrivalTime: string;
        busName: string;
        busType: string;
        price: number;
    },
    passengers: Passenger[],
    selectedSeats: string[]
): Promise<Booking> => {
    try {
        const totalAmount = busDetails.price * passengers.length;

        const bookingData = {
            bookingRef: generateBookingRef(),
            userId,
            busId,
            source: busDetails.source,
            destination: busDetails.destination,
            journeyDate: busDetails.journeyDate,
            departureTime: busDetails.departureTime,
            arrivalTime: busDetails.arrivalTime,
            busName: busDetails.busName,
            busType: busDetails.busType,
            passengers,
            selectedSeats,
            totalAmount,
            paymentStatus: 'pending' as PaymentStatus,
            status: 'pending' as BookingStatus,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        };

        const docRef = await addDoc(collection(db, BOOKINGS_COLLECTION), bookingData);

        return {
            id: docRef.id,
            ...bookingData,
        } as Booking;
    } catch (error) {
        console.error('Error creating booking:', error);
        throw error;
    }
};

// Get bookings for a specific user
export const getUserBookings = async (userId: string): Promise<Booking[]> => {
    try {
        const q = query(
            collection(db, BOOKINGS_COLLECTION),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Booking));
    } catch (error) {
        console.error('Error fetching user bookings:', error);
        throw error;
    }
};

// Get a single booking by ID
export const getBookingById = async (bookingId: string): Promise<Booking | null> => {
    try {
        const docRef = doc(db, BOOKINGS_COLLECTION, bookingId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return {
                id: docSnap.id,
                ...docSnap.data()
            } as Booking;
        }
        return null;
    } catch (error) {
        console.error('Error fetching booking:', error);
        throw error;
    }
};

// Update booking status
export const updateBookingStatus = async (
    bookingId: string,
    status: BookingStatus,
    paymentStatus?: PaymentStatus
): Promise<void> => {
    try {
        const docRef = doc(db, BOOKINGS_COLLECTION, bookingId);
        const updateData: any = {
            status,
            updatedAt: serverTimestamp(),
        };

        if (paymentStatus) {
            updateData.paymentStatus = paymentStatus;
        }

        await updateDoc(docRef, updateData);
    } catch (error) {
        console.error('Error updating booking status:', error);
        throw error;
    }
};

// Cancel a booking
export const cancelBooking = async (bookingId: string, userId: string): Promise<void> => {
    try {
        // First verify ownership
        const booking = await getBookingById(bookingId);
        if (!booking) {
            throw new Error('Booking not found');
        }
        if (booking.userId !== userId) {
            throw new Error('Unauthorized to cancel this booking');
        }
        if (booking.status === 'cancelled') {
            throw new Error('Booking is already cancelled');
        }

        // Update booking status
        await updateBookingStatus(bookingId, 'cancelled');

        // Release the booked seats
        await releaseSeats(booking.busId, booking.journeyDate, booking.selectedSeats);
    } catch (error) {
        console.error('Error cancelling booking:', error);
        throw error;
    }
};

// Get all bookings (admin)
export const getAllBookings = async (): Promise<Booking[]> => {
    try {
        const q = query(
            collection(db, BOOKINGS_COLLECTION),
            orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Booking));
    } catch (error) {
        console.error('Error fetching all bookings:', error);
        throw error;
    }
};

// ==================== SEAT MANAGEMENT ====================

// Get booked seats for a bus on a specific date
export const getBookedSeats = async (busId: string, journeyDate: string): Promise<string[]> => {
    try {
        const docId = `${busId}_${journeyDate}`;
        const docRef = doc(db, BOOKED_SEATS_COLLECTION, docId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data().bookedSeats || [];
        }
        return [];
    } catch (error) {
        console.error('Error fetching booked seats:', error);
        throw error;
    }
};

// Book seats (mark them as booked)
export const bookSeats = async (
    busId: string,
    journeyDate: string,
    seats: string[]
): Promise<void> => {
    try {
        const docId = `${busId}_${journeyDate}`;
        const docRef = doc(db, BOOKED_SEATS_COLLECTION, docId);
        const docSnap = await getDoc(docRef);

        let currentSeats: string[] = [];
        if (docSnap.exists()) {
            currentSeats = docSnap.data().bookedSeats || [];
        }

        // Check if any seats are already booked
        const conflictingSeats = seats.filter(seat => currentSeats.includes(seat));
        if (conflictingSeats.length > 0) {
            throw new Error(`Seats ${conflictingSeats.join(', ')} are already booked`);
        }

        const updatedSeats = [...currentSeats, ...seats];

        // Use setDoc with merge to create or update
        const { setDoc } = await import('firebase/firestore');
        await setDoc(docRef, {
            busId,
            journeyDate,
            bookedSeats: updatedSeats,
            updatedAt: serverTimestamp(),
        }, { merge: true });
    } catch (error) {
        console.error('Error booking seats:', error);
        throw error;
    }
};

// Release seats (for cancellation)
export const releaseSeats = async (
    busId: string,
    journeyDate: string,
    seats: string[]
): Promise<void> => {
    try {
        const docId = `${busId}_${journeyDate}`;
        const docRef = doc(db, BOOKED_SEATS_COLLECTION, docId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const currentSeats: string[] = docSnap.data().bookedSeats || [];
            const updatedSeats = currentSeats.filter(seat => !seats.includes(seat));

            await updateDoc(docRef, {
                bookedSeats: updatedSeats,
                updatedAt: serverTimestamp(),
            });
        }
    } catch (error) {
        console.error('Error releasing seats:', error);
        throw error;
    }
};
