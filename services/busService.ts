
import { db } from './firebase';
import {
    collection,
    getDocs,
    getDoc,
    query,
    writeBatch,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp
} from 'firebase/firestore';
import { Bus, SeatLayout } from '../types';
import { MOCK_BUSES } from '../constants';

const BUS_COLLECTION = 'buses';

// Default seat layout for buses
const DEFAULT_SEAT_LAYOUT: SeatLayout = {
    rows: 10,
    seatsPerRow: 4,
    aisleAfter: 2,
};

export const seedBuses = async () => {
    try {
        const busesRef = collection(db, BUS_COLLECTION);
        const snapshot = await getDocs(busesRef);

        if (snapshot.empty) {
            console.log('Seeding buses to Firestore...');
            const batch = writeBatch(db);

            MOCK_BUSES.forEach((bus) => {
                const docRef = doc(busesRef, bus.id);
                // Add default seat layout and amenities
                batch.set(docRef, {
                    ...bus,
                    seatLayout: DEFAULT_SEAT_LAYOUT,
                    amenities: ['Charging Point', 'Reading Light'],
                    operator: bus.name.split(' ')[0],
                    images: [],
                });
            });

            await batch.commit();
            console.log('Buses seeded successfully!');
        }
    } catch (error) {
        console.error('Error seeding buses:', error);
    }
};

export const findBuses = async (source: string, destination: string): Promise<Bus[]> => {
    try {
        const busesRef = collection(db, BUS_COLLECTION);
        const q = query(busesRef);
        const querySnapshot = await getDocs(q);

        const buses: Bus[] = [];
        querySnapshot.forEach((docSnapshot) => {
            buses.push({ id: docSnapshot.id, ...docSnapshot.data() } as Bus);
        });

        return buses.filter(bus =>
            bus.source.toLowerCase() === source.toLowerCase() &&
            bus.destination.toLowerCase() === destination.toLowerCase()
        );

    } catch (error) {
        console.error('Error finding buses:', error);
        return [];
    }
};

// Get a single bus by ID
export const getBusById = async (busId: string): Promise<Bus | null> => {
    try {
        const docRef = doc(db, BUS_COLLECTION, busId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return {
                id: docSnap.id,
                ...docSnap.data()
            } as Bus;
        }
        return null;
    } catch (error) {
        console.error('Error fetching bus:', error);
        throw error;
    }
};

// Get all buses
export const getAllBuses = async (): Promise<Bus[]> => {
    try {
        const busesRef = collection(db, BUS_COLLECTION);
        const snapshot = await getDocs(busesRef);

        return snapshot.docs.map(docSnapshot => ({
            id: docSnapshot.id,
            ...docSnapshot.data()
        } as Bus));
    } catch (error) {
        console.error('Error fetching all buses:', error);
        throw error;
    }
};

// Create a new bus (Admin)
export const createBus = async (busData: Omit<Bus, 'id'>): Promise<Bus> => {
    try {
        const docRef = await addDoc(collection(db, BUS_COLLECTION), {
            ...busData,
            seatLayout: busData.seatLayout || DEFAULT_SEAT_LAYOUT,
            amenities: busData.amenities || [],
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        return {
            id: docRef.id,
            ...busData,
        } as Bus;
    } catch (error) {
        console.error('Error creating bus:', error);
        throw error;
    }
};

// Update an existing bus (Admin)
export const updateBus = async (busId: string, busData: Partial<Bus>): Promise<void> => {
    try {
        const docRef = doc(db, BUS_COLLECTION, busId);
        await updateDoc(docRef, {
            ...busData,
            updatedAt: serverTimestamp(),
        });
    } catch (error) {
        console.error('Error updating bus:', error);
        throw error;
    }
};

// Delete a bus (Admin)
export const deleteBus = async (busId: string): Promise<void> => {
    try {
        const docRef = doc(db, BUS_COLLECTION, busId);
        await deleteDoc(docRef);
    } catch (error) {
        console.error('Error deleting bus:', error);
        throw error;
    }
};

