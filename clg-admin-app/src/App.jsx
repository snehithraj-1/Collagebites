import React from 'react';
import { ClgAuthProvider, useClgAuth } from './context/ClgAuthContext';
import ClgLoginPage from './pages/ClgLoginPage';
import ClgDashboardPage from './pages/ClgDashboardPage';
import ErrorBoundary from '../../admin-app/src/components/ErrorBoundary';

function ClgAppInner() {
  const { isAuthenticated, loading } = useClgAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1120] flex flex-col items-center justify-center space-y-4 text-white">
        <div className="w-12 h-12 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
        <p className="text-xs font-bold text-slate-400">Loading CLG Bites Portal...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <ClgLoginPage />;
  }

  return (
    <ErrorBoundary>
      <ClgDashboardPage />
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <ClgAuthProvider>
      <ClgAppInner />
    </ClgAuthProvider>
  );
}
