import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getBookingById } from '../services/bookingService';
import { hasUserReviewed, createReview } from '../services/reviewService';
import Header from '../components/Header';
import { Booking } from '../types';

const BookingDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, userData, logout } = useAuth();

    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);
    const [hasReviewed, setHasReviewed] = useState(false);
    const [showReviewForm, setShowReviewForm] = useState(false);
    const [reviewData, setReviewData] = useState({ rating: 5, review: '' });
    const [submittingReview, setSubmittingReview] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;

            try {
                const data = await getBookingById(id);
                setBooking(data);

                if (data) {
                    const reviewed = await hasUserReviewed(id);
                    setHasReviewed(reviewed);
                }
            } catch (error) {
                console.error('Error fetching booking:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleSubmitReview = async () => {
        if (!booking || !user || !userData) return;

        setSubmittingReview(true);
        try {
            await createReview(
                user.uid,
                userData.name || 'Anonymous',
                booking.busId,
                booking.id,
                reviewData.rating,
                reviewData.review
            );
            setHasReviewed(true);
            setShowReviewForm(false);
        } catch (error) {
            alert('Failed to submit review');
        } finally {
            setSubmittingReview(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-700',
            confirmed: 'bg-green-100 text-green-700',
            cancelled: 'bg-red-100 text-red-700',
            completed: 'bg-blue-100 text-blue-700',
        };
        return styles[status] || 'bg-gray-100 text-gray-700';
    };

    const handleLogin = () => navigate('/login');

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header user={user} onLogin={handleLogin} onLogout={logout} />
                <div className="container mx-auto px-4 py-20 text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                </div>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header user={user} onLogin={handleLogin} onLogout={logout} />
                <div className="container mx-auto px-4 py-20 text-center">
                    <div className="text-5xl mb-4">😕</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking not found</h2>
                    <button
                        onClick={() => navigate('/my-bookings')}
                        className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg"
                    >
                        Go to My Bookings
                    </button>
                </div>
            </div>
        );
    }

    const canReview = booking.status === 'confirmed' &&
        new Date(booking.journeyDate) < new Date() &&
        !hasReviewed;

    return (
        <div className="min-h-screen bg-gray-50">
            <Header user={user} onLogin={handleLogin} onLogout={logout} />

            <main className="container mx-auto px-4 py-8 max-w-2xl">
                <button
                    onClick={() => navigate('/my-bookings')}
                    className="flex items-center gap-2 text-gray-600 hover:text-blue-500 mb-6"
                >
                    ← Back to My Bookings
                </button>

                {/* Booking Card */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white/80 text-sm">Booking Reference</p>
                                <p className="text-2xl font-bold">{booking.bookingRef}</p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-sm font-bold ${getStatusBadge(booking.status)}`}>
                                {booking.status.toUpperCase()}
                            </span>
                        </div>
                    </div>

                    <div className="p-6">
                        {/* Trip Info */}
                        <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-100">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-gray-900">{booking.departureTime}</p>
                                <p className="text-gray-600">{booking.source}</p>
                            </div>
                            <div className="flex-1 px-4">
                                <div className="border-t-2 border-dashed border-gray-300 relative">
                                    <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-gray-400">
                                        🚌
                                    </span>
                                </div>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-gray-900">{booking.arrivalTime}</p>
                                <p className="text-gray-600">{booking.destination}</p>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Bus</span>
                                <span className="font-medium">{booking.busName}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Type</span>
                                <span className="font-medium">{booking.busType}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Date</span>
                                <span className="font-medium">
                                    {new Date(booking.journeyDate).toLocaleDateString('en-IN', {
                                        weekday: 'long',
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Seats</span>
                                <span className="font-medium">{booking.selectedSeats.join(', ')}</span>
                            </div>
                        </div>

                        {/* Passengers */}
                        <div className="mt-6 pt-6 border-t border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-4">Passengers</h3>
                            <div className="space-y-2">
                                {booking.passengers.map((passenger, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                        <div>
                                            <p className="font-medium">{passenger.name}</p>
                                            <p className="text-sm text-gray-500">
                                                {passenger.age} yrs • {passenger.gender === 'M' ? 'Male' : passenger.gender === 'F' ? 'Female' : 'Other'}
                                            </p>
                                        </div>
                                        <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                                            Seat {passenger.seatNumber}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Payment */}
                        <div className="mt-6 pt-6 border-t border-gray-100">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-900 font-bold text-lg">Total Paid</span>
                                <span className="text-2xl font-bold text-green-600">₹{booking.totalAmount}</span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                Payment Status: <span className={`font-medium ${booking.paymentStatus === 'completed' ? 'text-green-600' : 'text-yellow-600'
                                    }`}>
                                    {(booking.paymentStatus || 'pending').toUpperCase()}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Review Section */}
                {canReview && (
                    <div className="mt-6 bg-white rounded-xl p-6 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-4">Rate Your Trip</h3>

                        {showReviewForm ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <button
                                                key={star}
                                                onClick={() => setReviewData(prev => ({ ...prev, rating: star }))}
                                                className={`text-3xl transition-colors ${star <= reviewData.rating ? 'text-yellow-400' : 'text-gray-300'
                                                    }`}
                                            >
                                                ★
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Review</label>
                                    <textarea
                                        value={reviewData.review}
                                        onChange={(e) => setReviewData(prev => ({ ...prev, review: e.target.value }))}
                                        className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                                        rows={3}
                                        placeholder="Share your experience..."
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleSubmitReview}
                                        disabled={submittingReview}
                                        className="flex-1 py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
                                    >
                                        {submittingReview ? 'Submitting...' : 'Submit Review'}
                                    </button>
                                    <button
                                        onClick={() => setShowReviewForm(false)}
                                        className="px-6 py-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowReviewForm(true)}
                                className="w-full py-3 bg-yellow-400 text-gray-900 font-bold rounded-lg hover:bg-yellow-500"
                            >
                                ⭐ Write a Review
                            </button>
                        )}
                    </div>
                )}

                {hasReviewed && (
                    <div className="mt-6 bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                        <span className="text-green-600 font-medium">✓ You've already reviewed this trip</span>
                    </div>
                )}
            </main>
        </div>
    );
};

export default BookingDetails;
