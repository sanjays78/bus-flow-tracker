import { db } from './firebase';
import {
    collection,
    doc,
    getDocs,
    addDoc,
    updateDoc,
    query,
    where,
    orderBy,
    serverTimestamp,
    limit as firestoreLimit
} from 'firebase/firestore';
import { Review } from '../types';

const REVIEWS_COLLECTION = 'reviews';
const BUSES_COLLECTION = 'buses';

// Create a new review
export const createReview = async (
    userId: string,
    userName: string,
    busId: string,
    bookingId: string,
    rating: number,
    review: string
): Promise<Review> => {
    try {
        // Validate rating
        if (rating < 1 || rating > 5) {
            throw new Error('Rating must be between 1 and 5');
        }

        const reviewData = {
            userId,
            userName,
            busId,
            bookingId,
            rating,
            review,
            createdAt: serverTimestamp(),
        };

        const docRef = await addDoc(collection(db, REVIEWS_COLLECTION), reviewData);

        // Update bus average rating
        await updateBusRating(busId);

        return {
            id: docRef.id,
            ...reviewData,
        } as Review;
    } catch (error) {
        console.error('Error creating review:', error);
        throw error;
    }
};

// Get all reviews for a bus
export const getBusReviews = async (busId: string, limitCount?: number): Promise<Review[]> => {
    try {
        let q = query(
            collection(db, REVIEWS_COLLECTION),
            where('busId', '==', busId),
            orderBy('createdAt', 'desc')
        );

        if (limitCount) {
            q = query(q, firestoreLimit(limitCount));
        }

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Review));
    } catch (error) {
        console.error('Error fetching bus reviews:', error);
        throw error;
    }
};

// Get reviews by user
export const getUserReviews = async (userId: string): Promise<Review[]> => {
    try {
        const q = query(
            collection(db, REVIEWS_COLLECTION),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Review));
    } catch (error) {
        console.error('Error fetching user reviews:', error);
        throw error;
    }
};

// Check if user has already reviewed a booking
export const hasUserReviewed = async (bookingId: string): Promise<boolean> => {
    try {
        const q = query(
            collection(db, REVIEWS_COLLECTION),
            where('bookingId', '==', bookingId),
            firestoreLimit(1)
        );

        const snapshot = await getDocs(q);
        return !snapshot.empty;
    } catch (error) {
        console.error('Error checking user review:', error);
        throw error;
    }
};

// Update bus average rating
export const updateBusRating = async (busId: string): Promise<void> => {
    try {
        // Get all reviews for this bus
        const reviews = await getBusReviews(busId);

        if (reviews.length === 0) {
            return;
        }

        // Calculate average rating
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = Math.round((totalRating / reviews.length) * 10) / 10; // Round to 1 decimal

        // Update bus document
        const busRef = doc(db, BUSES_COLLECTION, busId);
        await updateDoc(busRef, {
            rating: averageRating,
            reviewCount: reviews.length,
        });
    } catch (error) {
        console.error('Error updating bus rating:', error);
        // Don't throw - this is a non-critical operation
    }
};

// Get average rating for a bus (calculated)
export const getBusAverageRating = async (busId: string): Promise<{ rating: number; count: number }> => {
    try {
        const reviews = await getBusReviews(busId);

        if (reviews.length === 0) {
            return { rating: 0, count: 0 };
        }

        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = Math.round((totalRating / reviews.length) * 10) / 10;

        return { rating: averageRating, count: reviews.length };
    } catch (error) {
        console.error('Error calculating bus rating:', error);
        throw error;
    }
};
