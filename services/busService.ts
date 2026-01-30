
import { db } from './firebase';
import { collection, getDocs, query, where, writeBatch, doc } from 'firebase/firestore';
import { Bus } from '../types';
import { MOCK_BUSES } from '../constants';

const BUS_COLLECTION = 'buses';

export const seedBuses = async () => {
    try {
        const busesRef = collection(db, BUS_COLLECTION);
        const snapshot = await getDocs(busesRef);

        if (snapshot.empty) {
            console.log('Seeding buses to Firestore...');
            const batch = writeBatch(db);

            MOCK_BUSES.forEach((bus) => {
                const docRef = doc(busesRef, bus.id); // Use the existing ID
                batch.set(docRef, bus);
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
        // Note: Firestore is case sensitive. For a real app, you might want to normalize specific fields 
        // or use a search service like Algolia. For now, we will query as-is, but in the app 
        // we should make sure we match the case in the DB (MOCK_BUSES has Title Case).

        // Create a query against the collection.
        // We can filter on client side if needed/preferred for case-insensitivity, 
        // but let's try to query exactly if possible or fetch all and filter client side 
        // if the dataset is small (it is small here).

        // Fetching all for client-side filtering (better for this demo to support case-insensitive search easily
        // without complex Firestore setup)
        const q = query(busesRef);
        const querySnapshot = await getDocs(q);

        const buses: Bus[] = [];
        querySnapshot.forEach((doc) => {
            buses.push(doc.data() as Bus);
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
