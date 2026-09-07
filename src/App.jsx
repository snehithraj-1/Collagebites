import React, { useState, useEffect } from 'react';
import { useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import CartDrawer from './components/CartDrawer';
import OrderConfirmationModal from './components/OrderConfirmationModal';
import StudentOrdersModal from './components/StudentOrdersModal';
import StudentLoginPage from './pages/StudentLoginPage';
import AdminLoginPage from './pages/AdminLoginPage';
import TwoRestaurantsPage from './pages/TwoRestaurantsPage';
import RestaurantMenuPage from './pages/RestaurantMenuPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';

export default function App() {
  const {
    userRole,
    setUserRole,
    studentProfile,
    isAdminAuthenticated,
    switchRole,
    toast
  } = useApp();

  // Internal page navigation for student: 'restaurants' | 'menu'
  const [currentView, setCurrentView] = useState('restaurants');
  const [selectedRestaurantId, setSelectedRestaurantId] = useState('local-home-kitchen');
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);

  // Sync URL hash or path with admin route
  useEffect(() => {
    const checkAdminRoute = () => {
      const isPathAdmin = window.location.pathname.toLowerCase().includes('/admin');
      const isHashAdmin = window.location.hash.toLowerCase().includes('admin');
      if ((isPathAdmin || isHashAdmin) && userRole !== 'admin') {
        if (isAdminAuthenticated) {
          setUserRole('admin');
        } else {
          setUserRole('admin_login');
        }
      }
    };

    checkAdminRoute();
    window.addEventListener('hashchange', checkAdminRoute);
    window.addEventListener('popstate', checkAdminRoute);

    return () => {
      window.removeEventListener('hashchange', checkAdminRoute);
      window.removeEventListener('popstate', checkAdminRoute);
    };
  }, [userRole, isAdminAuthenticated, setUserRole]);

  // Scroll to top on view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView, selectedRestaurantId]);

  const handleSelectRestaurant = (restaurantId) => {
    setSelectedRestaurantId(restaurantId);
    setCurrentView('menu');
  };

  const handleBackToRestaurants = () => {
    setCurrentView('restaurants');
  };

  const handleNavigate = (page) => {
    if (page === 'orders') {
      setIsOrdersModalOpen(true);
    } else if (page === 'restaurants') {
      setCurrentView('restaurants');
    }
  };

  // 1. ADMIN LOGIN VIEW
  if (userRole === 'admin_login' || (!userRole && window.location.hash === '#admin')) {
    return (
      <>
        <AdminLoginPage onSwitchToStudent={() => setUserRole('student')} />
        {renderToast(toast)}
      </>
    );
  }

  // 2. ADMIN DASHBOARD VIEW (Protected)
  if (userRole === 'admin' && isAdminAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0F172A]">
        <AdminDashboardPage 
          onSwitchToStudentView={() => setUserRole('student')} 
        />
        {renderToast(toast)}
      </div>
    );
  }

  // 3. STUDENT NOT LOGGED IN -> STUDENT LOGIN VIEW
  if (!studentProfile || userRole !== 'student') {
    return (
      <>
        <StudentLoginPage onSwitchToAdmin={() => switchRole('admin')} />
        {renderToast(toast)}
      </>
    );
  }

  // 4. AUTHENTICATED STUDENT VIEW
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      {/* Universal Top Navigation */}
      <Navbar 
        onNavigate={handleNavigate}
        onOpenSearch={() => {}}
      />

      {/* Main Student Experience */}
      <main className="flex-1 pb-16">
        {currentView === 'restaurants' ? (
          <TwoRestaurantsPage 
            onSelectRestaurant={handleSelectRestaurant} 
          />
        ) : (
          <RestaurantMenuPage
            restaurantId={selectedRestaurantId}
            onBack={handleBackToRestaurants}
          />
        )}
      </main>

      {/* Cart Drawer */}
      <CartDrawer />

      {/* 30-Second Confirmation Modal */}
      <OrderConfirmationModal />

      {/* Student Past Orders Modal */}
      <StudentOrdersModal 
        isOpen={isOrdersModalOpen}
        onClose={() => setIsOrdersModalOpen(false)}
      />

      {/* Toast Notification Container */}
      {renderToast(toast)}

      {/* Professional Footer */}
      <footer className="bg-[#0F172A] text-slate-400 py-10 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <span className="font-extrabold text-white font-['Outfit'] text-base">CampusBites</span>
            <p className="text-slate-500 mt-0.5">SRM-AP Campus Food Ordering & Delivery Network</p>
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={() => switchRole('admin')}
              className="hover:text-white transition-colors cursor-pointer border-none bg-transparent text-slate-400 font-semibold"
            >
              Admin Management Portal
            </button>
            <span className="text-slate-600">•</span>
            <span>Neerukonda, Amaravati, AP</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Helper Toast Renderer
function renderToast(toast) {
  if (!toast) return null;

  const isError = toast.type === 'error';
  const isInfo = toast.type === 'info';

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
      <div className={`px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-bold border backdrop-blur-md ${
        isError 
          ? 'bg-rose-950/90 text-rose-200 border-rose-800/80 shadow-rose-950/40'
          : isInfo 
          ? 'bg-slate-900/90 text-slate-200 border-slate-700 shadow-slate-950/40'
          : 'bg-emerald-950/90 text-emerald-200 border-emerald-800/80 shadow-emerald-950/40'
      }`}>
        {isError ? (
          <XCircle size={16} className="text-rose-400 flex-shrink-0" />
        ) : isInfo ? (
          <Info size={16} className="text-blue-400 flex-shrink-0" />
        ) : (
          <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
        )}
        <span>{toast.message}</span>
      </div>
    </div>
  );
}
