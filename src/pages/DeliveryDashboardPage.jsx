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
  Utensils,
  ShieldCheck,
  Play,
  Pause,
  FastForward,
  Send
} from 'lucide-react';
import { 
  getDeliveryOrders, 
  updateDeliveryOrderStatus, 
  sendDeliveryLocation 
} from '../lib/api';

// SRM-AP Campus Coordinates
const CAMPUS_POINTS = {
  'local-home-kitchen': [16.5175, 80.5215],
  'campus-delight-dhaba': [16.5170, 80.5220],
  'default-kitchen': [16.5172, 80.5210],
  'hostel-b': [16.5165, 80.5200],
  'hostel-c': [16.5160, 80.5195],
  'hostel-a': [16.5155, 80.5190],
  'default-destination': [16.5160, 80.5195]
};

// Generate 10 smooth waypoints between start and end
function generateRouteWaypoints(startCoord, endCoord, count = 10) {
  const waypoints = [];
  for (let i = 0; i <= count; i++) {
    const t = i / count;
    // Slight curve to simulate campus pathways
    const curveOffset = Math.sin(t * Math.PI) * 0.0003;
    const lat = startCoord[0] + (endCoord[0] - startCoord[0]) * t + curveOffset;
    const lng = startCoord[1] + (endCoord[1] - startCoord[1]) * t;
    waypoints.push({
      lat: parseFloat(lat.toFixed(6)),
      lng: parseFloat(lng.toFixed(6)),
      step: i,
      total: count
    });
  }
  return waypoints;
}

