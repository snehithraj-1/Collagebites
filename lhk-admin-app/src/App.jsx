import React from 'react';
import { LhkAuthProvider, useLhkAuth } from './context/LhkAuthContext';
import LhkLoginPage from './pages/LhkLoginPage';
import LhkDashboardPage from './pages/LhkDashboardPage';
import ErrorBoundary from '../../admin-app/src/components/ErrorBoundary';

function LhkAppInner() {
  const { isAuthenticated, loading } = useLhkAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B1120] flex flex-col items-center justify-center space-y-4 text-white">
        <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
        <p className="text-xs font-bold text-slate-400">Loading Local Home Kitchen Portal...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LhkLoginPage />;
  }

  return (
    <ErrorBoundary>
      <LhkDashboardPage />
    </ErrorBoundary>
  );
}

export default function App() {
  return (
    <LhkAuthProvider>
      <LhkAppInner />
    </LhkAuthProvider>
  );
}
