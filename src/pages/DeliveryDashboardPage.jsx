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
  Send,
  Info,
  Smartphone,
  HelpCircle,
  X,
  Target,
  Radio
} from 'lucide-react';
import { 
  getDeliveryOrders, 
  updateDeliveryOrderStatus, 
  sendDeliveryLocation 
} from '../lib/api';
import DeliveryTrackingMap from '../components/DeliveryTrackingMap';

// Exact Verified Coordinates from Google Maps (https://maps.app.goo.gl/AFSw8xGrMji3TbDJ9)
// Local Home Kitchen: Beside Ayyappa PG Hostel, Neerukonda Village (16.457955° N, 80.494493° E)
const CAMPUS_POINTS = {
  'local-home-kitchen': [16.457955, 80.494493], // Real Verified Restaurant Location
  'campus-delight-dhaba': [16.4645, 80.5080], // North Food Court
  'default-kitchen': [16.457955, 80.494493],
  'hostel-a': [16.4618, 80.5050], // Ganga Hostel Block
  'hostel-b': [16.4612, 80.5055], // Yamuna Hostel Block
  'hostel-c': [16.4608, 80.5060], // Krishna Hostel Block
  'default-destination': [16.4612, 80.5055]
};

// Real SRM-AP Campus Landmarks for 1-Tap Pinpoint Positioning
const CAMPUS_LANDMARKS = [
  { id: 'local-kitchen', name: 'Local Home Kitchen', icon: '🍳', subtitle: 'Neerukonda (Real Restaurant)', coords: [16.457955, 80.494493] },
  { id: 'dining-court', name: 'Central Dining Court', icon: '🍲', subtitle: 'Academic Block', coords: [16.4638, 80.5072] },
  { id: 'academic', name: 'Academic Block 1', icon: '🏫', subtitle: 'Lecture Complex', coords: [16.4635, 80.5065] },
  { id: 'library', name: 'Central Library', icon: '📚', subtitle: 'Study Commons', coords: [16.4640, 80.5058] },
  { id: 'admin', name: 'Admin Block', icon: '🏢', subtitle: 'University Center', coords: [16.4648, 80.5062] },
  { id: 'hostel-a', name: 'Ganga Hostel (A)', icon: '🛌', subtitle: 'Student Block', coords: [16.4618, 80.5050] },
  { id: 'hostel-b', name: 'Yamuna Hostel (B)', icon: '🛌', subtitle: 'Student Block', coords: [16.4612, 80.5055] },
  { id: 'hostel-c', name: 'Krishna Hostel (C)', icon: '🛌', subtitle: 'Student Block', coords: [16.4608, 80.5060] },
  { id: 'gate', name: 'Main Campus Gate', icon: '🚪', subtitle: 'Security Entrance', coords: [16.4655, 80.5040] },
];