export default function DeliveryDashboardPage({ partner, onLogout, onSwitchToStudent, onSwitchToAdmin }) {
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
  const [pingSuccessCount, setPingSuccessCount] = useState(0);
  const [simulationMode, setSimulationMode] = useState(true); // Default ON for seamless testing
  const [simStepIndex, setSimStepIndex] = useState(0);

  const watchIdRef = useRef(null);
  const simTimerRef = useRef(null);
  const lastSentTimeRef = useRef(0);
  const waypointsRef = useRef([]);

  // Helper to resolve coordinates for active order
  const getOrderPoints = useCallback((order) => {
    if (!order) return { start: CAMPUS_POINTS['default-kitchen'], end: CAMPUS_POINTS['default-destination'] };
    const start = CAMPUS_POINTS[order.restaurantId] || CAMPUS_POINTS['default-kitchen'];
    const loc = (order.deliveryLocation || '').toLowerCase();
    let end = CAMPUS_POINTS['default-destination'];
    if (loc.includes('block a')) end = CAMPUS_POINTS['hostel-a'];
    else if (loc.includes('block b')) end = CAMPUS_POINTS['hostel-b'];
    else if (loc.includes('block c')) end = CAMPUS_POINTS['hostel-c'];
    return { start, end };
  }, []);

  // 1. Fetch assigned orders from Neon
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

      // Generate route waypoints if active order found
      if (active) {
        const { start, end } = getOrderPoints(active);
        waypointsRef.current = generateRouteWaypoints(start, end, 10);
      }
    } catch (err) {
      console.error('[DeliveryDashboard] Failed to fetch orders:', err);
    } finally {
      if (!isSilent) setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [partner?.id, getOrderPoints]);

  // 2. Stop GPS Broadcast helper
  const stopGpsBroadcast = useCallback(() => {
    if (watchIdRef.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (simTimerRef.current) {
      clearInterval(simTimerRef.current);
      simTimerRef.current = null;
    }
    setIsGpsActive(false);
  }, []);

  // 3. Send Location to backend
  const transmitLocation = async (targetOrderId, lat, lng, acc = 8, force = false) => {
    const now = Date.now();
    if (!force && now - lastSentTimeRef.current < 2500) return; // Throttle 2.5s
    lastSentTimeRef.current = now;

    try {
      const recorded = await sendDeliveryLocation({
        orderId: targetOrderId,
        deliveryPartnerId: partner.id,
        latitude: lat,
        longitude: lng,
        accuracy: acc
      });

      setCurrentCoords({ latitude: lat, longitude: lng, accuracy: acc });
      setLastPingTime(new Date());
      setPingSuccessCount(prev => prev + 1);
      setGpsError(null);
      return recorded;
    } catch (err) {
      console.warn('[DeliveryDashboard] Location ping failed:', err.message);
      setGpsError(`Broadcast issue: ${err.message}`);
    }
  };

  // 4. Start GPS Broadcast (Simulation or Real)
  const startGpsBroadcast = useCallback((targetOrderId) => {
    stopGpsBroadcast();
    setIsGpsActive(true);
    setGpsError(null);

    const waypoints = waypointsRef.current.length > 0
      ? waypointsRef.current
      : generateRouteWaypoints(CAMPUS_POINTS['default-kitchen'], CAMPUS_POINTS['default-destination'], 10);

    // Mode A: Simulation Mode
    if (simulationMode || !navigator.geolocation) {
      let currentIdx = simStepIndex % waypoints.length;
      const initial = waypoints[currentIdx];
      transmitLocation(targetOrderId, initial.lat, initial.lng, 6, true);

      simTimerRef.current = setInterval(() => {
        currentIdx = (currentIdx + 1) % waypoints.length;
        setSimStepIndex(currentIdx);
        const pt = waypoints[currentIdx];
        transmitLocation(targetOrderId, pt.lat, pt.lng, 6);
      }, 4000);

      return;
    }

    // Mode B: Real Browser Geolocation API
    try {
      // First immediate position
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          transmitLocation(targetOrderId, latitude, longitude, accuracy, true);
        },
        (err) => {
          console.warn('Initial geolocation error:', err.message);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );

      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          transmitLocation(targetOrderId, latitude, longitude, accuracy);
        },
        (err) => {
          console.warn('Geolocation watch error:', err.message);
          setGpsError('Real GPS permission denied or timed out. Switched to Campus Simulation Mode.');
          setSimulationMode(true);
          // Auto-fallback to simulation
          let currentIdx = 0;
          simTimerRef.current = setInterval(() => {
            currentIdx = (currentIdx + 1) % waypoints.length;
            setSimStepIndex(currentIdx);
            const pt = waypoints[currentIdx];
            transmitLocation(targetOrderId, pt.lat, pt.lng, 6);
          }, 4000);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 3000,
          timeout: 10000
        }
      );
    } catch (e) {
      setSimulationMode(true);
    }
  }, [simulationMode, simStepIndex, stopGpsBroadcast]);

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
  }, [fetchOrders, stopGpsBroadcast]);

  // Auto-resume GPS if active order is OUT_FOR_DELIVERY on reload
  useEffect(() => {
    if (activeOrder && activeOrder.status === 'OUT_FOR_DELIVERY' && !isGpsActive) {
      startGpsBroadcast(activeOrder.id);
    }
  }, [activeOrder?.status, isGpsActive, startGpsBroadcast]);

  // Manual one-tap Step Forward in simulation
  const handleManualStepForward = () => {
    if (!activeOrder) return;
    const waypoints = waypointsRef.current.length > 0 
      ? waypointsRef.current 
      : generateRouteWaypoints(CAMPUS_POINTS['default-kitchen'], CAMPUS_POINTS['default-destination'], 10);
    const nextIdx = (simStepIndex + 1) % waypoints.length;
    setSimStepIndex(nextIdx);
    const nextPt = waypoints[nextIdx];
    transmitLocation(activeOrder.id, nextPt.lat, nextPt.lng, 5, true);
  };

  // Manual Instant Ping Now
  const handleManualPingNow = () => {
    if (!activeOrder) return;
    if (currentCoords) {
      transmitLocation(activeOrder.id, currentCoords.latitude, currentCoords.longitude, currentCoords.accuracy || 5, true);
    } else if (waypointsRef.current.length > 0) {
      const pt = waypointsRef.current[simStepIndex % waypointsRef.current.length];
      transmitLocation(activeOrder.id, pt.lat, pt.lng, 5, true);
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
              <div className="flex items-center gap-2 flex-wrap">
                {isGpsActive ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>Live GPS Active</span>
                    <span className="text-[10px] text-emerald-400/80 font-mono">
                      (Pings: {pingSuccessCount})
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>GPS Idle / Paused</span>
                  </div>
                )}
              </div>
            </div>

            {/* Locations Details (Pickup & Delivery) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative z-10">
              {/* Pickup Kitchen */}
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-1.5">
                <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-amber-400">
                  <MapPin size={13} />
                  <span>1. Pickup From Kitchen</span>
                </div>
                <div className="text-sm font-extrabold text-white">
                  {activeOrder.restaurantName || activeOrder.restaurant_name}
                </div>
                <p className="text-xs text-slate-400">
                  Central Dining Court, Ground Floor, Academic Block
                </p>
              </div>

              {/* Student Drop */}
              <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-emerald-400">
                    <Navigation size={13} />
                    <span>2. Deliver To Student</span>
                  </div>
                  {activeOrder.studentPhone && (
                    <a
                      href={`tel:${activeOrder.studentPhone}`}
                      className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 no-underline"
                    >
                      <Phone size={12} />
                      <span>Call Student</span>
                    </a>
                  )}
                </div>
                <div className="text-sm font-extrabold text-white">
                  {activeOrder.studentName || activeOrder.student_name}
                </div>
                <p className="text-xs text-slate-400 font-medium">
                  📍 {activeOrder.deliveryLocation || 'Campus Delivery'}
                </p>
              </div>
            </div>

            {/* Order Items Summary */}
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 relative z-10 space-y-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Items to Deliver ({activeOrder.items?.length || 0})
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                {activeOrder.items?.map((item, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-700/80 text-white font-medium">
                    {item.name || item.item_name} × {item.qty || item.quantity || 1}
                  </span>
                ))}
              </div>
            </div>

            {/* LIVE GPS BROADCAST TELEMETRY & CONTROLS BAR */}
            <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Compass size={16} className="text-[#FF5722]" />
                  <span className="font-bold text-xs text-white">Tracking Engine:</span>
                  <span className="px-2 py-0.5 rounded-lg bg-slate-900 text-[#FF8A65] font-mono text-[11px] font-bold border border-slate-700">
                    {simulationMode ? 'Campus Simulated GPS (SRM-AP)' : 'Real Device Geolocation API'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const next = !simulationMode;
                      setSimulationMode(next);
                      if (isGpsActive) startGpsBroadcast(activeOrder.id);
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                      simulationMode 
                        ? 'bg-[#FF5722]/20 border-[#FF5722] text-[#FF8A65]' 
                        : 'bg-slate-700 border-slate-600 text-slate-300 hover:text-white'
                    }`}
                  >
                    {simulationMode ? 'Sim Mode Active 📍' : 'Use Real GPS 📡'}
                  </button>
                </div>
              </div>

              {/* Coordinates & Ping Diagnostics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-700/60 text-xs font-mono">
                <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-sans">Latitude</span>
                  <span className="text-white font-bold">{currentCoords?.latitude?.toFixed(5) || '16.51720'}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-sans">Longitude</span>
                  <span className="text-white font-bold">{currentCoords?.longitude?.toFixed(5) || '80.52100'}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-sans">Accuracy</span>
                  <span className="text-emerald-400 font-bold">~{currentCoords?.accuracy || 6}m</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-sans">Last Transmit</span>
                  <span className="text-amber-300 font-bold">
                    {lastPingTime ? lastPingTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'Ready'}
                  </span>
                </div>
              </div>

              {/* Quick Action Control Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex items-center gap-2">
                  {isGpsActive ? (
                    <button
                      type="button"
                      onClick={stopGpsBroadcast}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Pause size={13} />
                      <span>Pause Broadcasting</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => startGpsBroadcast(activeOrder.id)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Play size={13} />
                      <span>Resume Broadcasting</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleManualPingNow}
                    className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                    title="Send an immediate coordinate ping to Neon"
                  >
                    <Send size={12} />
                    <span>Ping Now</span>
                  </button>
                </div>

                {simulationMode && (
                  <button
                    type="button"
                    onClick={handleManualStepForward}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                    title="Advance to next step on the campus path"
                  >
                    <FastForward size={13} />
                    <span>Step Forward (Route)</span>
                  </button>
                )}
              </div>
            </div>

            {gpsError && (
              <div className="p-3.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-2">
                <AlertCircle size={15} className="flex-shrink-0 text-amber-400" />
                <span>{gpsError}</span>
              </div>
            )}

            {/* WORKFLOW ACTION BUTTONS (Part 4) */}
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
          /* Empty State: No Active Delivery */
          <div className="p-8 sm:p-12 rounded-3xl bg-[#1E293B] border border-slate-700/80 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-slate-800 text-slate-400 mx-auto flex items-center justify-center">
              <Bike size={32} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white font-['Outfit']">No Active Deliveries</h2>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                You are currently available. When a campus manager assigns a ready order to you, it will appear here automatically.
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
