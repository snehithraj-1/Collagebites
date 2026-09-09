import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ShieldCheck, RefreshCw, LogOut, Power, Store, ShoppingBag, Bell, Volume2, VolumeX, ArrowRight, X, Menu, MoreVertical } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { DEFAULT_RESTAURANTS } from '../lib/campusSeedData';
import { useAdminAuth } from '../context/AdminAuthContext';
import { playAdminChime, sendAdminNotification, requestNotificationPermission } from '../lib/notificationSound';
import MetricsOverview from '../components/MetricsOverview';
import SystemToggle from '../components/SystemToggle';
import RestaurantToggles from '../components/RestaurantToggles';
import OrdersTable from '../components/OrdersTable';
import OrderDetailsModal from '../components/OrderDetailsModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import StudentsModal from '../components/StudentsModal';
import MenuManagerModal from '../components/MenuManagerModal';
import DeliveryPartnersModal from '../components/DeliveryPartnersModal';
import AdminSideMenuDrawer from '../components/AdminSideMenuDrawer';

export default function AdminDashboardPage() {
  const { profile, logout } = useAdminAuth();

  const [orders, setOrders] = useState([]);
  const [restaurants, setRestaurants] = useState(DEFAULT_RESTAURANTS);
  const [activeRestaurantTab, setActiveRestaurantTab] = useState('local-home-kitchen');
  const [orderingEnabled, setOrderingEnabled] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modals & Drawers state
  const [inspectingOrder, setInspectingOrder] = useState(null);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isStudentsModalOpen, setIsStudentsModalOpen] = useState(false);
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [deliveryPartners, setDeliveryPartners] = useState([]);
  const [isDeliveryPartnersModalOpen, setIsDeliveryPartnersModalOpen] = useState(false);
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);

  // New Order Notifications & Audio Alert
  const prevOrderIdsRef = useRef(new Set());
  const isFirstLoadRef = useRef(true);
  const [newOrderAlert, setNewOrderAlert] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const soundEnabledRef = useRef(soundEnabled);
  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  // Request browser notification permission on first admin interaction
  useEffect(() => {
    const handleFirstClick = () => {
      requestNotificationPermission();
      window.removeEventListener('click', handleFirstClick);
    };
    window.addEventListener('click', handleFirstClick);
    return () => window.removeEventListener('click', handleFirstClick);
  }, []);

  // 1. Load System Settings
  const loadSystemSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings/ordering');
      if (res.ok) {
        const json = await res.json();
        if (typeof json.ordering_enabled === 'boolean') {
          setOrderingEnabled(json.ordering_enabled);
          return;
        }
      }
    } catch (apiErr) {}

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('system_settings')
          .select('ordering_enabled')
          .eq('id', 'global')
          .single();

        if (error) throw error;
        if (data) setOrderingEnabled(data.ordering_enabled !== false);
      } catch (err) {
        console.warn('[Supabase Settings Fetch]:', err.message);
      }
    } else {
      try {
        const local = localStorage.getItem('cb_shared_ordering_enabled');
        if (local !== null) setOrderingEnabled(local === 'true');
      } catch {}
    }
  }, []);

  // 2. Load Restaurants
  const loadRestaurants = useCallback(async () => {
    try {
      const res = await fetch('/api/restaurants');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.restaurants) && json.restaurants.length > 0) {
          setRestaurants(json.restaurants);
          return;
        }
      }
    } catch (apiErr) {}

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('restaurants')
          .select('*')
          .order('created_at', { ascending: true });

        if (error) throw error;
        if (data && data.length > 0) setRestaurants(data);
      } catch (err) {
        console.warn('[Supabase Restaurants Fetch]:', err.message);
      }
    } else {
      try {
        const local = JSON.parse(localStorage.getItem('cb_shared_restaurants') || 'null');
        if (local && Array.isArray(local)) setRestaurants(local);
        else setRestaurants(DEFAULT_RESTAURANTS);
      } catch {
        setRestaurants(DEFAULT_RESTAURANTS);
      }
    }
  }, []);

  // Load Delivery Partners
  const loadDeliveryPartners = useCallback(async () => {
    try {
      const res = await fetch('/api/delivery-partners');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.partners)) {
          setDeliveryPartners(json.partners);
        }
      }
    } catch (err) {
      console.warn('[Fetch Delivery Partners Error]:', err.message);
    }
  }, []);

  // 3. Load Orders (scoped to active restaurant)
  const loadOrders = useCallback(async (silent = false, restaurantId = activeRestaurantTab) => {
    if (!silent) setIsRefreshing(true);

    try {
      const url = restaurantId && restaurantId !== 'all'
        ? `/api/orders?restaurant_id=${encodeURIComponent(restaurantId)}`
        : '/api/orders';
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.orders)) {
          setOrders(json.orders);
          setIsRefreshing(false);

          // Alert admin when a brand new order is placed
          if (!isFirstLoadRef.current) {
            const incoming = json.orders.filter(
              (o) => !prevOrderIdsRef.current.has(o.id) && o.status === 'CONFIRMED'
            );
            if (incoming.length > 0) {
              const latest = incoming[0];
              setNewOrderAlert(latest);

              if (soundEnabledRef.current) {
                playAdminChime('new_order');
              }

              sendAdminNotification(
                `🔔 New Order Received: #${latest.id}`,
                `${latest.student_name || 'Student'} placed an order (₹${latest.total_amount}) for delivery to SRM University Gate 3!`
              );
            }
          } else {
            isFirstLoadRef.current = false;
          }

          prevOrderIdsRef.current = new Set(json.orders.map((o) => o.id));
          return;
        }
      }
    } catch (apiErr) {
      // API offline, fallback to Supabase / local
    }

    if (isSupabaseConfigured() && supabase) {
      try {
        let query = supabase
          .from('orders')
          .select(`
            *,
            order_items (*)
          `)
          .order('created_at', { ascending: false });

        if (restaurantId && restaurantId !== 'all') {
          query = query.eq('restaurant_id', restaurantId);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          setOrders(data);
          setIsRefreshing(false);
          return;
        }
      } catch (err) {
        console.warn('[Supabase Admin Orders Fetch]:', err.message);
      }
    }

    // Local fallback
    try {
      const stored = JSON.parse(localStorage.getItem('cb_shared_orders') || '[]');
      const filtered = restaurantId && restaurantId !== 'all'
        ? stored.filter((o) => o.restaurant_id === restaurantId)
        : stored;
      setOrders(filtered);
    } catch {
      setOrders([]);
    } finally {
      setIsRefreshing(false);
    }
  }, [activeRestaurantTab]);

  // Initial Load & Realtime Subscriptions & Polling
  useEffect(() => {
    loadSystemSettings();
    loadRestaurants();
    loadDeliveryPartners();
    loadOrders();

    // Live Polling every 2s ensures instant order updates across ports
    const pollInterval = setInterval(() => {
      loadOrders(true);
    }, 2000);

    if (isSupabaseConfigured() && supabase) {
      // Realtime listener for incoming student orders
      const ordersChannel = supabase
        .channel('admin-realtime-orders')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
          loadOrders(true);
        })
        .subscribe();

      // Realtime listener for restaurant changes
      const restChannel = supabase
        .channel('admin-realtime-restaurants')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'restaurants' }, () => {
          loadRestaurants();
        })
        .subscribe();

      // Realtime listener for system settings
      const settingsChannel = supabase
        .channel('admin-realtime-settings')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'system_settings' }, (payload) => {
          if (payload.new && typeof payload.new.ordering_enabled === 'boolean') {
            setOrderingEnabled(payload.new.ordering_enabled);
          }
        })
        .subscribe();

      return () => {
        clearInterval(pollInterval);
        supabase.removeChannel(ordersChannel);
        supabase.removeChannel(restChannel);
        supabase.removeChannel(settingsChannel);
      };
    }

    return () => clearInterval(pollInterval);
  }, [loadSystemSettings, loadRestaurants, loadOrders]);

  // Action: Update Order Status (PREPARING, READY, OUT_FOR_DELIVERY, DELIVERED, CANCELLED)
  const handleUpdateStatus = async (orderId, nextStatus) => {
    if (!orderId || !nextStatus) return;

    // Optimistic UI update
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
    );
    // Always close inspecting modal so admin immediately goes back to the orders dashboard
    setInspectingOrder(null);

    // 1. Update in Shared Central Backend API (Vercel Serverless Function)
    try {
      await fetch('/api/orders/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: nextStatus })
      });
    } catch (e) {
      console.warn('[Shared Backend Status Error]:', e.message);
    }

    // 2. Update in Supabase if configured
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase
          .from('orders')
          .update({ status: nextStatus })
          .eq('id', orderId);
      } catch (err) {
        console.warn('[Supabase Status Update Error]:', err.message);
      }
    }

    // 3. Update localStorage fallback
    try {
      const stored = JSON.parse(localStorage.getItem('cb_shared_orders') || '[]');
      const updated = stored.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o));
      localStorage.setItem('cb_shared_orders', JSON.stringify(updated));
    } catch {}
  };

  // Action: Assign Delivery Partner to an Order
  const handleAssignPartner = async (orderId, partner) => {
    if (!orderId || !partner) return;

    // Optimistic UI update
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              delivery_partner_id: partner.id,
              delivery_partner_name: partner.name,
              delivery_partner_phone: partner.phone
            }
          : o
      )
    );
    setInspectingOrder((prev) =>
      prev && prev.id === orderId
        ? {
            ...prev,
            delivery_partner_id: partner.id,
            delivery_partner_name: partner.name,
            delivery_partner_phone: partner.phone
          }
        : prev
    );

    // Sync localStorage fallback
    try {
      const stored = JSON.parse(localStorage.getItem('cb_shared_orders') || '[]');
      const updated = stored.map((o) =>
        o.id === orderId
          ? { ...o, delivery_partner_id: partner.id, delivery_partner_name: partner.name, delivery_partner_phone: partner.phone }
          : o
      );
      localStorage.setItem('cb_shared_orders', JSON.stringify(updated));
    } catch {}

    // 1. Update in Shared Backend API
    try {
      await fetch('/api/orders/assign-partner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          partnerId: partner.id,
          partner_id: partner.id,
          partnerName: partner.name,
          partner_name: partner.name,
          partnerPhone: partner.phone,
          partner_phone: partner.phone,
          deliveryPartner: partner
        })
      });
    } catch (e) {
      console.warn('[Assign Partner Error]:', e.message);
    }
  };

  // Action: Unassign Delivery Partner from an Order
  const handleUnassignPartner = async (orderId) => {
    if (!orderId) return;

    // Optimistic UI update
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              delivery_partner_id: null,
              delivery_partner_name: null,
              delivery_partner_phone: null
            }
          : o
      )
    );
    setInspectingOrder((prev) =>
      prev && prev.id === orderId
        ? {
            ...prev,
            delivery_partner_id: null,
            delivery_partner_name: null,
            delivery_partner_phone: null
          }
        : prev
    );

    // Sync localStorage fallback
    try {
      const stored = JSON.parse(localStorage.getItem('cb_shared_orders') || '[]');
      const updated = stored.map((o) =>
        o.id === orderId
          ? { ...o, delivery_partner_id: null, delivery_partner_name: null, delivery_partner_phone: null }
          : o
      );
      localStorage.setItem('cb_shared_orders', JSON.stringify(updated));
    } catch {}

    // 1. Update in Shared Backend API
    try {
      await fetch('/api/orders/assign-partner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, unassign: true })
      });
    } catch (e) {
      console.warn('[Unassign Partner Error]:', e.message);
    }
  };

  // Action: Cancel Order
  const handleCancelOrder = async (order) => {
    if (!order) return;
    await handleUpdateStatus(order.id, 'CANCELLED');
  };

  // Action: Permanently Delete Order (after confirmation)
  const handleConfirmDelete = async (orderId) => {
    setIsDeleting(true);

    // Optimistic remove
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    if (inspectingOrder?.id === orderId) setInspectingOrder(null);

    // 1. Delete from Shared Backend API
    try {
      await fetch('/api/orders/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      });
    } catch (e) {
      console.warn('[Delete Order Error]:', e.message);
    }

    // 2. Delete from Supabase
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('orders').delete().eq('id', orderId);
      } catch (err) {
        console.warn('Delete order error:', err);
      }
    }

    // 3. Fallback local delete
    try {
      const stored = JSON.parse(localStorage.getItem('cb_shared_orders') || '[]');
      const updated = stored.filter((o) => o.id !== orderId);
      localStorage.setItem('cb_shared_orders', JSON.stringify(updated));
    } catch {}

    setIsDeleting(false);
    setOrderToDelete(null);
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100 pb-20">
      
      {/* Top Admin Navbar */}
      <header className="sticky top-0 z-40 bg-[#0F172A]/95 backdrop-blur-md border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          
          {/* Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-xl shadow-lg shadow-blue-500/20 border border-blue-400/30">
              🛡️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-black text-white font-['Outfit'] tracking-tight">
                  CampusBites Control
                </span>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-extrabold uppercase border border-blue-500/30">
                  Admin
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Neon PostgreSQL: <strong className="text-emerald-400">Connected</strong></span>
              </div>
            </div>
          </div>

          {/* Right Header Controls: Clean, Uncluttered with Three-Lines Menu Drawer */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Quick Audio Alert Chime Toggle */}
            <button
              onClick={() => {
                const next = !soundEnabled;
                setSoundEnabled(next);
                if (next) playAdminChime('test');
              }}
              className={`p-2 sm:px-3 sm:py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                soundEnabled
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
              title={soundEnabled ? 'Chime Alert is ON (Click to Mute)' : 'Chime Alert is MUTED (Click to Enable)'}
            >
              {soundEnabled ? <Volume2 size={15} className="text-emerald-400" /> : <VolumeX size={15} />}
              <span className="hidden md:inline">{soundEnabled ? 'Chime' : 'Muted'}</span>
            </button>

            {/* Quick Sync Button */}
            <button
              onClick={() => {
                loadOrders(false);
                loadRestaurants();
                loadSystemSettings();
              }}
              className="p-2 sm:p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
              title="Sync & Refresh Live Data"
            >
              <RefreshCw size={15} className={isRefreshing ? 'animate-spin text-blue-400' : ''} />
            </button>

            {/* THREE-LINES (☰) / THREE-DOTS (⋮) SIDE MENU BUTTON */}
            <button
              onClick={() => setIsSideMenuOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-blue-500/25 active:scale-95 border-none"
              title="Open Operations Menu (Delivery Partners, Menu, Students, etc.)"
            >
              <Menu size={18} />
              <span className="hidden sm:inline">Menu</span>
              {deliveryPartners.length > 0 && (
                <span className="px-1.5 py-0.2 bg-white/25 text-white rounded-full text-[10px] font-mono font-bold">
                  {deliveryPartners.length}
                </span>
              )}
            </button>
          </div>

        </div>
      </header>

      {/* Main Content Dashboard */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
        
        {/* 1. Metrics Counters */}
        <MetricsOverview
          orders={orders}
          restaurants={restaurants}
          orderingEnabled={orderingEnabled}
        />

        {/* 2. Overall Ordering Switch */}
        <SystemToggle
          orderingEnabled={orderingEnabled}
          onToggleSuccess={(nextState) => {
            setOrderingEnabled(nextState);
            setRestaurants((prev) => prev.map((r) => ({ ...r, is_open: nextState })));
            loadRestaurants();
          }}
        />

        {/* 3. Individual Restaurant Controls */}
        <RestaurantToggles
          restaurants={restaurants}
          orderingEnabled={orderingEnabled}
          onRestaurantUpdate={(restaurantId, nextState) => {
            setRestaurants((prev) =>
              prev.map((r) => (r.id === restaurantId ? { ...r, is_open: nextState } : r))
            );
          }}
        />

        {/* 4. Real-time Student Orders Table */}
        <OrdersTable
          orders={orders}
          activeRestaurantTab={activeRestaurantTab}
          onSelectRestaurantTab={(tab) => {
            setActiveRestaurantTab(tab);
            loadOrders(false, tab);
          }}
          restaurantName={
            activeRestaurantTab === 'local-home-kitchen'
              ? 'Local Home Kitchen'
              : activeRestaurantTab === 'clg-bites-biryani-nation'
              ? 'CLG Bites Biryani Nation'
              : 'All Restaurants'
          }
          onInspectOrder={(order) => setInspectingOrder(order)}
          onCancelOrder={handleCancelOrder}
          onPromptDeleteOrder={(order) => setOrderToDelete(order)}
        />

      </main>

      {/* Inspect Order Details Modal */}
      <OrderDetailsModal
        order={inspectingOrder}
        deliveryPartners={deliveryPartners}
        onAssignPartner={handleAssignPartner}
        onUnassignPartner={handleUnassignPartner}
        onOpenDeliveryPartners={() => setIsDeliveryPartnersModalOpen(true)}
        onClose={() => setInspectingOrder(null)}
        onUpdateStatus={handleUpdateStatus}
        onCancelOrder={handleCancelOrder}
        onDeleteOrder={(order) => setOrderToDelete(order)}
      />

      {/* Permanent Deletion Confirmation Modal */}
      <DeleteConfirmModal
        order={orderToDelete}
        isOpen={Boolean(orderToDelete)}
        onClose={() => setOrderToDelete(null)}
        onConfirmDelete={handleConfirmDelete}
        isDeleting={isDeleting}
      />

      {/* Delivery Partners Management Modal */}
      <DeliveryPartnersModal
        isOpen={isDeliveryPartnersModalOpen}
        onClose={() => setIsDeliveryPartnersModalOpen(false)}
        onPartnersChanged={loadDeliveryPartners}
      />

      {/* Student Database Records Modal */}
      <StudentsModal
        isOpen={isStudentsModalOpen}
        onClose={() => setIsStudentsModalOpen(false)}
      />

      {/* Menu & Dish Inventory Modal */}
      <MenuManagerModal
        isOpen={isMenuModalOpen}
        onClose={() => setIsMenuModalOpen(false)}
      />

      {/* Admin Three-Lines Operations Side Menu Drawer */}
      <AdminSideMenuDrawer
        isOpen={isSideMenuOpen}
        onClose={() => setIsSideMenuOpen(false)}
        profile={profile}
        soundEnabled={soundEnabled}
        onToggleSound={() => {
          const next = !soundEnabled;
          setSoundEnabled(next);
          if (next) playAdminChime('test');
        }}
        onOpenDeliveryPartners={() => setIsDeliveryPartnersModalOpen(true)}
        deliveryPartnersCount={deliveryPartners.length}
        onOpenMenuManager={() => setIsMenuModalOpen(true)}
        onOpenStudentsModal={() => setIsStudentsModalOpen(true)}
        onRefreshData={() => {
          loadOrders(false);
          loadRestaurants();
          loadSystemSettings();
        }}
        isRefreshing={isRefreshing}
        onLogout={logout}
      />

      {/* Floating Alert Banner for New Incoming Order */}
      {newOrderAlert && (
        <div className="fixed top-6 right-6 z-50 max-w-md w-full animate-slide-down">
          <div className="p-4 rounded-2xl bg-slate-900 border-2 border-emerald-500 shadow-2xl shadow-emerald-500/20 text-white flex flex-col gap-2.5 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-amber-400 to-blue-500 animate-pulse" />
            
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shrink-0 text-xl">
                  <Bell size={20} className="animate-bounce" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider border border-emerald-500/30">
                      New Live Order!
                    </span>
                    <span className="font-mono text-xs font-bold text-amber-400">
                      #{newOrderAlert.id}
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-white font-['Outfit'] mt-1">
                    {newOrderAlert.student_name} • ₹{newOrderAlert.total_amount}
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Drop: <strong className="text-emerald-400">SRM University Gate 3</strong>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setNewOrderAlert(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-800">
              <button
                onClick={() => {
                  setInspectingOrder(newOrderAlert);
                  setNewOrderAlert(null);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer"
              >
                <span>Inspect Order</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
