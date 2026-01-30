import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createBooking } from '../services/bookingService';
import Header from '../components/Header';
import { Bus, Passenger, Gender } from '../types';

interface PassengerFormData {
    name: string;
    age: string;
    gender: Gender;
}

const BookingConfirmation: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, userData, logout } = useAuth();

    const [passengers, setPassengers] = useState<PassengerFormData[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Get booking data from navigation state
    const { busId, bus, selectedSeats, journeyDate, totalAmount } = location.state || {};

    useEffect(() => {
        // Redirect if no booking data
        if (!busId || !selectedSeats || selectedSeats.length === 0) {
            navigate('/');
            return;
        }

        // Initialize passenger forms for each seat
        setPassengers(
            selectedSeats.map((seat: string) => ({
                name: '',
                age: '',
                gender: 'M' as Gender,
            }))
        );
    }, [busId, selectedSeats, navigate]);

    const handlePassengerChange = (index: number, field: keyof PassengerFormData, value: string) => {
        setPassengers(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const validateForm = (): boolean => {
        for (let i = 0; i < passengers.length; i++) {
            if (!passengers[i].name.trim()) {
                setError(`Please enter name for passenger ${i + 1}`);
                return false;
            }
            if (!passengers[i].age || parseInt(passengers[i].age) < 1 || parseInt(passengers[i].age) > 120) {
                setError(`Please enter valid age for passenger ${i + 1}`);
                return false;
            }
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) return;

        setLoading(true);
        try {
            // Format passengers with seat numbers
            const formattedPassengers: Passenger[] = passengers.map((p, idx) => ({
                name: p.name.trim(),
                age: parseInt(p.age),
                gender: p.gender,
                seatNumber: selectedSeats[idx],
            }));

            // Create booking
            const booking = await createBooking(
                user!.uid,
                busId,
                {
                    source: bus.source,
                    destination: bus.destination,
                    journeyDate,
                    departureTime: bus.departureTime,
                    arrivalTime: bus.arrivalTime,
                    busName: bus.name,
                    busType: bus.type,
                    price: bus.price,
                },
                formattedPassengers,
                selectedSeats
            );

            // Navigate to checkout
            navigate(`/checkout/${booking.id}`, {
                state: { booking }
            });
        } catch (err: any) {
            console.error('Booking error:', err);
            setError(err.message || 'Failed to create booking. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = () => navigate('/login');

    if (!bus) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header user={user} onLogin={handleLogin} onLogout={logout} />
                <div className="container mx-auto px-4 py-20 text-center">
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header user={user} onLogin={handleLogin} onLogout={logout} />

            <main className="container mx-auto px-4 py-8">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-blue-500 mb-6"
                >
                    ← Back
                </button>

                <h1 className="text-2xl font-bold text-gray-900 mb-6">Passenger Details</h1>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Passenger Forms */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                {passengers.map((passenger, index) => (
                                    <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-bold text-gray-900">
                                                Passenger {index + 1}
                                            </h3>
                                            <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">
                                                Seat {selectedSeats[index]}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Full Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={passenger.name}
                                                    onChange={(e) => handlePassengerChange(index, 'name', e.target.value)}
                                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="Enter full name"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Age *
                                                </label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="120"
                                                    value={passenger.age}
                                                    onChange={(e) => handlePassengerChange(index, 'age', e.target.value)}
                                                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="Age"
                                                    required
                                                />
                                            </div>

                                            <div className="md:col-span-3">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Gender *
                                                </label>
                                                <div className="flex gap-4">
                                                    {[{ value: 'M', label: 'Male' }, { value: 'F', label: 'Female' }, { value: 'O', label: 'Other' }].map(opt => (
                                                        <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name={`gender-${index}`}
                                                                value={opt.value}
                                                                checked={passenger.gender === opt.value}
                                                                onChange={(e) => handlePassengerChange(index, 'gender', e.target.value as Gender)}
                                                                className="w-4 h-4 text-blue-500"
                                                            />
                                                            <span className="text-gray-700">{opt.label}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Contact Info */}
                            <div className="mt-6 bg-white rounded-xl p-6 shadow-sm">
                                <h3 className="font-bold text-gray-900 mb-4">Contact Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                        <input
                                            type="email"
                                            value={userData?.email || user?.email || ''}
                                            disabled
                                            className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                        <input
                                            type="tel"
                                            value={userData?.phone || ''}
                                            disabled
                                            className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full mt-6 py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Processing...' : `Proceed to Payment - ₹${totalAmount}`}
                            </button>
                        </form>
                    </div>

                    {/* Booking Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">Trip Summary</h3>

                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Bus</span>
                                    <span className="font-medium">{bus.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Route</span>
                                    <span className="font-medium">{bus.source} → {bus.destination}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Date</span>
                                    <span className="font-medium">{new Date(journeyDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Time</span>
                                    <span className="font-medium">{bus.departureTime} - {bus.arrivalTime}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Seats</span>
                                    <span className="font-medium">{selectedSeats.join(', ')}</span>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-900 font-bold">Total</span>
                                    <span className="text-2xl font-bold text-blue-600">₹{totalAmount}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default BookingConfirmation;