// Generate 10 smooth waypoints between start and end
function generateRouteWaypoints(startCoord, endCoord, count = 10) {
  const waypoints = [];
  for (let i = 0; i <= count; i++) {
    const t = i / count;
    // Slight curve to simulate road pathway from Neerukonda to Campus
    const curveOffset = Math.sin(t * Math.PI) * 0.0004;
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

// Haversine distance in meters to calculate movement delta
function calculateDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371e3;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export default function DeliveryDashboardPage({ partner, onLogout, onSwitchToStudent, onSwitchToAdmin }) {
  const [orders, setOrders] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // GPS Tracking State - Defaults to REAL PHONE GPS (false) for real tracking
  const [isGpsActive, setIsGpsActive] = useState(false);
  const [gpsError, setGpsError] = useState(null);
  const [currentCoords, setCurrentCoords] = useState(null);
  const [lastPingTime, setLastPingTime] = useState(null);
  const [pingSuccessCount, setPingSuccessCount] = useState(0);
  const [simulationMode, setSimulationMode] = useState(false); // REAL PHONE GPS BY DEFAULT!
  const [simStepIndex, setSimStepIndex] = useState(0);
  const [isGpsModalOpen, setIsGpsModalOpen] = useState(false);

  const watchIdRef = useRef(null);
  const generalWatcherRef = useRef(null);
  const simTimerRef = useRef(null);
  const lastSentTimeRef = useRef(0);
  const lastTransmittedCoordsRef = useRef(null);
  const manualHoldUntilRef = useRef(0);
  const simulationModeRef = useRef(false);
  const waypointsRef = useRef([]);

  // Helper to resolve coordinates for active order
  const getOrderPoints = useCallback((order) => {
    if (!order) return { start: CAMPUS_POINTS['default-kitchen'], end: CAMPUS_POINTS['default-destination'] };
    const rId = order.restaurantId || order.restaurant_id || 'local-home-kitchen';
    const start = CAMPUS_POINTS[rId] || CAMPUS_POINTS['default-kitchen'];
    const loc = (order.deliveryLocation || order.delivery_location || '').toLowerCase();
    let end = CAMPUS_POINTS['default-destination'];
    if (loc.includes('block a') || loc.includes('ganga')) end = CAMPUS_POINTS['hostel-a'];
    else if (loc.includes('block b') || loc.includes('yamuna')) end = CAMPUS_POINTS['hostel-b'];
    else if (loc.includes('block c') || loc.includes('krishna')) end = CAMPUS_POINTS['hostel-c'];
    return { start, end };
  }, []);

  // Send Location to Neon backend with deadband jitter filter
  const transmitLocation = useCallback(async (targetOrderId, lat, lng, acc = 5, force = false) => {
    const now = Date.now();

    // If manual teleport or pin drag was recently performed, hold for 15s so phone sensor jitter doesn't overwrite it
    if (!force && now < manualHoldUntilRef.current) {
      return;
    }

    if (force) {
      manualHoldUntilRef.current = now + 15000;
    }

    // Deadband jitter filter: If moved less than 2.5 meters, only broadcast heartbeat every 8 seconds
    if (!force && lastTransmittedCoordsRef.current) {
      const dist = calculateDistanceMeters(
        lastTransmittedCoordsRef.current.lat,
        lastTransmittedCoordsRef.current.lng,
        lat,
        lng
      );
      const timeSinceLast = now - lastSentTimeRef.current;
      if (dist < 2.5 && timeSinceLast < 8000) {
        return; // Suppress stationary jitter
      }
      if (timeSinceLast < 2000) {
        return; // Rate limit 2s
      }
    }

    lastSentTimeRef.current = now;
    lastTransmittedCoordsRef.current = { lat, lng };

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
  }, [partner?.id]);

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

  // 3. Start GPS Broadcast (Real Phone Hardware Satellite GNSS or Simulation)
  const startGpsBroadcast = useCallback((targetOrderId, overrideSimMode = null) => {
    stopGpsBroadcast();
    setIsGpsActive(true);
    setGpsError(null);

    const isSim = overrideSimMode !== null ? overrideSimMode : simulationModeRef.current;

    const waypoints = waypointsRef.current.length > 0
      ? waypointsRef.current
      : generateRouteWaypoints(CAMPUS_POINTS['default-kitchen'], CAMPUS_POINTS['default-destination'], 10);

    // Mode A: Simulation Mode
    if (isSim || !navigator.geolocation) {
      let currentIdx = simStepIndex % waypoints.length;
      const initial = waypoints[currentIdx];
      transmitLocation(targetOrderId, initial.lat, initial.lng, 4, true);

      simTimerRef.current = setInterval(() => {
        currentIdx = (currentIdx + 1) % waypoints.length;
        setSimStepIndex(currentIdx);
        const pt = waypoints[currentIdx];
        transmitLocation(targetOrderId, pt.lat, pt.lng, 4);
      }, 3500);

      return;
    }

    // Mode B: REAL PHONE HARDWARE SATELLITE GPS
    try {
      // 1. Immediate position fix
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          setCurrentCoords({ latitude, longitude, accuracy });
          transmitLocation(targetOrderId, latitude, longitude, accuracy, true);
        },
        (err) => {
          console.warn('Initial geolocation error:', err.message);
          if (err.code === 1) {
            setGpsError('⚠️ Location permission denied! Please tap the lock icon in your browser URL bar and allow Location access.');
          } else if (err.code === 2) {
            setGpsError('⚠️ GPS position unavailable. Ensure device Location / GPS is turned ON in phone settings.');
          } else if (err.code === 3) {
            setGpsError('📡 Searching for satellite GPS lock... Step outside or near a window.');
          }
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );

      // 2. Continuous real-time phone tracking
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          setCurrentCoords({ latitude, longitude, accuracy });
          transmitLocation(targetOrderId, latitude, longitude, accuracy);
        },
        (err) => {
          console.warn('Geolocation watch error:', err.message);
          if (err.code === 1) {
            setGpsError('⚠️ Location access blocked. Please enable Location in browser.');
          }
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 15000
        }
      );
    } catch (e) {
      setGpsError(`GPS unsupported: ${e.message}`);
    }
  }, [simStepIndex, stopGpsBroadcast, transmitLocation]);

  // CONTINUOUS PHONE GPS WATCHER (Runs immediately on mount so courier's real position is visible on map)
  useEffect(() => {
    if (!navigator.geolocation) return;

    // Acquire initial fix
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        setCurrentCoords({ latitude, longitude, accuracy });
      },
      (err) => {
        console.warn('Initial phone GPS check:', err.message);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    // Watch position continuously (only updates UI coords when broadcasting is not actively doing so)
    generalWatcherRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        if (watchIdRef.current === null) {
          const { latitude, longitude, accuracy } = pos.coords;
          setCurrentCoords({ latitude, longitude, accuracy });
        }
      },
      () => {},
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );

    return () => {
      if (generalWatcherRef.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(generalWatcherRef.current);
      }
    };
  }, []);

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

  // Auto-resume GPS if active order is in transit on reload
  useEffect(() => {
    if (activeOrder && ['PICKED_UP', 'OUT_FOR_DELIVERY'].includes(activeOrder.status) && !isGpsActive) {
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
    transmitLocation(activeOrder.id, nextPt.lat, nextPt.lng, 4, true);
  };

  // Manual Instant Ping Now (Forces immediate broadcast of phone's GPS)
  const handleManualPingNow = () => {
    if (!activeOrder) return;
    if (currentCoords) {
      transmitLocation(activeOrder.id, currentCoords.latitude, currentCoords.longitude, currentCoords.accuracy || 4, true);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          setCurrentCoords({ latitude, longitude, accuracy });
          transmitLocation(activeOrder.id, latitude, longitude, accuracy, true);
        },
        (err) => alert(`GPS Error: ${err.message}`),
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
  };

  // Workflow Handlers
  const handlePickUpOrder = async () => {
    if (!activeOrder || isUpdating) return;
    setIsUpdating(true);

    try {
      await updateDeliveryOrderStatus(activeOrder.id, 'PICKED_UP', partner.id);
      startGpsBroadcast(activeOrder.id);
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
              onClick={() => setIsGpsModalOpen(true)}
              className="px-2.5 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              title="How to Get Perfect GPS"
            >
              <Smartphone size={13} className="text-blue-400" />
              <span className="hidden sm:inline">GPS Guide</span>
            </button>

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
                    <span>Live GPS Broadcasting</span>
                    <span className="text-[10px] text-emerald-400/80 font-mono">
                      (Pings: {pingSuccessCount})
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>GPS Idle</span>
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
                  {activeOrder.restaurantName || activeOrder.restaurant_name || 'Local Home Kitchen'}
                </div>
                <p className="text-xs text-slate-400">
                  Beside Ayyappa PG Hostel, Neerukonda Village
                </p>
                <div className="text-[10px] text-[#FF8A65] font-mono">
                  📍 16.457955, 80.494493 (Google Maps Verified)
                </div>
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

            {/* LIVE GPS BROADCAST TELEMETRY & ENGINE TOGGLE */}
            <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700/80 space-y-3 relative z-10">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Radio size={16} className={simulationMode ? 'text-indigo-400' : 'text-emerald-400 animate-pulse'} />
                  <span className="font-bold text-xs text-white">Active Location Source:</span>
                  <span className={`px-2.5 py-0.5 rounded-lg font-mono text-[11px] font-bold border ${
                    simulationMode 
                      ? 'bg-slate-900 text-indigo-300 border-indigo-500/40' 
                      : 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                  }`}>
                    {simulationMode ? 'Campus Simulator Route 📍' : '📱 Real Phone Satellite GPS'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const next = !simulationMode;
                      setSimulationMode(next);
                      simulationModeRef.current = next;
                      if (activeOrder && isGpsActive) {
                        startGpsBroadcast(activeOrder.id, next);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
                      !simulationMode 
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-500/20' 
                        : 'bg-slate-700 border-slate-600 text-slate-300 hover:text-white'
                    }`}
                  >
                    <Smartphone size={13} />
                    <span>{simulationMode ? 'Switch to Phone GPS 📡' : 'Phone GPS Active ✅'}</span>
                  </button>
                </div>
              </div>

              {/* Coordinates & Ping Diagnostics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-700/60 text-xs font-mono">
                <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-sans">Latitude</span>
                  <span className="text-white font-bold">{currentCoords?.latitude?.toFixed(5) || '16.45795'}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-sans">Longitude</span>
                  <span className="text-white font-bold">{currentCoords?.longitude?.toFixed(5) || '80.49449'}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-sans">GPS Accuracy</span>
                  <span className={`font-bold ${
                    !currentCoords ? 'text-slate-400' :
                    currentCoords.accuracy <= 15 ? 'text-emerald-400' :
                    currentCoords.accuracy <= 50 ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {!currentCoords ? 'Locating...' :
                     currentCoords.accuracy <= 15 ? `±${Math.round(currentCoords.accuracy)}m (Satellite)` :
                     currentCoords.accuracy <= 50 ? `±${Math.round(currentCoords.accuracy)}m (Wi-Fi)` :
                     `±${Math.round(currentCoords.accuracy)}m (IP/Approx)`}
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-slate-900/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 block font-sans">Last Broadcast</span>
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
                      <span>Pause Broadcast</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => startGpsBroadcast(activeOrder.id)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Play size={13} />
                      <span>Start Broadcast</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleManualPingNow}
                    className="px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                    title="Send current phone coordinate ping to Neon"
                  >
                    <Send size={12} />
                    <span>Ping Phone GPS Now</span>
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

            {/* LIVE CAMPUS MAP & RESTAURANT PIN */}
            <div className="space-y-2 relative z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target size={14} className="text-[#FF5722]" />
                  <span className="text-xs font-black text-white uppercase tracking-wider font-['Outfit']">
                    Live Campus Map (Restaurant to Student)
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">
                  Tap map or drag 🛵 to manually position
                </span>
              </div>

              <DeliveryTrackingMap
                partnerLocation={currentCoords || { 
                  latitude: CAMPUS_POINTS['default-kitchen'][0], 
                  longitude: CAMPUS_POINTS['default-kitchen'][1], 
                  accuracy: 4 
                }}
                restaurantId={activeOrder.restaurantId || activeOrder.restaurant_id || 'local-home-kitchen'}
                restaurantName={activeOrder.restaurantName || activeOrder.restaurant_name || 'Local Home Kitchen'}
                deliveryLocation={activeOrder.deliveryLocation || activeOrder.delivery_location}
                partnerName={partner?.name}
                status={activeOrder.status}
                interactive={true}
                onLocationUpdate={(coords) => {
                  transmitLocation(activeOrder.id, coords.latitude, coords.longitude, coords.accuracy || 4, true);
                }}
              />
            </div>

            {/* 1-TAP CAMPUS LANDMARK TELEPORT BAR */}
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2.5 relative z-10">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <MapPin size={13} className="text-[#FF5722]" />
                  <span>1-Tap Landmark Teleport (Exact Coordinates)</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  Neerukonda & SRM-AP
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CAMPUS_LANDMARKS.map((landmark) => (
                  <button
                    key={landmark.id}
                    type="button"
                    onClick={() => {
                      transmitLocation(activeOrder.id, landmark.coords[0], landmark.coords[1], 3, true);
                    }}
                    className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-[#FF5722]/20 border border-slate-700/80 hover:border-[#FF5722]/60 text-left transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">{landmark.icon}</span>
                      <span className="text-xs font-bold text-slate-200 group-hover:text-white truncate">
                        {landmark.name}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 group-hover:text-slate-300 mt-0.5 truncate">
                      {landmark.subtitle}
                    </div>
                  </button>
                ))}
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
                  <span>PICK UP ORDER FROM LOCAL HOME KITCHEN</span>
                </button>
              )}

              {activeOrder.status === 'PICKED_UP' && (
                <button
                  onClick={handleStartDelivery}
                  disabled={isUpdating}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FF5722] to-[#FF7A50] hover:brightness-110 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-[#FF5722]/30 transition-all cursor-pointer border-none flex items-center justify-center gap-2 animate-pulse"
                >
                  {isUpdating ? <RefreshCw size={18} className="animate-spin" /> : <Truck size={18} />}
                  <span>START DELIVERY (BROADCAST PHONE GPS)</span>
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
                You are currently available. When a manager assigns a ready order to you, it will appear here automatically.
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

      {/* GPS ACCURACY GUIDE MODAL */}
      {isGpsModalOpen && (
        <div className="fixed inset-0 z-[1000] bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="max-w-xl w-full bg-[#1E293B] rounded-3xl border border-slate-700 shadow-2xl p-6 text-white space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold">
                  📍
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white font-['Outfit']">How Phone GPS Tracking Works</h3>
                  <p className="text-[11px] text-slate-400">Live satellite telemetry from delivery partner phone</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsGpsModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer border-none"
              >
                <X size={15} />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <Smartphone size={14} />
                <span>Phone GPS is Active by Default</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                When you open this Delivery Dashboard on your phone, the app directly accesses your phone's hardware satellite GPS receiver. As you drive or walk between <strong>Local Home Kitchen</strong> in Neerukonda and the <strong>Campus Hostels</strong>, your position updates automatically every 2 seconds.
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="font-bold text-white uppercase tracking-wider text-[11px]">
                Troubleshooting Phone Tracking:
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-1.5">
                <div className="font-bold text-amber-400 flex items-center gap-1.5">
                  <span>1. Check Browser Location Permissions</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Tap the <strong>🔒 lock or tune icon</strong> in your mobile browser address bar (next to <code className="text-slate-200">collagebites.vercel.app</code>) → Tap <strong>Permissions</strong> → Set <strong>Location</strong> to <strong>Allow</strong>.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-1.5">
                <div className="font-bold text-blue-400 flex items-center gap-1.5">
                  <span>2. Turn On Phone Location / GPS</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Pull down your phone's notification shade and ensure <strong>Location / GPS</strong> is turned ON with "High Accuracy" enabled.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-1.5">
                <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <span>3. Tap "Ping Phone GPS Now"</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Tap the <strong>"Ping Phone GPS Now"</strong> button on the dashboard to force an immediate satellite broadcast of your phone's coordinates to Neon.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setIsGpsModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-[#FF5722] hover:bg-[#FF7A50] text-white font-bold text-xs cursor-pointer border-none shadow-md shadow-[#FF5722]/30"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
