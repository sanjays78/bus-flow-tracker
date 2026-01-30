import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getBusById } from '../services/busService';
import { getBookedSeats } from '../services/bookingService';
import { getBusReviews } from '../services/reviewService';
import SeatLayout from '../components/SeatLayout';
import Header from '../components/Header';
import { Bus, Review, SeatLayout as SeatLayoutType } from '../types';

const DEFAULT_LAYOUT: SeatLayoutType = {
    rows: 10,
    seatsPerRow: 4,
    aisleAfter: 2,
};

const BusDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [bus, setBus] = useState<Bus | null>(null);
    const [bookedSeats, setBookedSeats] = useState<string[]>([]);
    const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [journeyDate, setJourneyDate] = useState<string>(() => {
        // Default to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    });

    useEffect(() => {
        const fetchBusData = async () => {
            if (!id) return;

            setLoading(true);
            try {
                const busData = await getBusById(id);
                if (!busData) {
                    setError('Bus not found');
                    return;
                }
                setBus(busData);

                // Fetch booked seats for the journey date
                const booked = await getBookedSeats(id, journeyDate);
                setBookedSeats(booked);

                // Fetch reviews
                const busReviews = await getBusReviews(id, 5);
                setReviews(busReviews);
            } catch (err) {
                console.error('Error fetching bus details:', err);
                setError('Failed to load bus details');
            } finally {
                setLoading(false);
            }
        };

        fetchBusData();
    }, [id, journeyDate]);

    const handleSeatClick = (seatId: string) => {
        setSelectedSeats(prev => {
            if (prev.includes(seatId)) {
                return prev.filter(s => s !== seatId);
            }
            return [...prev, seatId];
        });
    };

    const handleDateChange = async (newDate: string) => {
        setJourneyDate(newDate);
        setSelectedSeats([]); // Clear selection when date changes
        if (id) {
            const booked = await getBookedSeats(id, newDate);
            setBookedSeats(booked);
        }
    };

    const handleProceedToBooking = () => {
        if (selectedSeats.length === 0) return;

        // Navigate to booking confirmation with state
        navigate('/booking/confirm', {
            state: {
                busId: id,
                bus,
                selectedSeats,
                journeyDate,
                totalAmount: (bus?.price || 0) * selectedSeats.length,
            }
        });
    };

    const handleLogin = () => navigate('/login');

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header user={user} onLogin={handleLogin} onLogout={logout} />
                <div className="container mx-auto px-4 py-20 text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                    <p className="mt-4 text-gray-600">Loading bus details...</p>
                </div>
            </div>
        );
    }

    if (error || !bus) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header user={user} onLogin={handleLogin} onLogout={logout} />
                <div className="container mx-auto px-4 py-20 text-center">
                    <div className="text-5xl mb-4">😕</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        {error || 'Bus not found'}
                    </h2>
                    <button
                        onClick={() => navigate('/')}
                        className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                    >
                        Back to Search
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header user={user} onLogin={handleLogin} onLogout={logout} />

            <main className="container mx-auto px-4 py-8">
                {/* Back button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-blue-500 mb-6"
                >
                    ← Back to results
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Bus Info & Seats */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Bus Header */}
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">{bus.name}</h1>
                                    <p className="text-gray-500">{bus.busNumber}</p>
                                </div>
                                <div className="flex items-center gap-1 bg-green-50 px-3 py-1 rounded-full">
                                    <span className="text-yellow-500">★</span>
                                    <span className="font-bold text-green-700">{bus.rating}</span>
                                </div>
                            </div>

                            {/* Route */}
                            <div className="mt-6 flex items-center gap-4">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-gray-900">{bus.departureTime}</p>
                                    <p className="text-gray-600">{bus.source}</p>
                                </div>
                                <div className="flex-1 relative">
                                    <div className="border-t-2 border-dashed border-gray-300"></div>
                                    <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2 text-xs text-gray-400">
                                        {bus.type}
                                    </span>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-gray-900">{bus.arrivalTime}</p>
                                    <p className="text-gray-600">{bus.destination}</p>
                                </div>
                            </div>

                            {/* Amenities */}
                            {bus.amenities && bus.amenities.length > 0 && (
                                <div className="mt-6 pt-6 border-t border-gray-100">
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Amenities</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {bus.amenities.map((amenity, idx) => (
                                            <span key={idx} className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
                                                {amenity}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Date Selection */}
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Journey Date</h3>
                            <input
                                type="date"
                                value={journeyDate}
                                onChange={(e) => handleDateChange(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>

                        {/* Seat Layout */}
                        <SeatLayout
                            layout={bus.seatLayout || DEFAULT_LAYOUT}
                            bookedSeats={bookedSeats}
                            selectedSeats={selectedSeats}
                            onSeatClick={handleSeatClick}
                            maxSelection={6}
                            busType={bus.type}
                        />

                        {/* Reviews */}
                        {reviews.length > 0 && (
                            <div className="bg-white rounded-xl p-6 shadow-sm">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Reviews</h3>
                                <div className="space-y-4">
                                    {reviews.map((review) => (
                                        <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium text-gray-900">{review.userName}</span>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-yellow-500">★</span>
                                                    <span className="text-sm text-gray-600">{review.rating}</span>
                                                </div>
                                            </div>
                                            <p className="mt-2 text-gray-600 text-sm">{review.review}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Booking Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Booking Summary</h3>

                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Date</span>
                                    <span className="font-medium">{new Date(journeyDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Seats</span>
                                    <span className="font-medium">{selectedSeats.length > 0 ? selectedSeats.join(', ') : '-'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Price per seat</span>
                                    <span className="font-medium">₹{bus.price}</span>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-900 font-bold">Total Amount</span>
                                    <span className="text-2xl font-bold text-blue-600">
                                        ₹{bus.price * selectedSeats.length}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={handleProceedToBooking}
                                disabled={selectedSeats.length === 0}
                                className={`
                                    w-full mt-6 py-3 rounded-lg font-bold text-white
                                    transition-all duration-200
                                    ${selectedSeats.length > 0
                                        ? 'bg-blue-500 hover:bg-blue-600 cursor-pointer'
                                        : 'bg-gray-300 cursor-not-allowed'}
                                `}
                            >
                                {selectedSeats.length > 0
                                    ? `Book ${selectedSeats.length} Seat${selectedSeats.length > 1 ? 's' : ''}`
                                    : 'Select Seats to Continue'}
                            </button>

                            <p className="mt-3 text-xs text-gray-400 text-center">
                                Seats will be held for 10 minutes after selection
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default BusDetails;
