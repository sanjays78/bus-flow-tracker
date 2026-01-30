import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getBookingById, updateBookingStatus } from '../services/bookingService';
import { bookSeats } from '../services/bookingService';
import Header from '../components/Header';
import { Booking } from '../types';

const Checkout: React.FC = () => {
    const { bookingId } = useParams<{ bookingId: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [booking, setBooking] = useState<Booking | null>(location.state?.booking || null);
    const [loading, setLoading] = useState(!location.state?.booking);
    const [processing, setProcessing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'netbanking'>('card');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        const fetchBooking = async () => {
            if (!bookingId) {
                navigate('/');
                return;
            }

            if (!booking) {
                try {
                    const data = await getBookingById(bookingId);
                    if (!data) {
                        setError('Booking not found');
                        return;
                    }
                    setBooking(data);
                } catch (err) {
                    setError('Failed to load booking');
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchBooking();
    }, [bookingId, booking, navigate]);

    const handlePayment = async () => {
        if (!booking) return;

        setProcessing(true);
        setError('');

        try {
            // Simulate payment processing (2 seconds)
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Book the seats
            await bookSeats(booking.busId, booking.journeyDate, booking.selectedSeats);

            // Update booking status
            await updateBookingStatus(booking.id, 'confirmed', 'completed');

            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Payment failed. Please try again.');
        } finally {
            setProcessing(false);
        }
    };

    const handleLogin = () => navigate('/login');

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header user={user} onLogin={handleLogin} onLogout={logout} />
                <div className="container mx-auto px-4 py-20 text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                    <p className="mt-4 text-gray-600">Loading checkout...</p>
                </div>
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header user={user} onLogin={handleLogin} onLogout={logout} />
                <div className="container mx-auto px-4 py-20 text-center">
                    <div className="bg-white rounded-2xl p-10 shadow-lg max-w-md mx-auto">
                        <div className="text-6xl mb-4">🎉</div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
                        <p className="text-gray-600 mb-2">Booking Ref: <span className="font-bold">{booking?.bookingRef}</span></p>
                        <p className="text-gray-500 text-sm mb-6">
                            A confirmation email has been sent to your registered email.
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={() => navigate(`/booking/${booking?.id}`)}
                                className="w-full py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600"
                            >
                                View Booking Details
                            </button>
                            <button
                                onClick={() => navigate('/my-bookings')}
                                className="w-full py-3 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
                            >
                                Go to My Bookings
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error && !booking) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header user={user} onLogin={handleLogin} onLogout={logout} />
                <div className="container mx-auto px-4 py-20 text-center">
                    <div className="text-5xl mb-4">😕</div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{error}</h2>
                    <button onClick={() => navigate('/')} className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg">
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header user={user} onLogin={handleLogin} onLogout={logout} />

            <main className="container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Payment Methods */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Select Payment Method</h3>

                            <div className="space-y-3">
                                {[
                                    { id: 'card', label: 'Credit/Debit Card', icon: '💳' },
                                    { id: 'upi', label: 'UPI', icon: '📱' },
                                    { id: 'netbanking', label: 'Net Banking', icon: '🏦' },
                                ].map(method => (
                                    <label
                                        key={method.id}
                                        className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${paymentMethod === method.id
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="payment"
                                            value={method.id}
                                            checked={paymentMethod === method.id}
                                            onChange={() => setPaymentMethod(method.id as any)}
                                            className="w-4 h-4 text-blue-500"
                                        />
                                        <span className="text-2xl">{method.icon}</span>
                                        <span className="font-medium text-gray-900">{method.label}</span>
                                    </label>
                                ))}
                            </div>

                            {/* Placeholder Payment Form */}
                            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-yellow-700 text-sm">
                                    <span className="font-bold">Demo Mode:</span> This is a payment placeholder.
                                    Click "Pay Now" to simulate a successful payment.
                                </p>
                            </div>

                            <button
                                onClick={handlePayment}
                                disabled={processing}
                                className="w-full mt-6 py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {processing ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Processing Payment...
                                    </>
                                ) : (
                                    `Pay ₹${booking?.totalAmount}`
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>

                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Bus</span>
                                    <span className="font-medium">{booking?.busName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Route</span>
                                    <span className="font-medium">{booking?.source} → {booking?.destination}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Date</span>
                                    <span className="font-medium">{new Date(booking?.journeyDate || '').toLocaleDateString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Passengers</span>
                                    <span className="font-medium">{booking?.passengers.length}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Seats</span>
                                    <span className="font-medium">{booking?.selectedSeats.join(', ')}</span>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-900 font-bold">Total</span>
                                    <span className="text-2xl font-bold text-green-600">₹{booking?.totalAmount}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Checkout;
