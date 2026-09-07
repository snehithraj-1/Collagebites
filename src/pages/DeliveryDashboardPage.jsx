import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Compass, 
  Clock, 
  ChevronRight, 
  Truck, 
  Utensils 
} from 'lucide-react';
import { 
  getDeliveryOrders, 
  updateDeliveryOrderStatus, 
  sendDeliveryLocation 
} from '../lib/api';

// SRM-AP Campus Path Simulation Steps (Kitchen to Hostels)
const CAMPUS_SIMULATION_STEPS = [
  { lat: 16.5175, lng: 80.5215, desc: 'Picked up from Kitchen' },
  { lat: 16.5172, lng: 80.5210, desc: 'Exiting Central Dining Block' },
  { lat: 16.5169, lng: 80.5205, desc: 'Passing Academic Block 3' },
  { lat: 16.5165, lng: 80.5200, desc: 'Entering Hostel Quadrangle' },
  { lat: 16.5162, lng: 80.5197, desc: 'Approaching Hostel Gate' },
  { lat: 16.5160, lng: 80.5195, desc: 'Arrived at Student Hostel' }
];

export default function DeliveryDashboardPage({ partner, onLogout, onSwitchToStudent }) {
  const [orders, setOrders] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // GPS Tracking State
  const [isGpsActive, setIsGpsActive] = useState(false);
  const [gpsError, setGpsError] = useState(null);
  const [currentCoords, setCurrentCoords] = useState(null);
  const [lastPingTime, setLastPingTime] = useState(null);
  const [simulationMode, setSimulationMode] = useState(true); // Default ON for seamless testing
  const [simStepIndex, setSimStepIndex] = useState(0);

  const watchIdRef = useRef(null);
  const simTimerRef = useRef(null);
  const lastSentTimeRef = useRef(0);

  // 1. Fetch assigned orders from Neon
  const fetchOrders = useCallback(async (isSilent = false) => {
    if (!partner?.id) return;
    if (!isSilent) setIsRefreshing(true);

    try {
      const data = await getDeliveryOrders(partner.id);
      const assigned = data.orders || [];
      setOrders(assigned);

      // Find highest priority active order: OUT_FOR_DELIVERY > PICKED_UP > READY
      const active = assigned.find(o => ['OUT_FOR_DELIVERY', 'PICKED_UP', 'READY'].includes(o.status));
      setActiveOrder(active || null);

      // If active order is OUT_FOR_DELIVERY and GPS not yet active, prompt or auto-start
      if (active && active.status === 'OUT_FOR_DELIVERY' && !isGpsActive) {
        startGpsBroadcast(active.id);
      }
    } catch (err) {
      console.error('[DeliveryDashboard] Error fetching assigned orders:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [partner?.id, isGpsActive]);

  // Initial load and 5s polling for new assignments
  useEffect(() => {
    setIsLoading(true);
    fetchOrders(false);

    const pollInterval = setInterval(() => {
      fetchOrders(true);
    }, 5000);

    return () => {
      clearInterval(pollInterval);
      stopGpsBroadcast();
    };
  }, [partner?.id]);

  // 2. Stop GPS Broadcast helper
  const stopGpsBroadcast = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (simTimerRef.current) {
      clearInterval(simTimerRef.current);
      simTimerRef.current = null;
    }
    setIsGpsActive(false);
  }, []);

  // 3. Send Location to backend with throttling (at least 4s between requests)
  const transmitLocation = async (targetOrderId, lat, lng, acc = 10) => {
    const now = Date.now();
    if (now - lastSentTimeRef.current < 4000) return; // Throttle
    lastSentTimeRef.current = now;

    try {
      await sendDeliveryLocation({
        orderId: targetOrderId,
        deliveryPartnerId: partner.id,
        latitude: lat,
        longitude: lng,
        accuracy: acc
      });
      setCurrentCoords({ latitude: lat, longitude: lng, accuracy: acc });
      setLastPingTime(new Date());
      setGpsError(null);
    } catch (err) {
      console.warn('[DeliveryDashboard] Location ping failed:', err.message);
    }
  };

  // 4. Start GPS Broadcast
  const startGpsBroadcast = (targetOrderId) => {
    stopGpsBroadcast();
    setIsGpsActive(true);
    setGpsError(null);

    // If simulation mode enabled or navigator.geolocation unavailable
    if (simulationMode || !navigator.geolocation) {
      let step = 0;
      // Send first step immediately
      const first = CAMPUS_SIMULATION_STEPS[0];
      transmitLocation(targetOrderId, first.lat, first.lng, 8);

      simTimerRef.current = setInterval(() => {
        step = (step + 1) % CAMPUS_SIMULATION_STEPS.length;
        setSimStepIndex(step);
        const current = CAMPUS_SIMULATION_STEPS[step];
        transmitLocation(targetOrderId, current.lat, current.lng, 8);
      }, 5000);

      return;
    }

    // Real Browser Geolocation API
    try {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          transmitLocation(targetOrderId, latitude, longitude, accuracy);
        },
        (err) => {
          console.warn('Geolocation permission denied or error:', err.message);
          setGpsError('GPS permission denied or unavailable. Switched to Campus Simulation Mode.');
          setSimulationMode(true);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 5000,
          timeout: 10000
        }
      );
    } catch (e) {
      setSimulationMode(true);
    }
  };

  // 5. Action Handlers for Delivery Partner Workflow
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
      startGpsBroadcast(activeOrder.id);
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
      stopGpsBroadcast();
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
                  Active
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                Courier ID: {partner?.id} • {partner?.phone}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
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
              {activeOrder ? '1 Order' : 'None'}
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
          <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-[#1E293B] via-[#0F172A] to-[#1E293B] border-2 border-[#FF5722]/50 shadow-2xl space-y-5 relative overflow-hidden">
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

              {/* GPS Live Broadcasting Pill */}
              {isGpsActive ? (
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>GPS Broadcasting Active</span>
                  {lastPingTime && (
                    <span className="text-[10px] text-emerald-400/80 font-mono">
                      ({lastPingTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })})
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-xs text-slate-400 font-medium">GPS Inactive</span>
              )}
            </div>

            {/* Locations Details (Pickup & Delivery) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
              {/* Pickup Kitchen */}
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-1.5">
                <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-amber-400">
                  <Utensils size={13} />
                  <span>Pickup Point</span>
                </div>
                <div className="font-extrabold text-white text-sm">
                  {activeOrder.restaurantName || activeOrder.restaurant_name}
                </div>
                <p className="text-xs text-slate-400">
                  SRM-AP Central Kitchen & Dining Block
                </p>
              </div>

              {/* Student Drop-off */}
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-emerald-400">
                    <MapPin size={13} />
                    <span>Drop-off Destination</span>
                  </div>
                  <a
                    href={`tel:${activeOrder.studentPhone}`}
                    className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 text-[10px] font-bold transition-colors flex items-center gap-1"
                  >
                    <Phone size={10} />
                    <span>Call Student</span>
                  </a>
                </div>
                <div className="font-extrabold text-white text-sm">
                  {activeOrder.deliveryLocation || 'Hostel Room Delivery'}
                </div>
                <p className="text-xs text-slate-400">
                  Student: <strong>{activeOrder.studentName}</strong> ({activeOrder.studentPhone})
                </p>
              </div>
            </div>

            {/* Order Items Preview */}
            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 relative z-10 text-xs">
              <span className="font-bold text-slate-400 block mb-1.5">Items in Package:</span>
              <div className="flex flex-wrap gap-2">
                {activeOrder.items?.map((item, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-700/80 text-white font-medium">
                    {item.name} × {item.qty || item.quantity || 1}
                  </span>
                ))}
              </div>
            </div>

            {/* GPS Simulation Toggle Bar */}
            <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Compass size={16} className="text-[#FF5722]" />
                <span className="font-bold text-slate-300">GPS Mode:</span>
                <span className="text-slate-400 font-mono">
                  {simulationMode ? 'Campus Simulation (SRM-AP)' : 'Live Device Geolocation'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const nextMode = !simulationMode;
                    setSimulationMode(nextMode);
                    if (isGpsActive) startGpsBroadcast(activeOrder.id);
                  }}
                  className={`px-3 py-1 rounded-xl text-[11px] font-bold border transition-colors cursor-pointer ${
                    simulationMode 
                      ? 'bg-[#FF5722]/20 border-[#FF5722] text-[#FF8A65]' 
                      : 'bg-slate-700 border-slate-600 text-slate-300'
                  }`}
                >
                  {simulationMode ? 'Simulation Active 📍' : 'Use Real GPS 📡'}
                </button>
              </div>
            </div>

            {gpsError && (
              <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-2">
                <AlertCircle size={14} className="flex-shrink-0" />
                <span>{gpsError}</span>
              </div>
            )}

            {/* WORKFLOW ACTION BUTTONS (Part 4) */}
            <div className="pt-2 relative z-10">
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
                  <span>START DELIVERY (BROADCAST GPS)</span>
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
          <div className="p-10 rounded-3xl bg-[#1E293B] border border-slate-700/80 text-center space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-slate-800 border border-slate-700 flex items-center justify-center text-3xl mx-auto">
              🛵
            </div>
            <h2 className="text-lg font-black text-white font-['Outfit']">No Active Deliveries Right Now</h2>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You are ready for campus delivery assignments. The admin will assign ready kitchen orders to your courier profile.
            </p>
          </div>
        )}

        {/* ALL ASSIGNED ORDERS LIST (ACTIVE & COMPLETED) */}
        <div className="p-6 rounded-3xl bg-[#1E293B] border border-slate-700/80 space-y-4">
          <h3 className="font-extrabold text-sm text-white font-['Outfit'] uppercase tracking-wider flex items-center gap-2">
            <Clock size={16} className="text-[#FF5722]" />
            <span>Delivery Order History ({orders.length})</span>
          </h3>

          {orders.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No orders have been assigned yet.</p>
          ) : (
            <div className="divide-y divide-slate-700/60 text-xs">
              {orders.map((o) => (
                <div key={o.id} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white">#{o.id}</span>
                      <span className="text-slate-400">•</span>
                      <span className="font-semibold text-slate-200">{o.restaurantName}</span>
                    </div>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      To: {o.deliveryLocation} ({o.studentName})
                    </p>
                  </div>

                  <div className="text-right">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                      o.status === 'DELIVERED'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : o.status === 'OUT_FOR_DELIVERY'
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}>
                      {o.status}
                    </span>
                    <div className="text-[10px] text-slate-500 font-mono mt-1">₹{o.totalAmount}</div>
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
