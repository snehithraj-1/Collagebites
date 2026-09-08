import React, { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, RefreshCw, LogOut, Power, Store, ShoppingBag } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { DEFAULT_RESTAURANTS } from '../lib/campusSeedData';
import { useAdminAuth } from '../context/AdminAuthContext';
import MetricsOverview from '../components/MetricsOverview';
import SystemToggle from '../components/SystemToggle';
import RestaurantToggles from '../components/RestaurantToggles';
import OrdersTable from '../components/OrdersTable';
import OrderDetailsModal from '../components/OrderDetailsModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

export default function AdminDashboardPage() {
  const { profile, logout } = useAdminAuth();

  const [orders, setOrders] = useState([]);
  const [restaurants, setRestaurants] = useState(DEFAULT_RESTAURANTS);
  const [orderingEnabled, setOrderingEnabled] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modals state
  const [inspectingOrder, setInspectingOrder] = useState(null);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 1. Load System Settings
  const loadSystemSettings = useCallback(async () => {
    if (!isSupabaseConfigured() || !supabase) {
      try {
        const local = localStorage.getItem('cb_shared_ordering_enabled');
        if (local !== null) setOrderingEnabled(local === 'true');
      } catch {}
      return;
    }

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
  }, []);

  // 2. Load Restaurants
  const loadRestaurants = useCallback(async () => {
    if (!isSupabaseConfigured() || !supabase) {
      try {
        const local = JSON.parse(localStorage.getItem('cb_shared_restaurants') || 'null');
        if (local && Array.isArray(local)) setRestaurants(local);
        else setRestaurants(DEFAULT_RESTAURANTS);
      } catch {
        setRestaurants(DEFAULT_RESTAURANTS);
      }
      return;
    }

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
  }, []);

  // 3. Load All Orders
  const loadOrders = useCallback(async (silent = false) => {
    if (!silent) setIsRefreshing(true);

    if (!isSupabaseConfigured() || !supabase) {
      try {
        const stored = JSON.parse(localStorage.getItem('cb_shared_orders') || '[]');
        setOrders(stored);
      } catch {
        setOrders([]);
      }
      setIsRefreshing(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.warn('[Supabase Admin Orders Fetch]:', err.message);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Initial Load & Realtime Subscriptions
  useEffect(() => {
    loadSystemSettings();
    loadRestaurants();
    loadOrders();

    if (isSupabaseConfigured() && supabase) {
      // Realtime listener for incoming student orders
      const ordersChannel = supabase
        .channel('admin-realtime-orders')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
          console.log('[Realtime Order Event]:', payload.eventType);
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
        supabase.removeChannel(ordersChannel);
        supabase.removeChannel(restChannel);
        supabase.removeChannel(settingsChannel);
      };
    } else {
      // Local fallback interval
      const interval = setInterval(() => {
        loadOrders(true);
        loadRestaurants();
        loadSystemSettings();
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [loadSystemSettings, loadRestaurants, loadOrders]);

  // Action: Cancel Order
  const handleCancelOrder = async (order) => {
    if (!order) return;

    if (!isSupabaseConfigured() || !supabase) {
      // Local fallback
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: 'CANCELLED' } : o))
      );
      try {
        const stored = JSON.parse(localStorage.getItem('cb_shared_orders') || '[]');
        const updated = stored.map((o) => (o.id === order.id ? { ...o, status: 'CANCELLED' } : o));
        localStorage.setItem('cb_shared_orders', JSON.stringify(updated));
      } catch {}
      return;
    }

    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: 'CANCELLED' })
        .eq('id', order.id);

      if (error) throw error;
      loadOrders(true);
    } catch (err) {
      console.error('Cancel order error:', err);
      alert('Failed to cancel order: ' + err.message);
    }
  };

  // Action: Permanently Delete Order (after confirmation)
  const handleConfirmDelete = async (orderId) => {
    setIsDeleting(true);

    if (!isSupabaseConfigured() || !supabase) {
      // Local fallback
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      try {
        const stored = JSON.parse(localStorage.getItem('cb_shared_orders') || '[]');
        const updated = stored.filter((o) => o.id !== orderId);
        localStorage.setItem('cb_shared_orders', JSON.stringify(updated));
      } catch {}
      setIsDeleting(false);
      setOrderToDelete(null);
      return;
    }

    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (error) throw error;
      setOrderToDelete(null);
      loadOrders(true);
    } catch (err) {
      console.error('Delete order error:', err);
      alert('Failed to delete order: ' + err.message);
    } finally {
      setIsDeleting(false);
    }
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
              <p className="text-[11px] text-slate-400">
                Shared Supabase Database Management
              </p>
            </div>
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                loadOrders(false);
                loadRestaurants();
                loadSystemSettings();
              }}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
              title="Sync & Refresh Data"
            >
              <RefreshCw size={15} className={isRefreshing ? 'animate-spin text-blue-400' : ''} />
            </button>

            <div className="hidden sm:block text-right text-xs">
              <div className="font-extrabold text-white leading-tight">
                {profile?.name || 'Administrator'}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                {profile?.email}
              </div>
            </div>

            <button
              onClick={logout}
              className="px-3.5 py-2 rounded-xl bg-rose-950/50 hover:bg-rose-900/80 text-rose-300 text-xs font-bold transition-colors cursor-pointer border border-rose-800 flex items-center gap-1.5"
              title="Sign Out"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Sign Out</span>
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
          onToggleSuccess={(nextState) => setOrderingEnabled(nextState)}
        />

        {/* 3. Individual Restaurant Controls */}
        <RestaurantToggles
          restaurants={restaurants}
          onRestaurantUpdate={(restaurantId, nextState) => {
            setRestaurants((prev) =>
              prev.map((r) => (r.id === restaurantId ? { ...r, is_open: nextState } : r))
            );
          }}
        />

        {/* 4. Real-time Student Orders Table */}
        <OrdersTable
          orders={orders}
          onInspectOrder={(order) => setInspectingOrder(order)}
          onCancelOrder={handleCancelOrder}
          onPromptDeleteOrder={(order) => setOrderToDelete(order)}
        />

      </main>

      {/* Inspect Order Details Modal */}
      <OrderDetailsModal
        order={inspectingOrder}
        onClose={() => setInspectingOrder(null)}
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

    </div>
  );
}
