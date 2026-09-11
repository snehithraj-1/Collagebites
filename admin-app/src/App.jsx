import React from 'react';
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';

function AdminContent() {
  const { isAuthenticated, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#070B14] flex flex-col items-center justify-center space-y-4 text-white">
        <div className="w-12 h-12 rounded-full border-4 border-[#FF5722] border-t-transparent animate-spin" />
        <p className="text-xs font-bold text-slate-400">Loading CampusBites Operations Console...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AdminLoginPage />;
  }

  return <AdminDashboard />;
}

export default function App() {
  return (
    <AdminAuthProvider>
      <AdminContent />
    </AdminAuthProvider>
  );
}
