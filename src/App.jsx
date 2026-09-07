import React, { useState, useEffect } from 'react';
import { useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import RoleSwitcherBar from './components/RoleSwitcherBar';
import CartDrawer from './components/CartDrawer';
import OrderConfirmationModal from './components/OrderConfirmationModal';
import StudentOrdersModal from './components/StudentOrdersModal';
import StudentLoginPage from './pages/StudentLoginPage';
import AdminLoginPage from './pages/AdminLoginPage';
import TwoRestaurantsPage from './pages/TwoRestaurantsPage';
import RestaurantMenuPage from './pages/RestaurantMenuPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import DeliveryLoginPage from './pages/DeliveryLoginPage';
import DeliveryDashboardPage from './pages/DeliveryDashboardPage';
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';

// Helper to parse order ID from URL pathname or hash
// Supports: /orders/:orderId, #/orders/:orderId, #tracking/:orderId
function parseTrackingOrderIdFromUrl() {
  if (typeof window === 'undefined') return null;
  const path = window.location.pathname;
  const hash = window.location.hash;

  const pathMatch = path.match(/\/orders\/([^/?#]+)/i);
  if (pathMatch) return decodeURIComponent(pathMatch[1]);

  const hashMatch = hash.match(/#(?:(?:\/)?orders\/|tracking\/)([^/?#]+)/i);
  if (hashMatch) return decodeURIComponent(hashMatch[1]);

  return null;
}

export default function App() {
  const {
    userRole,
    setUserRole,
    studentProfile,
    isAdminAuthenticated,
    deliveryPartnerProfile,
    loginDeliveryPartner,
    logoutDeliveryPartner,
    switchRole,
    toast
  } = useApp();

  const initialOrderId = parseTrackingOrderIdFromUrl();

  // Internal page navigation for student: 'restaurants' | 'menu' | 'tracking'
  const [currentView, setCurrentView] = useState(() => (initialOrderId ? 'tracking' : 'restaurants'));
  const [selectedRestaurantId, setSelectedRestaurantId] = useState('local-home-kitchen');
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState(() => initialOrderId);

  // Sync URL hash or path with admin route
  const [isAdminRoute, setIsAdminRoute] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.location.pathname.toLowerCase().includes('/admin') || window.location.hash.toLowerCase().includes('admin');
  });

  // Sync URL hash or path with delivery courier route
  const [isDeliveryRoute, setIsDeliveryRoute] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.location.pathname.toLowerCase().includes('/delivery') || window.location.hash.toLowerCase().includes('delivery');
  });

  useEffect(() => {
    const handleUrlChange = () => {
      const isPathAdmin = window.location.pathname.toLowerCase().includes('/admin');
      const isHashAdmin = window.location.hash.toLowerCase().includes('admin');
      setIsAdminRoute(isPathAdmin || isHashAdmin);

      const isPathDelivery = window.location.pathname.toLowerCase().includes('/delivery');
      const isHashDelivery = window.location.hash.toLowerCase().includes('delivery');
      setIsDeliveryRoute(isPathDelivery || isHashDelivery);

      const parsedOrderId = parseTrackingOrderIdFromUrl();
      if (parsedOrderId) {
        setTrackingOrderId(parsedOrderId);
        setCurrentView('tracking');
      } else if (currentView === 'tracking' && !window.location.pathname.includes('/orders/')) {
        setTrackingOrderId(null);
        setCurrentView('restaurants');
      }
    };

    window.addEventListener('hashchange', handleUrlChange);
    window.addEventListener('popstate', handleUrlChange);

    return () => {
      window.removeEventListener('hashchange', handleUrlChange);
      window.removeEventListener('popstate', handleUrlChange);
    };
  }, [currentView]);

  // Scroll to top on view changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView, selectedRestaurantId, trackingOrderId]);

  const handleSelectRestaurant = (restaurantId) => {
    setSelectedRestaurantId(restaurantId);
    setCurrentView('menu');
  };

  const handleBackToRestaurants = () => {
    setCurrentView('restaurants');
  };

  const handleNavigateToTracking = (orderId) => {
    setTrackingOrderId(orderId);
    setCurrentView('tracking');
    setIsOrdersModalOpen(false);
    if (typeof window !== 'undefined' && window.history && window.history.pushState) {
      window.history.pushState(null, '', `/orders/${orderId}`);
    }
  };

  const handleBackToHome = () => {
    setTrackingOrderId(null);
    setCurrentView('restaurants');
    if (typeof window !== 'undefined' && window.history && window.history.pushState) {
      window.history.pushState(null, '', '/');
    }
  };

  const handleNavigate = (page) => {
    if (page === 'orders') {
      setIsOrdersModalOpen(true);
    } else if (page === 'restaurants') {
      handleBackToHome();
    }
  };

  // Deterministic portal resolution:
  // If URL explicitly indicates a role, that takes precedence over stale state
  let activePortal = 'student';
  if (isDeliveryRoute) {
    activePortal = 'delivery';
  } else if (isAdminRoute) {
    activePortal = 'admin';
  } else if (userRole === 'delivery' || userRole === 'delivery_partner') {
    activePortal = 'delivery';
  } else if (userRole === 'admin' || userRole === 'admin_login') {
    activePortal = 'admin';
  } else {
    activePortal = 'student';
  }

  // 1. ADMIN FLOW
  if (activePortal === 'admin') {
    if (isAdminAuthenticated) {
      return (
        <div className="min-h-screen bg-[#0F172A] flex flex-col">
          <RoleSwitcherBar activePortal={activePortal} />
          <div className="flex-1">
            <AdminDashboardPage 
              onSwitchToStudentView={() => switchRole('student')}
              onSwitchToDelivery={() => switchRole('delivery')}
            />
          </div>
          {renderToast(toast)}
        </div>
      );
    }

    // Admin login view if not authenticated
    return (
      <div className="min-h-screen bg-[#0F172A] flex flex-col">
        <RoleSwitcherBar activePortal={activePortal} />
        <div className="flex-1 flex flex-col justify-center">
          <AdminLoginPage 
            onSwitchToStudent={() => switchRole('student')}
            onSwitchToDelivery={() => switchRole('delivery')}
          />
        </div>
        {renderToast(toast)}
      </div>
    );
  }

  // 2. DELIVERY PARTNER FLOW
  if (activePortal === 'delivery') {
    if (deliveryPartnerProfile) {
      return (
        <div className="min-h-screen bg-[#0F172A] flex flex-col">
          <RoleSwitcherBar activePortal={activePortal} />
          <div className="flex-1">
            <DeliveryDashboardPage
              partner={deliveryPartnerProfile}
              onLogout={() => {
                logoutDeliveryPartner();
                switchRole('student');
              }}
              onSwitchToStudent={() => switchRole('student')}
              onSwitchToAdmin={() => switchRole('admin')}
            />
          </div>
          {renderToast(toast)}
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#0F172A] flex flex-col">
        <RoleSwitcherBar activePortal={activePortal} />
        <div className="flex-1 flex flex-col justify-center">
          <DeliveryLoginPage
            onLoginSuccess={(partner) => {
              loginDeliveryPartner(partner);
            }}
            onSwitchToStudent={() => switchRole('student')}
            onSwitchToAdmin={() => switchRole('admin')}
          />
        </div>
        {renderToast(toast)}
      </div>
    );
  }

  // 3. STUDENT NOT LOGGED IN -> STUDENT LOGIN VIEW
  if (!studentProfile || userRole !== 'student') {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col">
        <RoleSwitcherBar activePortal={activePortal} />
        <div className="flex-1 flex flex-col justify-center">
          <StudentLoginPage 
            onSwitchToAdmin={() => switchRole('admin')}
            onSwitchToDelivery={() => switchRole('delivery')}
          />
        </div>
        {renderToast(toast)}
      </div>
    );
  }

  // 4. AUTHENTICATED STUDENT VIEW
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5]">
      {/* Universal Top Multi-Role Switcher */}
      <RoleSwitcherBar activePortal={activePortal} />

      {/* Universal Top Navigation */}
      <Navbar 
        onNavigate={handleNavigate}
        onOpenSearch={() => {}}
      />

      {/* Main Student Experience */}
      <main className="flex-1 pb-16">
        {currentView === 'tracking' && trackingOrderId ? (
          <OrderTrackingPage 
            orderId={trackingOrderId}
            onNavigateHome={handleBackToHome}
          />
        ) : currentView === 'restaurants' ? (
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
      <OrderConfirmationModal 
        onTrackOrder={handleNavigateToTracking}
      />

      {/* Student Past Orders Modal */}
      <StudentOrdersModal 
        isOpen={isOrdersModalOpen}
        onClose={() => setIsOrdersModalOpen(false)}
        onTrackOrder={handleNavigateToTracking}
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
          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-4 sm:gap-6">
            <button
              onClick={() => {
                window.location.hash = 'delivery';
                setIsDeliveryRoute(true);
                switchRole('delivery');
              }}
              className="hover:text-white transition-colors cursor-pointer border-none bg-transparent text-[#FF8A65] font-extrabold flex items-center gap-1"
            >
              <span>🛵 Delivery Partner Portal</span>
            </button>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <button
              onClick={() => switchRole('admin')}
              className="hover:text-white transition-colors cursor-pointer border-none bg-transparent text-slate-400 font-semibold"
            >
              Admin Management Portal
            </button>
            <span className="text-slate-600 hidden sm:inline">•</span>
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
