import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAllBookings } from '../../services/bookingService';
import { getAllBuses, createBus, updateBus, deleteBus } from '../../services/busService';
import Header from '../../components/Header';
import { Booking, Bus } from '../../types';

// ===================== DASHBOARD HOME =====================
const DashboardHome: React.FC = () => {
    const [stats, setStats] = useState({
        totalBookings: 0,
        totalRevenue: 0,
        totalBuses: 0,
        confirmedBookings: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [bookings, buses] = await Promise.all([
                    getAllBookings(),
                    getAllBuses(),
                ]);

                const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
                const totalRevenue = confirmedBookings.reduce((sum, b) => sum + b.totalAmount, 0);

                setStats({
                    totalBookings: bookings.length,
                    confirmedBookings: confirmedBookings.length,
                    totalRevenue,
                    totalBuses: buses.length,
                });
            } catch (error) {
                console.error('Error fetching stats:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return <div className="text-center py-10">Loading stats...</div>;
    }

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <p className="text-gray-500 text-sm">Total Bookings</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalBookings}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <p className="text-gray-500 text-sm">Confirmed</p>
                    <p className="text-3xl font-bold text-green-600">{stats.confirmedBookings}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <p className="text-gray-500 text-sm">Total Revenue</p>
                    <p className="text-3xl font-bold text-blue-600">₹{stats.totalRevenue.toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <p className="text-gray-500 text-sm">Active Buses</p>
                    <p className="text-3xl font-bold text-purple-600">{stats.totalBuses}</p>
                </div>
            </div>

            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link to="/admin/bookings" className="bg-blue-50 p-6 rounded-xl hover:bg-blue-100 transition-colors">
                    <span className="text-3xl block mb-2">📋</span>
                    <span className="font-bold text-gray-900">Manage Bookings</span>
                </Link>
                <Link to="/admin/buses" className="bg-green-50 p-6 rounded-xl hover:bg-green-100 transition-colors">
                    <span className="text-3xl block mb-2">🚌</span>
                    <span className="font-bold text-gray-900">Manage Buses</span>
                </Link>
                <Link to="/admin/users" className="bg-purple-50 p-6 rounded-xl hover:bg-purple-100 transition-colors">
                    <span className="text-3xl block mb-2">👥</span>
                    <span className="font-bold text-gray-900">Manage Users</span>
                </Link>
            </div>
        </div>
    );
};

// ===================== BOOKINGS MANAGEMENT =====================
const BookingsManagement: React.FC = () => {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const data = await getAllBookings();
                setBookings(data);
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, []);

    const filteredBookings = bookings.filter(b => filter === 'all' || b.status === filter);

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            pending: 'bg-yellow-100 text-yellow-700',
            confirmed: 'bg-green-100 text-green-700',
            cancelled: 'bg-red-100 text-red-700',
        };
        return styles[status] || 'bg-gray-100 text-gray-700';
    };

    if (loading) return <div className="text-center py-10">Loading bookings...</div>;

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Booking Management</h2>

            <div className="flex gap-2 mb-6">
                {['all', 'pending', 'confirmed', 'cancelled'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setFilter(tab)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium ${filter === tab ? 'bg-blue-500 text-white' : 'bg-white text-gray-600'
                            }`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Ref</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Route</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Date</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Passengers</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Amount</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredBookings.map(booking => (
                            <tr key={booking.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium">{booking.bookingRef}</td>
                                <td className="px-4 py-3">{booking.source} → {booking.destination}</td>
                                <td className="px-4 py-3">{new Date(booking.journeyDate).toLocaleDateString()}</td>
                                <td className="px-4 py-3">{booking.passengers.length}</td>
                                <td className="px-4 py-3 font-bold">₹{booking.totalAmount}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusBadge(booking.status)}`}>
                                        {booking.status.toUpperCase()}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredBookings.length === 0 && (
                    <div className="text-center py-10 text-gray-500">No bookings found</div>
                )}
            </div>
        </div>
    );
};

