import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import CartDrawer from './components/CartDrawer';
import FoodDetailModal from './components/FoodDetailModal';
import SearchModal from './components/SearchModal';
import CheckoutModal from './components/CheckoutModal';
import HomePage from './pages/HomePage';
import VendorPage from './pages/VendorPage';
import OrderTrackingPage from './pages/OrderTrackingPage';
import ProfilePage from './pages/ProfilePage';
import { useCart } from './context/CartContext';
import { ChevronRight, Clock, Sparkles } from 'lucide-react';

export default function App() {
  // Navigation state: 'home' | 'vendor' | 'tracking' | 'profile'
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedVendorId, setSelectedVendorId] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const { 
    isCartOpen, 
    setIsCartOpen, 
    selectedFoodItem, 
    setSelectedFoodItem, 
    activeOrder,
    toast 
  } = useCart();

  // Scroll to top on page navigation
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage, selectedVendorId]);

  const handleNavigate = (page, vendorId = null) => {
    if (vendorId) {
      setSelectedVendorId(vendorId);
    }
    setCurrentPage(page);
  };

  const handleSelectVendor = (vendorOrId) => {
    const vId = typeof vendorOrId === 'object' && vendorOrId ? vendorOrId.id : vendorOrId;
    setSelectedVendorId(vId);
    setCurrentPage('vendor');
  };

  return (
    <div className="app-layout" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#FAF8F5' }}>
      {/* Top Navigation Bar */}
      <Navbar 
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1, paddingBottom: '70px' }}>
        {currentPage === 'home' && (
          <HomePage 
            onSelectVendor={handleSelectVendor}
            onOpenFoodDetail={(food) => setSelectedFoodItem(food)}
            onOpenFoodDetails={(food) => setSelectedFoodItem(food)}
            onOpenSearch={() => setIsSearchOpen(true)}
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'vendor' && (
          <VendorPage 
            vendorId={selectedVendorId}
            onBack={() => setCurrentPage('home')}
            onOpenFoodDetail={(food) => setSelectedFoodItem(food)}
          />
        )}

        {currentPage === 'tracking' && (
          <OrderTrackingPage 
            onNavigate={handleNavigate}
          />
        )}

        {currentPage === 'profile' && (
          <ProfilePage 
            onNavigate={handleNavigate}
          />
        )}
      </main>

      {/* Floating Active Order Live Pill (visible when active order exists and user is browsing other pages) */}
      {activeOrder && activeOrder.currentStage < 5 && currentPage !== 'tracking' && (
        <div 
          onClick={() => setCurrentPage('tracking')}
          style={{
            position: 'fixed',
            bottom: 84,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, #0F172A, #1E293B)',
            color: 'white',
            padding: '10px 20px',
            borderRadius: 30,
            boxShadow: '0 10px 30px rgba(15, 23, 42, 0.4), 0 0 0 1px rgba(255, 87, 34, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            cursor: 'pointer',
            zIndex: 90,
            animation: 'pulse 2s infinite',
            maxWidth: '90%',
            whiteSpace: 'nowrap'
          }}
        >
          <span style={{ fontSize: 20 }}>🛵</span>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#FF7A50' }}>
              Order #{activeOrder.id} in progress
            </span>
            <span style={{ fontSize: 11, color: '#94A3B8' }}>
              Stage {activeOrder.currentStage}/5 • Est. ~{activeOrder.estimatedMinutes || 20}m
            </span>
          </div>
          <ChevronRight size={18} color="#FF7A50" />
        </div>
      )}

      {/* Desktop & Tablet Footer */}
      <footer 
        style={{
          background: '#0F172A',
          color: '#94A3B8',
          padding: '48px 24px 80px',
          borderTop: '1px solid #1E293B',
          fontSize: 14
        }}
      >
        <div 
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 32,
            marginBottom: 36
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div 
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  background: 'linear-gradient(135deg, #FF5722, #FF8A65)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: 20
                }}
              >
                🍔
              </div>
              <span style={{ fontSize: 20, fontWeight: 800, color: 'white', letterSpacing: -0.5 }}>
                Campus<span style={{ color: '#FF5722' }}>Bites</span>
              </span>
            </div>
            <p style={{ lineHeight: 1.6, fontSize: 13, color: '#64748B' }}>
              The modern food ordering platform tailored for students, faculty, and campus vendors. Quick dorm delivery, transparent prep times, and zero hassle.
            </p>
          </div>

          <div>
            <h4 style={{ color: 'white', fontSize: 15, fontWeight: 700, marginBottom: 16 }}>
              Quick Navigation
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <li>
                <button 
                  onClick={() => setCurrentPage('home')}
                  style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0, fontSize: 13 }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#FF5722'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#94A3B8'}
                >
                  Explore Campus Menus
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setIsSearchOpen(true)}
                  style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0, fontSize: 13 }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#FF5722'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#94A3B8'}
                >
                  Search Biryani, Rolls & Shakes
                </button>
              </li>
              <li>
                <button 
                  onClick={() => setCurrentPage('profile')}
                  style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0, fontSize: 13 }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#FF5722'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#94A3B8'}
                >
                  Order History & Addresses
                </button>
              </li>
            </ul>
          </div>

          <div>
            <h4 style={{ color: 'white', fontSize: 15, fontWeight: 700, marginBottom: 16 }}>
              Campus Food Partners
            </h4>
            <p style={{ fontSize: 13, lineHeight: 1.6, color: '#64748B' }}>
              Featuring Hotel Bheemasena, Campus Roll Express, Khaana Peena Bites, Annapurna South Tiffins, and The Caffeine Lab.
            </p>
          </div>

          <div>
            <h4 style={{ color: 'white', fontSize: 15, fontWeight: 700, marginBottom: 16 }}>
              Delivery Locations
            </h4>
            <p style={{ fontSize: 13, lineHeight: 1.6, color: '#64748B' }}>
              Hostel Blocks A, B, C, D, Central Library, Dining Hall 1 & 2, Academic Blocks, and Main Gate.
            </p>
          </div>
        </div>

        {/* Required Unofficial Redesign Disclaimer */}
        <div 
          style={{
            borderTop: '1px solid #1E293B',
            paddingTop: 24,
            maxWidth: 1200,
            margin: '0 auto',
            textAlign: 'center',
            fontSize: 12,
            color: '#64748B',
            lineHeight: 1.6
          }}
        >
          <div style={{ marginBottom: 6, fontWeight: 600, color: '#94A3B8' }}>
            Unofficial UI/UX Redesign Concept. Created independently as a design and development demonstration. Not affiliated with or endorsed by any existing platform.
          </div>
          <div>
            © {new Date().getFullYear()} CampusBites Prototype • Built for Students with ❤️
          </div>
        </div>
      </footer>

      {/* Mobile Floating Bottom Bar */}
      <BottomNav 
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* Slide-over Shopping Cart */}
      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      {/* Food Detail Modal */}
      {selectedFoodItem && (
        <FoodDetailModal 
          foodItem={selectedFoodItem}
          onClose={() => setSelectedFoodItem(null)}
        />
      )}

      {/* Search Modal */}
      <SearchModal 
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectFood={(food) => setSelectedFoodItem(food)}
        onSelectVendor={handleSelectVendor}
      />

      {/* Checkout Modal */}
      <CheckoutModal 
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderSuccess={() => setCurrentPage('tracking')}
      />

      {/* Toast Notification */}
      {toast && (
        <div 
          style={{
            position: 'fixed',
            top: 24,
            right: 24,
            zIndex: 9999,
            background: toast.type === 'error' ? '#EF4444' : '#10B981',
            color: 'white',
            padding: '12px 20px',
            borderRadius: 14,
            boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            fontWeight: 600,
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            animation: 'fadeInDown 0.3s ease-out'
          }}
        >
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}
