import React, { useState, useEffect, useCallback } from 'react';
import { 
  Bike, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  Package, 
  Navigation, 
  RefreshCw, 
  AlertCircle, 
  LogOut, 
  Clock, 
  Truck, 
  Utensils,
  ShieldCheck,
  Store
} from 'lucide-react';
import { 
  getDeliveryOrders, 
  updateDeliveryOrderStatus 
} from '../lib/api';

export default function DeliveryDashboardPage({ partner, onLogout, onSwitchToStudent, onSwitchToAdmin }) {
  const [orders, setOrders] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 1. Fetch assigned orders from Neon PostgreSQL
  const fetchOrders = useCallback(async (isSilent = false) => {
    if (!partner?.id) return;
    if (!isSilent) setIsRefreshing(true);

    try {
      const data = await getDeliveryOrders(partner.id);
      const assigned = data.orders || [];
      setOrders(assigned);

      // Find active delivery
      const active = assigned.find(o => ['READY', 'PICKED_UP', 'OUT_FOR_DELIVERY'].includes(o.status));
      setActiveOrder(active || null);
    } catch (err) {
      console.error('[DeliveryDashboard] Failed to fetch orders:', err);
    } finally {
      if (!isSilent) setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [partner?.id]);

  // Initial load and 5s polling for new assignments
  useEffect(() => {
    setIsLoading(true);
    fetchOrders(false);

    const pollInterval = setInterval(() => {
      fetchOrders(true);
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [fetchOrders]);

  // Workflow Handlers
  const handlePickUpOrder = async () => {
    if (!activeOrder || isUpdating) return;
    setIsUpdating(true);

    try {
      await updateDeliveryOrderStatus(activeOrder.id, 'PICKED_UP', partner.id);
      await fetchOrders(true);
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStartDelivery = async () => {
    if (!activeOrder || isUpdating) return;
    setIsUpdating(true);

    try {
      await updateDeliveryOrderStatus(activeOrder.id, 'OUT_FOR_DELIVERY', partner.id);
      await fetchOrders(true);
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMarkDelivered = async () => {
    if (!activeOrder || isUpdating) return;
    setIsUpdating(true);

    try {
      await updateDeliveryOrderStatus(activeOrder.id, 'DELIVERED', partner.id);
      await fetchOrders(true);
      alert(`Order #${activeOrder.id} successfully marked DELIVERED! Great job 🎉`);
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  // Calculations
  const completedOrders = orders.filter(o => o.status === 'DELIVERED');
  const totalEarnings = completedOrders.length * 25; // ₹25 per delivery incentive

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 pb-20 font-sans animate-fade-in">
      {/* Top Header Bar */}
      <header className="bg-[#1E293B] border-b border-slate-700/80 sticky top-0 z-30 px-4 sm:px-6 py-3.5 shadow-md">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FF5722] to-[#FF7A50] text-white flex items-center justify-center font-black text-xl shadow-lg shadow-[#FF5722]/20 font-['Outfit']">
              🛵
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base text-white font-['Outfit']">{partner?.name}</h1>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold uppercase">
                  Active Courier
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                ID: {partner?.id} • {partner?.phone}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchOrders(false)}
              disabled={isRefreshing}
              title="Refresh Orders"
              className={`w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer ${
                isRefreshing ? 'animate-spin text-[#FF5722]' : ''
              }`}
            >
              <RefreshCw size={15} />
            </button>

            {onSwitchToStudent && (
              <button
                onClick={onSwitchToStudent}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                title="Switch to Student Dining View"
              >
                <Utensils size={13} className="text-[#FF5722]" />
                <span className="hidden md:inline">Student View</span>
              </button>
            )}

            {onSwitchToAdmin && (
              <button
                onClick={onSwitchToAdmin}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                title="Switch to Admin Management Portal"
              >
                <ShieldCheck size={13} className="text-blue-400" />
                <span className="hidden md:inline">Admin Portal</span>
              </button>
            )}

            <button
              onClick={onLogout}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-800 text-slate-300 hover:text-rose-300 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <LogOut size={13} />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Metric Cards Banner */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <div className="p-4 rounded-2xl bg-[#1E293B] border border-slate-700/80 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Active Task
            </span>
            <div className="text-xl sm:text-2xl font-black text-amber-400 font-['Outfit'] mt-0.5">
              {activeOrder ? '1 Delivery' : 'None'}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#1E293B] border border-slate-700/80 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Completed
            </span>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 font-['Outfit'] mt-0.5">
              {completedOrders.length} Trips
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#1E293B] border border-slate-700/80 shadow-xs">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Incentives
            </span>
            <div className="text-xl sm:text-2xl font-black text-[#FF5722] font-['Outfit'] mt-0.5">
              ₹{totalEarnings}
            </div>
          </div>
        </div>

        {/* ACTIVE DELIVERY WORKFLOW CARD */}
        {activeOrder ? (
          <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#1E293B] border-2 border-[#FF5722]/50 shadow-2xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#FF5722]/10 rounded-full blur-3xl pointer-events-none" />

            {/* Status Pill & Order ID */}
            <div className="flex flex-wrap items-center justify-between gap-3 relative z-10 border-b border-slate-700/80 pb-4">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[#FF5722] text-white text-xs font-black tracking-wider uppercase shadow-md shadow-[#FF5722]/30">
                  {activeOrder.status.replace(/_/g, ' ')}
                </span>
                <span className="font-mono text-base font-black text-white">
                  #{activeOrder.id}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-300 font-mono">
                <Clock size={14} className="text-amber-400" />
                <span>Assigned Delivery</span>
              </div>
            </div>

            {/* Locations Details (Pickup & Delivery) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
              {/* Pickup Kitchen */}
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
                <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-amber-400">
                  <MapPin size={13} />
                  <span>1. Pickup From Kitchen</span>
                </div>
                <div className="text-base font-extrabold text-white">
                  {activeOrder.restaurantName || activeOrder.restaurant_name || 'Local Home Kitchen'}
                </div>
                <p className="text-xs text-slate-400">
                  Beside Ayyappa PG Hostel, Neerukonda Village
                </p>
                <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <Store size={12} />
                  <span>Order items ready for campus transit</span>
                </div>
              </div>

              {/* Student Drop */}
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-emerald-400">
                    <Navigation size={13} />
                    <span>2. Deliver To Student</span>
                  </div>
                  {activeOrder.studentPhone && (
                    <a
                      href={`tel:${activeOrder.studentPhone}`}
                      className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 no-underline bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30"
                    >
                      <Phone size={12} />
                      <span>Call Student</span>
                    </a>
                  )}
                </div>
                <div className="text-base font-extrabold text-white">
                  {activeOrder.studentName || activeOrder.student_name || 'Student'}
                </div>
                <p className="text-xs text-slate-300 font-medium">
                  📍 {activeOrder.deliveryLocation || activeOrder.delivery_location || 'Campus Delivery'}
                </p>
              </div>
            </div>

            {/* WORKFLOW ACTION BUTTONS */}
            <div className="pt-2 relative z-10 space-y-2">
              {activeOrder.status === 'READY' && (
                <button
                  onClick={handlePickUpOrder}
                  disabled={isUpdating}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:brightness-110 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-blue-600/30 transition-all cursor-pointer border-none flex items-center justify-center gap-2"
                >
                  {isUpdating ? <RefreshCw size={18} className="animate-spin" /> : <Package size={18} />}
                  <span>PICK UP ORDER FROM KITCHEN</span>
                </button>
              )}

              {activeOrder.status === 'PICKED_UP' && (
                <button
                  onClick={handleStartDelivery}
                  disabled={isUpdating}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FF5722] to-[#FF7A50] hover:brightness-110 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-[#FF5722]/30 transition-all cursor-pointer border-none flex items-center justify-center gap-2 animate-pulse"
                >
                  {isUpdating ? <RefreshCw size={18} className="animate-spin" /> : <Truck size={18} />}
                  <span>START DELIVERY (OUT FOR DELIVERY)</span>
                </button>
              )}

              {activeOrder.status === 'OUT_FOR_DELIVERY' && (
                <button
                  onClick={handleMarkDelivered}
                  disabled={isUpdating}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-emerald-600/30 transition-all cursor-pointer border-none flex items-center justify-center gap-2"
                >
                  {isUpdating ? <RefreshCw size={18} className="animate-spin" /> : <CheckCircle2 size={18} />}
                  <span>MARK AS DELIVERED TO STUDENT ✅</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Empty State: No Active Delivery */
          <div className="p-8 sm:p-12 rounded-3xl bg-[#1E293B] border border-slate-700/80 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
              <Bike size={32} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-['Outfit']">No Active Deliveries</h2>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                You are currently available. When a manager assigns an order to you, it will appear here automatically.
              </p>
            </div>
            <button
              onClick={() => fetchOrders(false)}
              disabled={isRefreshing}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer border border-slate-700 inline-flex items-center gap-1.5"
            >
              <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
              <span>Check for New Assignments</span>
            </button>
          </div>
        )}

        {/* COMPLETED DELIVERIES LOG */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm text-slate-300 font-['Outfit'] uppercase tracking-wider">
              Completed Delivery Trips ({completedOrders.length})
            </h3>
            <span className="text-xs text-emerald-400 font-bold">
              Earned ₹{totalEarnings}
            </span>
          </div>

          {completedOrders.length === 0 ? (
            <div className="p-4 rounded-2xl bg-[#1E293B]/60 border border-slate-800 text-center text-xs text-slate-500">
              No completed trips yet today.
            </div>
          ) : (
            <div className="space-y-2">
              {completedOrders.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  className="p-3.5 rounded-2xl bg-[#1E293B] border border-slate-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0" />
                    <div>
                      <div className="font-bold text-white">
                        #{order.id} • {order.studentName || 'Student'}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Drop: {order.deliveryLocation || 'Hostel'}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                      +₹25
                    </span>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Delivered
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