// ===================== BUS MANAGEMENT =====================
const BusManagement: React.FC = () => {
    const [buses, setBuses] = useState<Bus[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingBus, setEditingBus] = useState<Bus | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        busNumber: '',
        source: '',
        destination: '',
        departureTime: '',
        arrivalTime: '',
        type: 'AC Sleeper',
        price: '',
        availableSeats: '40',
        rating: '4.0',
    });

    useEffect(() => {
        fetchBuses();
    }, []);

    const fetchBuses = async () => {
        try {
            const data = await getAllBuses();
            setBuses(data);
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const busData = {
                ...formData,
                price: parseFloat(formData.price),
                availableSeats: parseInt(formData.availableSeats),
                rating: parseFloat(formData.rating),
            };

            if (editingBus) {
                await updateBus(editingBus.id, busData);
            } else {
                await createBus(busData as any);
            }

            setShowForm(false);
            setEditingBus(null);
            setFormData({
                name: '', busNumber: '', source: '', destination: '',
                departureTime: '', arrivalTime: '', type: 'AC Sleeper',
                price: '', availableSeats: '40', rating: '4.0',
            });
            fetchBuses();
        } catch (error) {
            alert('Failed to save bus');
        }
    };

    const handleEdit = (bus: Bus) => {
        setEditingBus(bus);
        setFormData({
            name: bus.name,
            busNumber: bus.busNumber,
            source: bus.source,
            destination: bus.destination,
            departureTime: bus.departureTime,
            arrivalTime: bus.arrivalTime,
            type: bus.type,
            price: bus.price.toString(),
            availableSeats: bus.availableSeats.toString(),
            rating: bus.rating.toString(),
        });
        setShowForm(true);
    };

    const handleDelete = async (busId: string) => {
        if (!window.confirm('Delete this bus?')) return;
        try {
            await deleteBus(busId);
            fetchBuses();
        } catch (error) {
            alert('Failed to delete bus');
        }
    };

    if (loading) return <div className="text-center py-10">Loading buses...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Bus Management</h2>
                <button
                    onClick={() => setShowForm(true)}
                    className="px-4 py-2 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600"
                >
                    + Add Bus
                </button>
            </div>

            {showForm && (
                <div className="bg-white rounded-xl p-6 shadow-sm mb-6">
                    <h3 className="font-bold mb-4">{editingBus ? 'Edit Bus' : 'Add New Bus'}</h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                        <input
                            type="text"
                            placeholder="Bus Name"
                            value={formData.name}
                            onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                            className="p-3 border rounded-lg"
                            required
                        />
                        <input
                            type="text"
                            placeholder="Bus Number"
                            value={formData.busNumber}
                            onChange={e => setFormData(p => ({ ...p, busNumber: e.target.value }))}
                            className="p-3 border rounded-lg"
                            required
                        />
                        <input
                            type="text"
                            placeholder="Source"
                            value={formData.source}
                            onChange={e => setFormData(p => ({ ...p, source: e.target.value }))}
                            className="p-3 border rounded-lg"
                            required
                        />
                        <input
                            type="text"
                            placeholder="Destination"
                            value={formData.destination}
                            onChange={e => setFormData(p => ({ ...p, destination: e.target.value }))}
                            className="p-3 border rounded-lg"
                            required
                        />
                        <input
                            type="text"
                            placeholder="Departure Time"
                            value={formData.departureTime}
                            onChange={e => setFormData(p => ({ ...p, departureTime: e.target.value }))}
                            className="p-3 border rounded-lg"
                            required
                        />
                        <input
                            type="text"
                            placeholder="Arrival Time"
                            value={formData.arrivalTime}
                            onChange={e => setFormData(p => ({ ...p, arrivalTime: e.target.value }))}
                            className="p-3 border rounded-lg"
                            required
                        />
                        <select
                            value={formData.type}
                            onChange={e => setFormData(p => ({ ...p, type: e.target.value }))}
                            className="p-3 border rounded-lg"
                        >
                            <option>AC Sleeper</option>
                            <option>AC Seater</option>
                            <option>Non-AC Sleeper</option>
                            <option>Non-AC Seater</option>
                        </select>
                        <input
                            type="number"
                            placeholder="Price"
                            value={formData.price}
                            onChange={e => setFormData(p => ({ ...p, price: e.target.value }))}
                            className="p-3 border rounded-lg"
                            required
                        />
                        <div className="col-span-2 flex gap-3">
                            <button type="submit" className="flex-1 py-3 bg-blue-500 text-white font-bold rounded-lg">
                                {editingBus ? 'Update' : 'Add'} Bus
                            </button>
                            <button
                                type="button"
                                onClick={() => { setShowForm(false); setEditingBus(null); }}
                                className="px-6 py-3 border rounded-lg"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Name</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Route</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Type</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Price</th>
                            <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {buses.map(bus => (
                            <tr key={bus.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 font-medium">{bus.name}</td>
                                <td className="px-4 py-3">{bus.source} → {bus.destination}</td>
                                <td className="px-4 py-3">{bus.type}</td>
                                <td className="px-4 py-3 font-bold">₹{bus.price}</td>
                                <td className="px-4 py-3">
                                    <button
                                        onClick={() => handleEdit(bus)}
                                        className="text-blue-500 hover:underline mr-3"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(bus.id)}
                                        className="text-red-500 hover:underline"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// ===================== USER MANAGEMENT (Placeholder) =====================
const UserManagement: React.FC = () => {
    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">User Management</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
                <span className="text-4xl block mb-2">🚧</span>
                <p className="text-yellow-700">User management coming soon</p>
            </div>
        </div>
    );
};

// ===================== MAIN ADMIN DASHBOARD =====================
const AdminDashboard: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();

    const handleLogin = () => navigate('/login');

    const navItems = [
        { path: '/admin', label: 'Overview', icon: '📊' },
        { path: '/admin/bookings', label: 'Bookings', icon: '📋' },
        { path: '/admin/buses', label: 'Buses', icon: '🚌' },
        { path: '/admin/users', label: 'Users', icon: '👥' },
    ];

    return (
        <div className="min-h-screen bg-gray-100">
            <Header user={user} onLogin={handleLogin} onLogout={logout} />

            <div className="flex">
                {/* Sidebar */}
                <aside className="w-64 bg-white shadow-sm min-h-[calc(100vh-64px)] p-4">
                    <h2 className="font-bold text-gray-900 mb-4 px-3">Admin Panel</h2>
                    <nav className="space-y-1">
                        {navItems.map(item => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${location.pathname === item.path
                                        ? 'bg-blue-50 text-blue-600'
                                        : 'text-gray-600 hover:bg-gray-50'
                                    }`}
                            >
                                <span>{item.icon}</span>
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        ))}
                    </nav>
                    <div className="mt-6 pt-6 border-t">
                        <Link
                            to="/"
                            className="flex items-center gap-3 px-3 py-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                        >
                            <span>🏠</span>
                            <span className="font-medium">Back to App</span>
                        </Link>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-6">
                    <Routes>
                        <Route index element={<DashboardHome />} />
                        <Route path="bookings" element={<BookingsManagement />} />
                        <Route path="buses" element={<BusManagement />} />
                        <Route path="users" element={<UserManagement />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;
