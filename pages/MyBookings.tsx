import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserBookings, cancelBooking } from '../services/bookingService';
import Header from '../components/Header';
import { Booking } from '../types';

const MyBookings: React.FC = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');

    useEffect(() => {
        const fetchBookings = async () => {
            if (!user) return;

            try {
                const data = await getUserBookings(user.uid);
                setBookings(data);
            } catch (error) {
                console.error('Error fetching bookings:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, [user]);

    const handleCancel = async (bookingId: string) => {
        if (!user) return;
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;

        try {
            await cancelBooking(bookingId, user.uid);
            // Refresh bookings
            const data = await getUserBookings(user.uid);
            setBookings(data);
        } catch (error: any) {
            alert(error.message || 'Failed to cancel booking');
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

    const filteredBookings = bookings.filter(booking => {
        if (filter === 'all') return true;
        if (filter === 'upcoming') {
            return booking.status === 'confirmed' && new Date(booking.journeyDate) >= new Date();
        }
        return booking.status === filter;
    });

    const handleLogin = () => navigate('/login');

    return (
        <div className="min-h-screen bg-gray-50">
            <Header user={user} onLogin={handleLogin} onLogout={logout} />

            <main className="container mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
                    <button
                        onClick={() => navigate('/')}
                        className="text-blue-500 hover:text-blue-600 font-medium"
                    >
                        + Book New Trip
                    </button>
                </div>

                {/* Filter Tabs */}
                <div className="flex gap-2 mb-6 overflow-x-auto">
                    {['all', 'upcoming', 'confirmed', 'cancelled'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setFilter(tab as any)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${filter === tab
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-white text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="text-center py-20">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                        <p className="mt-4 text-gray-600">Loading your bookings...</p>
                    </div>
                ) : filteredBookings.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-5xl mb-4">🎫</div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">No bookings found</h2>
                        <p className="text-gray-600 mb-6">
                            {filter === 'all'
                                ? "You haven't made any bookings yet"
                                : `No ${filter} bookings`}
                        </p>
                        <button
                            onClick={() => navigate('/')}
                            className="px-6 py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600"
                        >
                            Book a Trip
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredBookings.map(booking => (
                            <div
                                key={booking.id}
                                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                onClick={() => navigate(`/booking/${booking.id}`)}
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="font-bold text-gray-900">{booking.busName}</h3>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getStatusBadge(booking.status)}`}>
                                                {booking.status.toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                            <span>{booking.source} → {booking.destination}</span>
                                            <span>•</span>
                                            <span>{new Date(booking.journeyDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                            <span>•</span>
                                            <span>{booking.departureTime}</span>
                                        </div>
                                        <div className="mt-2 text-sm text-gray-500">
                                            <span>Booking Ref: <span className="font-medium">{booking.bookingRef}</span></span>
                                            <span className="mx-2">•</span>
                                            <span>Seats: <span className="font-medium">{booking.selectedSeats.join(', ')}</span></span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-sm text-gray-500">Total Amount</p>
                                            <p className="text-xl font-bold text-gray-900">₹{booking.totalAmount}</p>
                                        </div>

                                        {booking.status === 'confirmed' && new Date(booking.journeyDate) > new Date() && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleCancel(booking.id);
                                                }}
                                                className="px-4 py-2 text-red-500 border border-red-200 rounded-lg hover:bg-red-50 font-medium"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default MyBookings;
