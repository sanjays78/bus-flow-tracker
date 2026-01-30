import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import BusDetails from './pages/BusDetails';
import Unauthorized from './pages/Unauthorized';
import ProtectedRoute from './components/ProtectedRoute';
import RoleBasedRoute from './components/RoleBasedRoute';

// Lazy-load pages that will be created later
const BookingConfirmation = React.lazy(() => import('./pages/BookingConfirmation'));
const Checkout = React.lazy(() => import('./pages/Checkout'));
const MyBookings = React.lazy(() => import('./pages/MyBookings'));
const Profile = React.lazy(() => import('./pages/Profile'));
const BookingDetails = React.lazy(() => import('./pages/BookingDetails'));
const AdminDashboard = React.lazy(() => import('./pages/admin/AdminDashboard'));

function App() {
  return (
    <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected User Routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />

        <Route path="/bus/:id" element={
          <ProtectedRoute>
            <BusDetails />
          </ProtectedRoute>
        } />

        <Route path="/booking/confirm" element={
          <ProtectedRoute>
            <BookingConfirmation />
          </ProtectedRoute>
        } />

        <Route path="/checkout/:bookingId" element={
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        } />

        <Route path="/my-bookings" element={
          <ProtectedRoute>
            <MyBookings />
          </ProtectedRoute>
        } />

        <Route path="/booking/:id" element={
          <ProtectedRoute>
            <BookingDetails />
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />

        {/* Admin Routes */}
        <Route path="/admin/*" element={
          <RoleBasedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </RoleBasedRoute>
        } />
      </Routes>
    </React.Suspense>
  );
}

export default App;

