import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import Header from '../components/Header';

const Profile: React.FC = () => {
    const navigate = useNavigate();
    const { user, userData, logout } = useAuth();

    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: userData?.name || '',
        phone: userData?.phone || '',
    });
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await updateDoc(doc(db, 'users', user.uid), {
                name: formData.name.trim(),
                phone: formData.phone.trim(),
                updatedAt: serverTimestamp(),
            });

            setSuccess('Profile updated successfully!');
            setEditing(false);
        } catch (err) {
            setError('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = () => navigate('/login');

    return (
        <div className="min-h-screen bg-gray-50">
            <Header user={user} onLogin={handleLogin} onLogout={logout} />

            <main className="container mx-auto px-4 py-8 max-w-2xl">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

                {success && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-600">
                        {success}
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
                        {error}
                    </div>
                )}

                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    {/* Profile Header */}
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-8">
                        <div className="flex items-center gap-4">
                            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                                <span className="text-4xl font-bold text-white">
                                    {(userData?.name || user?.email || 'U').charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white">
                                    {userData?.name || 'User'}
                                </h2>
                                <p className="text-white/80">{user?.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Profile Form */}
                    <form onSubmit={handleSubmit} className="p-6">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={user?.email || ''}
                                    disabled
                                    className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    disabled={!editing}
                                    className={`w-full p-3 border border-gray-200 rounded-lg ${editing ? 'focus:ring-2 focus:ring-blue-500' : 'bg-gray-50'
                                        }`}
                                    placeholder="Enter your full name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    disabled={!editing}
                                    className={`w-full p-3 border border-gray-200 rounded-lg ${editing ? 'focus:ring-2 focus:ring-blue-500' : 'bg-gray-50'
                                        }`}
                                    placeholder="Enter your phone number"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <input
                                    type="text"
                                    value={(userData?.role || 'user').toUpperCase()}
                                    disabled
                                    className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex gap-3">
                            {editing ? (
                                <>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="flex-1 py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 disabled:bg-gray-300"
                                    >
                                        {loading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditing(false);
                                            setFormData({
                                                name: userData?.name || '',
                                                phone: userData?.phone || '',
                                            });
                                        }}
                                        className="px-6 py-3 border border-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                </>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setEditing(true)}
                                    className="flex-1 py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600"
                                >
                                    Edit Profile
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Quick Links */}
                <div className="mt-6 grid grid-cols-2 gap-4">
                    <button
                        onClick={() => navigate('/my-bookings')}
                        className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow text-left"
                    >
                        <span className="text-2xl mb-2 block">🎫</span>
                        <span className="font-medium text-gray-900">My Bookings</span>
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow text-left"
                    >
                        <span className="text-2xl mb-2 block">🔍</span>
                        <span className="font-medium text-gray-900">Search Buses</span>
                    </button>
                </div>
            </main>
        </div>
    );
};

export default Profile;
