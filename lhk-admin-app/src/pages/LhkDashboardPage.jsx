import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RefreshCw, LogOut, Power, Bike, Volume2, VolumeX, Bell, CheckCircle2, X } from 'lucide-react';
import { useLhkAuth } from '../context/LhkAuthContext';
import OrdersTable from '../../../admin-app/src/components/OrdersTable';
import OrderDetailsModal from '../../../admin-app/src/components/OrderDetailsModal';
import DeliveryPartnersModal from '../../../admin-app/src/components/DeliveryPartnersModal';
import DeleteConfirmModal from '../../../admin-app/src/components/DeleteConfirmModal';
import ErrorBoundary from '../../../admin-app/src/components/ErrorBoundary';
import { playAdminChime, sendAdminNotification, requestNotificationPermission } from '../../../admin-app/src/lib/notificationSound';

export default function LhkDashboardPage() {
  const { profile, logout } = useLhkAuth();

  const [orders, setOrders] = useState([]);
  const [restaurant, setRestaurant] = useState({ id: 'local-home-kitchen', name: 'Local Home Kitchen', is_open: true });
  const [deliveryPartners, setDeliveryPartners] = useState([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  // Sound and Notification Alerts
  const [soundEnabled, setSoundEnabled] = useState(true);
  const soundEnabledRef = useRef(soundEnabled);
  const prevOrdersMapRef = useRef(new Map());
  const isFirstLoadRef = useRef(true);
  const [newOrderAlert, setNewOrderAlert] = useState(null);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  // Auto-dismiss alert banner after 7 seconds
  useEffect(() => {
    if (!newOrderAlert) return;
    const timer = setTimeout(() => setNewOrderAlert(null), 7000);
    return () => clearTimeout(timer);
  }, [newOrderAlert]);

  // Request browser notification permission on first user click
  useEffect(() => {
    const handleFirstClick = () => {
      requestNotificationPermission();
      window.removeEventListener('click', handleFirstClick);
    };
    window.addEventListener('click', handleFirstClick);
    return () => window.removeEventListener('click', handleFirstClick);
  }, []);

  // Modals
  const [inspectingOrder, setInspectingOrder] = useState(null);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [isDeliveryPartnersModalOpen, setIsDeliveryPartnersModalOpen] = useState(false);

  // 1. Fetch Local Home Kitchen Status
  const loadRestaurantStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/restaurants');
      if (res.ok) {
        const json = await res.json();
        const found = (json.restaurants || []).find(r => r.id === 'local-home-kitchen');
        if (found) setRestaurant(found);
      }
    } catch (e) {}
  }, []);

  // 2. Fetch Local Home Kitchen Delivery Partners Only
  const loadDeliveryPartners = useCallback(async () => {
    try {
      const res = await fetch('/api/delivery-partners?restaurant_id=local-home-kitchen');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.partners)) {
          setDeliveryPartners(json.partners);
        }
      }
    } catch (err) {}
  }, []);

  // 3. Fetch Local Home Kitchen Orders Only with Live Audio Alert
  const loadOrders = useCallback(async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const res = await fetch('/api/orders?restaurant_id=local-home-kitchen');
      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.orders)) {
          setOrders(json.orders);

          // Detect incoming orders AND delivery partner updates
          if (!isFirstLoadRef.current) {
            // A. Check for brand new live orders (created in last 120s)
            const now = Date.now();
            const incoming = json.orders.filter((o) => {
              if (prevOrdersMapRef.current.has(o.id)) return false;
              if (o.status === 'CANCELLED' || o.status === 'DELIVERED') return false;
              const createdAt = new Date(o.created_at || 0).getTime();
              return (now - createdAt) < 120 * 1000;
            });

            // B. Check for existing orders with status transitions (e.g. from Rider Portal)
            const statusChanges = [];
            json.orders.forEach((o) => {
              if (prevOrdersMapRef.current.has(o.id)) {
                const prev = prevOrdersMapRef.current.get(o.id);
                if (prev.status !== o.status) {
                  statusChanges.push({ order: o, prevStatus: prev.status, nextStatus: o.status });
                }
              }
            });

            if (incoming.length > 0) {
              const latest = incoming[0];
              setNewOrderAlert({
                type: 'NEW_ORDER',
                title: 'New Order Received!',
                badge: 'New Student Order',
                order: latest,
                message: `${latest.student_name || 'Student'} • ₹${latest.total_amount}`
              });

              if (soundEnabledRef.current) {
                playAdminChime('new_order');
              }

              sendAdminNotification(
                `🍲 Local Home Kitchen: New Order #${latest.id}`,
                `${latest.student_name || 'Student'} placed an order (₹${latest.total_amount}) for delivery to Gate 3!`
              );
            } else if (statusChanges.length > 0) {
              const change = statusChanges[0];
              const o = change.order;

              if (change.nextStatus === 'OUT_FOR_DELIVERY') {
                setNewOrderAlert({
                  type: 'OUT_FOR_DELIVERY',
                  title: 'Order Out For Delivery! 🚀',
                  badge: 'Rider Dispatched',
                  order: o,
                  message: `Rider ${o.delivery_partner_name || 'Partner'} is en route to SRM Gate 3`
                });

                if (soundEnabledRef.current) {
                  playAdminChime('delivery');
                }

                sendAdminNotification(
                  `🚀 Order #${o.id.slice(-8)} Out For Delivery`,
                  `${o.delivery_partner_name || 'Rider'} dispatched the order to SRM Gate 3!`
                );
              } else if (change.nextStatus === 'DELIVERED') {
                setNewOrderAlert({
                  type: 'DELIVERED',
                  title: 'Order Successfully Delivered! ✅',
                  badge: 'Delivered to Student',
                  order: o,
                  message: `Handed over to ${o.student_name || 'student'} at SRM Gate 3`
                });

                if (soundEnabledRef.current) {
                  playAdminChime('delivery');
                }

                sendAdminNotification(
                  `✅ Order #${o.id.slice(-8)} Delivered`,
                  `Order handed over to student by ${o.delivery_partner_name || 'rider'}!`
                );
              }
            }
          } else {
            isFirstLoadRef.current = false;
          }

          // Update tracked orders map with status & rider info
          const updatedMap = new Map();
          json.orders.forEach((o) => {
            updatedMap.set(o.id, {
              status: o.status,
              delivery_partner_id: o.delivery_partner_id,
              delivery_partner_name: o.delivery_partner_name
            });
          });
          prevOrdersMapRef.current = updatedMap;
        }
      }
    } catch (err) {
      console.warn('[LHK Orders Error]:', err);
    } finally {
      if (!silent) setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadRestaurantStatus();
    loadDeliveryPartners();
    loadOrders(false);

    // Live sync polling every 2.5 seconds
    const interval = setInterval(() => {
      loadOrders(true);
    }, 2500);

    return () => clearInterval(interval);
  }, [loadRestaurantStatus, loadDeliveryPartners, loadOrders]);

  // Toggle Kitchen Open / Closed
  const handleToggleOpen = async () => {
    const nextState = !(restaurant.is_open !== false);
    setIsTogglingStatus(true);
    try {
      const res = await fetch('/api/restaurants/local-home-kitchen/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_open: nextState })
      });
      const data = await res.json();
      if (data.success) {
        setRestaurant(prev => ({ ...prev, is_open: nextState }));
      }
    } catch (err) {
      console.warn('Status toggle error:', err);
    } finally {
      setIsTogglingStatus(false);
    }
  };

  // Assign Delivery Partner
  const handleAssignPartner = async (orderId, partner) => {
    if (!orderId || !partner) return;
    setOrders(prev => prev.map(o => o.id === orderId ? {
      ...o,
      delivery_partner_id: partner.id,
      delivery_partner_name: partner.name,
      delivery_partner_phone: partner.phone
    } : o));

    setInspectingOrder(prev => prev && prev.id === orderId ? {
      ...prev,
      delivery_partner_id: partner.id,
      delivery_partner_name: partner.name,
      delivery_partner_phone: partner.phone
    } : prev);

    try {
      await fetch('/api/orders/assign-partner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          partnerId: partner.id,
          partnerName: partner.name,
          partnerPhone: partner.phone
        })
      });
    } catch (e) {}
  };

  // Status transition (CONFIRMED -> OUT_FOR_DELIVERY -> DELIVERED)
  const handleUpdateStatus = async (orderId, status) => {
    if (!orderId || !status) return;

    // Optimistically update orders list and open modal
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    setInspectingOrder(prev => prev && prev.id === orderId ? { ...prev, status } : prev);

    if (soundEnabledRef.current && (status === 'OUT_FOR_DELIVERY' || status === 'DELIVERED')) {
      playAdminChime('delivery');
    }

    try {
      await fetch('/api/orders/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status })
      });
      loadOrders(true);
    } catch (e) {
      console.warn('[Status Update Error]:', e);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!orderId) return;
    await handleUpdateStatus(orderId, 'CANCELLED');
  };

  const handleConfirmDelete = async (orderId) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
    setOrderToDelete(null);
    try {
      await fetch('/api/orders/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      });
    } catch (e) {}
  };

  return (
    <div className="min-h-screen bg-[#080E1A] text-slate-100 pb-20 font-sans">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#0F172A]/95 backdrop-blur-md border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-2xl shadow-lg shadow-blue-500/20 border border-blue-400/30">
              🍲
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-black text-white font-['Outfit'] tracking-tight">
                  Local Home Kitchen
                </span>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-extrabold uppercase border border-blue-500/30">
                  Kitchen Portal
                </span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <span>Staff: <strong className="text-slate-200">{profile?.name || 'Local Kitchen Staff'}</strong></span>
                <span>•</span>
                <span className="text-emerald-400 font-bold">Isolated Scope</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Audio Notification Chime Toggle & Test */}
            <button
              onClick={() => {
                const next = !soundEnabled;
                setSoundEnabled(next);
                if (next) playAdminChime('test');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
                soundEnabled
                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/40 hover:bg-blue-500/30'
                  : 'bg-slate-800 text-slate-500 border-slate-700 hover:text-slate-300'
              }`}
              title={soundEnabled ? 'Sound alert is ON. Click to test chime or mute.' : 'Sound alert is MUTED. Click to enable sound.'}
            >
              {soundEnabled ? <Volume2 size={15} className="text-blue-400" /> : <VolumeX size={15} />}
              <span className="hidden sm:inline">{soundEnabled ? 'Sound: ON' : 'Sound: Muted'}</span>
            </button>

            {/* Delivery Partners Management Button */}
            <button
              onClick={() => setIsDeliveryPartnersModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Bike size={15} />
              <span className="hidden sm:inline">Delivery Partners</span>
              <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono">
                {deliveryPartners.length}
              </span>
            </button>

            {/* Sync Button */}
            <button
              onClick={() => loadOrders(false)}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
              title="Sync Orders"
            >
              <RefreshCw size={15} className={isRefreshing ? 'animate-spin text-blue-400' : ''} />
            </button>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="p-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 text-rose-400 border border-rose-800/60 transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut size={15} />
            </button>
          </div>

        </div>
      </header>

      {/* Floating Alert Banner for New Orders & Rider Delivery Updates */}
      {newOrderAlert && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 max-w-md w-full animate-slide-down">
          <div className={`p-4 rounded-2xl bg-slate-900 border-2 shadow-2xl text-white flex flex-col gap-2 relative overflow-hidden ${
            newOrderAlert.type === 'DELIVERED'
              ? 'border-emerald-500 shadow-emerald-500/30'
              : newOrderAlert.type === 'OUT_FOR_DELIVERY'
              ? 'border-blue-500 shadow-blue-500/30'
              : 'border-blue-500 shadow-blue-500/30'
          }`}>
            <div className={`absolute top-0 left-0 right-0 h-1 animate-pulse ${
              newOrderAlert.type === 'DELIVERED'
                ? 'bg-gradient-to-r from-emerald-400 to-teal-500'
                : 'bg-gradient-to-r from-blue-400 to-indigo-500'
            }`} />
            
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xl border ${
                  newOrderAlert.type === 'DELIVERED'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : 'bg-blue-500/20 text-blue-400 border-blue-500/40'
                }`}>
                  {newOrderAlert.type === 'DELIVERED' ? (
                    <CheckCircle2 size={20} className="text-emerald-400" />
                  ) : newOrderAlert.type === 'OUT_FOR_DELIVERY' ? (
                    <Bike size={20} className="text-blue-400 animate-pulse" />
                  ) : (
                    <Bell size={20} className="animate-bounce" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                      newOrderAlert.type === 'DELIVERED'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                    }`}>
                      {newOrderAlert.badge || 'Order Update'}
                    </span>
                    <span className="font-mono text-xs font-bold text-cyan-400">
                      #{newOrderAlert.order ? newOrderAlert.order.id.slice(-8) : (newOrderAlert.id ? newOrderAlert.id.slice(-8) : '')}
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-white font-['Outfit'] mt-1">
                    {newOrderAlert.title || (newOrderAlert.student_name ? `${newOrderAlert.student_name} • ₹${newOrderAlert.total_amount}` : 'Order Update')}
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {newOrderAlert.message || (newOrderAlert.order ? `${newOrderAlert.order.student_name} • Drop: ${newOrderAlert.order.delivery_location || 'Gate 3'}` : '')}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setNewOrderAlert(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors border-none bg-transparent cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-800 mt-1">
              <button
                onClick={() => {
                  setInspectingOrder(newOrderAlert.order || newOrderAlert);
                  setNewOrderAlert(null);
                }}
                className={`px-3 py-1 rounded-xl text-slate-950 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer border-none shadow-md ${
                  newOrderAlert.type === 'DELIVERED'
                    ? 'bg-emerald-400 hover:bg-emerald-300'
                    : 'bg-blue-400 hover:bg-blue-300'
                }`}
              >
                Inspect Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Availability & Quick Metrics Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Status Toggle Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Kitchen Order Acceptance</div>
              <div className="flex items-center gap-2 mt-1">
                <span className={`w-2.5 h-2.5 rounded-full ${restaurant.is_open !== false ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'}`} />
                <span className={`font-black text-sm uppercase font-['Outfit'] ${restaurant.is_open !== false ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {restaurant.is_open !== false ? 'ACCEPTING ORDERS' : 'KITCHEN CLOSED'}
                </span>
              </div>
            </div>
            <button
              onClick={handleToggleOpen}
              disabled={isTogglingStatus}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border shadow-lg ${
                restaurant.is_open !== false
                  ? 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border-rose-500/40'
                  : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-500/40'
              }`}
            >
              <Power size={14} />
              <span>{restaurant.is_open !== false ? 'Close Kitchen' : 'Open Kitchen'}</span>
            </button>
          </div>

          {/* Active Orders Count */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Local Kitchen Orders</div>
              <div className="text-2xl font-black text-blue-400 font-['Outfit'] mt-1">
                {orders.length}
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center text-2xl">
              🍲
            </div>
          </div>

          {/* Assigned Riders Count */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl flex items-center justify-between">
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Assigned Riders</div>
              <div className="text-2xl font-black text-cyan-400 font-['Outfit'] mt-1">
                {deliveryPartners.length}
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-2xl">
              🛵
            </div>
          </div>

        </div>

        {/* Local Home Kitchen Orders Table (with Quick Dispatch & Deliver buttons) */}
        <OrdersTable
          orders={orders}
          activeRestaurantTab="local-home-kitchen"
          restaurantName="Local Home Kitchen"
          isRestaurantAdmin={true}
          onInspectOrder={(order) => setInspectingOrder(order)}
          onCancelOrder={handleCancelOrder}
          onPromptDeleteOrder={(order) => setOrderToDelete(order)}
          onUpdateStatus={handleUpdateStatus}
        />

      </main>

      {/* Inspect Order Details Modal */}
      <ErrorBoundary onReset={() => setInspectingOrder(null)}>
        <OrderDetailsModal
          order={inspectingOrder}
          deliveryPartners={deliveryPartners}
          onAssignPartner={handleAssignPartner}
          onUnassignPartner={(orderId) => {
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, delivery_partner_id: null, delivery_partner_name: null } : o));
            setInspectingOrder(prev => prev && prev.id === orderId ? { ...prev, delivery_partner_id: null, delivery_partner_name: null } : prev);
          }}
          onOpenDeliveryPartners={() => setIsDeliveryPartnersModalOpen(true)}
          onClose={() => setInspectingOrder(null)}
          onUpdateStatus={handleUpdateStatus}
          onCancelOrder={handleCancelOrder}
          onDeleteOrder={(order) => setOrderToDelete(order)}
        />
      </ErrorBoundary>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        order={orderToDelete}
        isOpen={Boolean(orderToDelete)}
        onClose={() => setOrderToDelete(null)}
        onConfirmDelete={handleConfirmDelete}
      />

      {/* Delivery Partners Management Modal (Isolated to LHK) */}
      <DeliveryPartnersModal
        isOpen={isDeliveryPartnersModalOpen}
        onClose={() => setIsDeliveryPartnersModalOpen(false)}
        onPartnersChanged={loadDeliveryPartners}
        assignedRestaurantId="local-home-kitchen"
      />
    </div>
  );
}
