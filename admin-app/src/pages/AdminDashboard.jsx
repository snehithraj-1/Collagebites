import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAdminAuth } from '../context/AdminAuthContext';
import { api } from '../services/api';
import { playAdminChime, requestNotificationPermission, sendAdminNotification } from '../lib/notificationSound';

import Navbar from '../components/Navbar';
import MetricsCards from '../components/MetricsCards';
import RestaurantStatus from '../components/RestaurantStatus';
import OrdersFilterBar from '../components/OrdersFilterBar';
import OrderCard from '../components/OrderCard';
import OrderDetailsModal from '../components/OrderDetailsModal';
import MenuManagerModal from '../components/MenuManagerModal';
import StudentsModal from '../components/StudentsModal';
import AdminSideDrawer from '../components/AdminSideDrawer';

export default function AdminDashboard() {
  const { profile, logout, isSuperAdmin, assignedRestaurantId } = useAdminAuth();

  // Core Data
  const [orders, setOrders] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [orderingEnabled, setOrderingEnabled] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [restaurantFilter, setRestaurantFilter] = useState(assignedRestaurantId || 'all');

  // Modals & Drawers
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isStudentsOpen, setIsStudentsOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Audio Alerts
  const [soundEnabled, setSoundEnabled] = useState(() => {
    return localStorage.getItem('cb_admin_sound') !== 'false';
  });
  const [newOrderAlert, setNewOrderAlert] = useState(null);

  // Order tracking to prevent duplicate audio alerts
  const knownOrderIdsRef = useRef(new Set());
  const isFirstLoadRef = useRef(true);

  // Toggle sound setting
  const handleToggleSound = () => {
    setSoundEnabled((prev) => {
      const next = !prev;
      localStorage.setItem('cb_admin_sound', next ? 'true' : 'false');
      if (next) {
        requestNotificationPermission();
        playAdminChime('test');
      }
      return next;
    });
  };

  // 1. Fetch Orders
  const loadOrders = useCallback(async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const data = await api.getOrders();
      if (Array.isArray(data)) {
        setOrders(data);

        // Check for genuine new orders if not the first load
        if (!isFirstLoadRef.current && soundEnabled) {
          const newOrders = data.filter((o) => !knownOrderIdsRef.current.has(o.id) && o.status === 'pending');
          if (newOrders.length > 0) {
            const latest = newOrders[0];
            playAdminChime('new_order');
            setNewOrderAlert(latest);
            sendAdminNotification(
              `🔔 New SRM Campus Order #${latest.id?.toString().slice(-6).toUpperCase()}`,
              `${latest.student_name || 'Student'} ordered ₹${latest.total_amount || latest.totalAmount}`
            );
          }
        }

        // Update known order IDs
        data.forEach((o) => knownOrderIdsRef.current.add(o.id));
        isFirstLoadRef.current = false;
      }
    } catch (err) {
      console.warn('Orders fetch error:', err.message);
    } finally {
      setIsRefreshing(false);
    }
  }, [soundEnabled]);

  // 2. Fetch Restaurants
  const loadRestaurants = useCallback(async () => {
    try {
      const data = await api.getRestaurants();
      if (Array.isArray(data)) {
        setRestaurants(data);
      }
    } catch (err) {
      console.warn('Restaurants fetch error:', err.message);
    }
  }, []);

  // 3. Fetch System Settings
  const loadSettings = useCallback(async () => {
    try {
      const data = await api.getSystemSettings();
      if (data && typeof data.ordering_enabled === 'boolean') {
        setOrderingEnabled(data.ordering_enabled);
      }
    } catch (err) {
      console.warn('Settings fetch error:', err.message);
    }
  }, []);

  // Synchronize all data
  const handleRefreshAll = () => {
    loadOrders();
    loadRestaurants();
    loadSettings();
  };

  // Initial load and live 2-second background polling
  useEffect(() => {
    handleRefreshAll();
    const interval = setInterval(() => {
      loadOrders(true);
    }, 2000);
    return () => clearInterval(interval);
  }, [loadOrders]);

  // Auto-dismiss new order banner after 6 seconds
  useEffect(() => {
    if (newOrderAlert) {
      const timer = setTimeout(() => setNewOrderAlert(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [newOrderAlert]);

  // Status progression action
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch (err) {
      alert(`Failed to update order status: ${err.message}`);
    }
  };

  // Delete action (for super admin)
  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to permanently delete this order record?')) return;
    try {
      await api.deleteOrder(orderId);
      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(null);
      }
    } catch (err) {
      alert(`Failed to delete order: ${err.message}`);
    }
  };

  // Filtered orders calculation
  const filteredOrders = orders.filter((o) => {
    // 1. Role Scope
    if (!isSuperAdmin && assignedRestaurantId && o.restaurant_id !== assignedRestaurantId) {
      return false;
    }

    // 2. Restaurant filter tab
    if (restaurantFilter !== 'all' && o.restaurant_id !== restaurantFilter) {
      return false;
    }

    // 3. Status filter tab
    if (statusFilter !== 'all' && (o.status || 'pending').toLowerCase() !== statusFilter) {
      return false;
    }

    // 4. Search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const studentName = (o.student_name || o.studentName || '').toLowerCase();
      const studentPhone = (o.student_phone || o.studentPhone || '').toLowerCase();
      const idStr = (o.id || '').toString().toLowerCase();
      const itemsMatch = Array.isArray(o.items) && o.items.some((i) => (i.name || i.dish_name || '').toLowerCase().includes(query));

      return studentName.includes(query) || studentPhone.includes(query) || idStr.includes(query) || itemsMatch;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 font-['Inter',sans-serif] flex flex-col">
      {/* Top Navigation */}
      <Navbar
        profile={profile}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onRefresh={handleRefreshAll}
        isRefreshing={isRefreshing}
        onOpenDrawer={() => setIsDrawerOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* New Order Floating Banner */}
        {newOrderAlert && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-xl shadow-orange-500/20 flex items-center justify-between gap-4 animate-bounce">
            <div>
              <div className="text-xs font-black uppercase tracking-wider">🔔 New Order Received!</div>
              <div className="text-sm font-bold mt-0.5">
                {newOrderAlert.student_name || 'Student'} • Total: ₹{newOrderAlert.total_amount || newOrderAlert.totalAmount}
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelectedOrder(newOrderAlert);
                setNewOrderAlert(null);
              }}
              className="px-3.5 py-1.5 rounded-xl bg-white text-slate-900 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer border-none"
            >
              View Order
            </button>
          </div>
        )}

        {/* 1. Analytics & KPI Cards */}
        <MetricsCards orders={orders} />

        {/* 2. Kitchen Availability & Emergency Switch */}
        <RestaurantStatus
          orderingEnabled={orderingEnabled}
          onToggleOrdering={(val) => setOrderingEnabled(val)}
          restaurants={restaurants}
          onRestaurantUpdated={(id, isOpen) => {
            setRestaurants((prev) =>
              prev.map((r) => (r.id === id ? { ...r, is_open: isOpen } : r))
            );
          }}
          isSuperAdmin={isSuperAdmin}
        />

        {/* 3. Orders Filters & Actions */}
        <OrdersFilterBar
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          restaurantFilter={restaurantFilter}
          onRestaurantChange={setRestaurantFilter}
          restaurants={restaurants}
          orders={orders}
          isSuperAdmin={isSuperAdmin}
        />

        {/* 4. Orders Grid */}
        {filteredOrders.length === 0 ? (
          <div className="bg-[#0F172A]/60 border border-slate-800/80 rounded-3xl p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center mx-auto text-xl">
              📦
            </div>
            <h3 className="text-base font-bold text-white">No Orders Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your search query or status filter to see other orders.'
                : 'No orders have been submitted yet. New orders will appear here automatically with live sound alerts.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onStatusUpdate={handleUpdateStatus}
                onViewDetails={(ord) => setSelectedOrder(ord)}
                onDeleteOrder={isSuperAdmin ? handleDeleteOrder : null}
              />
            ))}
          </div>
        )}
      </main>

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusUpdate={handleUpdateStatus}
        />
      )}

      {/* Menu & Stock Manager Modal */}
      <MenuManagerModal
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        restaurants={restaurants}
        assignedRestaurantId={assignedRestaurantId}
      />

      {/* Students Directory Modal */}
      <StudentsModal
        isOpen={isStudentsOpen}
        onClose={() => setIsStudentsOpen(false)}
      />

      {/* Side Control Drawer */}
      <AdminSideDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        profile={profile}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenMenuManager={() => setIsMenuOpen(true)}
        onOpenStudentsModal={() => setIsStudentsOpen(true)}
        onRefreshData={handleRefreshAll}
        isRefreshing={isRefreshing}
        onLogout={logout}
      />
    </div>
  );
}
