import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Bike, Phone, MapPin, CheckCircle2, Clock, RefreshCw, LogOut, 
  ChevronRight, Package, AlertCircle, Key, Eye, EyeOff, Navigation, 
  Volume2, VolumeX, ShieldCheck, DollarSign, Store, User, Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

const DEMO_RIDERS = [
  { name: 'Suresh Reddy', phone: '9398414231', pin: '1234', kitchen: 'Local Home Kitchen' },
  { name: 'Rajesh Kumar', phone: '8240756887', pin: '1234', kitchen: 'CLG Bites' },
  { name: 'Manoj Varma', phone: '8247840765', pin: '1234', kitchen: 'Campus Fleet' }
];

export default function App() {
  const [rider, setRider] = useState(() => {
    try {
      const saved = localStorage.getItem('cb_rider_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [phoneInput, setPhoneInput] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Orders state
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'completed'
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const prevOrderCountRef = useRef(0);

  // Play audio chime when new orders arrive
  const playChime = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch (e) {}
  }, [soundEnabled]);

  // Fetch orders assigned to this rider
  const fetchAssignedOrders = useCallback(async (silent = false) => {
    if (!rider) return;
    if (!silent) setIsLoadingOrders(true);
    try {
      const params = new URLSearchParams();
      if (rider.id) params.append('riderId', rider.id);
      if (rider.phone) params.append('phone', rider.phone);

      const res = await fetch(`/api/rider/orders?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.orders)) {
          const activeCount = data.orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length;
          if (activeCount > prevOrderCountRef.current && prevOrderCountRef.current !== 0) {
            playChime();
          }
          prevOrderCountRef.current = activeCount;
          setOrders(data.orders);
        }
      }
    } catch (e) {
      console.warn('[Rider Portal Fetch Error]:', e);
    } finally {
      setIsLoadingOrders(false);
    }
  }, [rider, playChime]);

  useEffect(() => {
    if (!rider) return;
    fetchAssignedOrders();
    const interval = setInterval(() => fetchAssignedOrders(true), 4000);
    return () => clearInterval(interval);
  }, [rider, fetchAssignedOrders]);

  // Login handler
  const handleLogin = async (phoneToUse, pinToUse) => {
    const cleanPhone = (phoneToUse || phoneInput).replace(/\D/g, '').slice(-10);
    const cleanPin = (pinToUse || pinInput).trim();

    if (cleanPhone.length < 10) {
      setLoginError('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!cleanPin) {
      setLoginError('Please enter your 4-digit security PIN.');
      return;
    }

    setLoginError('');
    setIsLoggingIn(true);

    try {
      const res = await fetch('/api/rider/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone, pin: cleanPin })
      });
      const data = await res.json();
      const partnerData = data.partner || data.rider;
      if (res.ok && data.success && partnerData) {
        setRider(partnerData);
        localStorage.setItem('cb_rider_user', JSON.stringify(partnerData));
      } else {
        setLoginError(data.error || 'Invalid phone or PIN. Contact kitchen admin.');
      }
    } catch (err) {
      // Local fallback for quick offline demo
      const matched = DEMO_RIDERS.find(r => r.phone === cleanPhone);
      if (matched && matched.pin === cleanPin) {
        const fallbackPartner = {
          id: `dp-${cleanPhone.slice(-4)}`,
          name: matched.name,
          phone: cleanPhone,
          pin: cleanPin,
          restaurant_id: 'all',
          restaurantId: 'all',
          total_deliveries: 12
        };
        setRider(fallbackPartner);
        localStorage.setItem('cb_rider_user', JSON.stringify(fallbackPartner));
      } else {
        setLoginError('Unable to connect to delivery dispatch. Check connection.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setRider(null);
    setOrders([]);
    localStorage.removeItem('cb_rider_user');
  };

  // Status transition handler: ASSIGNED -> OUT_FOR_DELIVERY -> DELIVERED
  const handleUpdateOrderStatus = async (orderId, nextStatus) => {
    setStatusUpdatingId(orderId);

    // Optimistic UI update
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: nextStatus } : o));

    if (nextStatus === 'DELIVERED') {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.7 }
        });
      } catch (e) {}
    }

    try {
      await fetch('/api/rider/orders/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          status: nextStatus,
          riderId: rider?.id
        })
      });
    } catch (e) {
      console.warn('[Rider Status Update Error]:', e);
    } finally {
      setStatusUpdatingId(null);
      fetchAssignedOrders(true);
    }
  };

  // Filter orders
  const activeOrders = orders.filter(o => o.status !== 'DELIVERED' && o.status !== 'CANCELLED');
  const completedOrders = orders.filter(o => o.status === 'DELIVERED');
  const totalCashToCollect = activeOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

  // ----------------------------------------------------
  // 1. LOGIN SCREEN
  // ----------------------------------------------------
  if (!rider) {
    return (
      <div className="min-h-screen bg-[#080D1A] text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6">
        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          
          {/* Brand & Badge */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#FF5722] to-amber-500 mx-auto flex items-center justify-center shadow-lg shadow-orange-500/20 text-white">
              <Bike size={32} />
            </div>
            <h1 className="text-2xl font-black font-['Outfit'] text-white tracking-tight pt-2">
              Campus Delivery Partner
            </h1>
            <p className="text-xs text-slate-400">
              Assigned rider dispatch portal for SRM University campus deliveries
            </p>
          </div>

          {/* Error Banner */}
          {loginError && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          {/* Form */}
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleLogin();
            }}
            className="space-y-4"
          >
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Rider Mobile Number
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs font-mono">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="Enter 10-digit mobile"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ''))}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-[#FF5722] transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Security PIN
                </label>
                <span className="text-[10px] text-slate-500">Provided by Admin</span>
              </div>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  maxLength={6}
                  placeholder="Enter 4-digit PIN"
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-sm tracking-widest focus:outline-none focus:border-[#FF5722] transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#FF5722] to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-orange-500/25 transition-all disabled:opacity-50"
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In as Rider</span>
                  <ChevronRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Rider Accounts */}
          <div className="pt-4 border-t border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold uppercase tracking-wider">
              <span>Quick Demo Rider Logins:</span>
              <span className="text-[10px] text-slate-600 lowercase">Auto-fills Mobile + PIN</span>
            </div>
            <div className="space-y-1.5">
              {DEMO_RIDERS.map((r, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setPhoneInput(r.phone);
                    setPinInput(r.pin);
                    handleLogin(r.phone, r.pin);
                  }}
                  className="w-full p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-orange-500/50 hover:bg-slate-800/50 flex items-center justify-between text-left transition-all group"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-200 group-hover:text-white">{r.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      +91 {r.phone} • PIN: <span className="text-amber-400 font-bold">1234</span> • {r.kitchen}
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-orange-400 group-hover:translate-x-0.5 transition-transform">
                    Login →
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="text-center text-[10px] text-slate-600">
            Connected to Neon PostgreSQL • Campus Dispatch Gate 3
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // 2. RIDER DASHBOARD
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-[#080D1A] text-slate-100 pb-20">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF5722] to-amber-500 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
              <Bike size={20} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-bold text-white text-sm leading-tight">{rider.name}</h2>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Online" />
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                +91 {rider.phone} • <span className="text-orange-400">{rider.kitchen || 'Campus Fleet'}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-xl border transition-colors ${
                soundEnabled 
                  ? 'bg-slate-800 text-amber-400 border-amber-500/30' 
                  : 'bg-slate-900 text-slate-500 border-slate-800'
              }`}
              title={soundEnabled ? 'Mute Chime' : 'Enable Chime'}
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>

            <button
              onClick={() => fetchAssignedOrders()}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
              title="Refresh Orders"
            >
              <RefreshCw size={16} className={isLoadingOrders ? 'animate-spin text-orange-400' : ''} />
            </button>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30"
              title="Log Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-2xl mx-auto p-4 space-y-4">
        
        {/* KPI Metrics */}
        <div className="grid grid-cols-3 gap-2.5">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 text-center">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active</div>
            <div className="text-xl font-black text-[#FF5722] font-mono mt-0.5">{activeOrders.length}</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 text-center">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Completed</div>
            <div className="text-xl font-black text-emerald-400 font-mono mt-0.5">{completedOrders.length}</div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3 text-center">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">To Collect</div>
            <div className="text-xl font-black text-amber-400 font-mono mt-0.5">₹{totalCashToCollect}</div>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="flex rounded-xl bg-slate-900 border border-slate-800 p-1">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'active'
                ? 'bg-[#FF5722] text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Active Deliveries</span>
            {activeOrders.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-white text-[#FF5722] text-[10px] font-black">
                {activeOrders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('completed')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'completed'
                ? 'bg-slate-800 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Delivered History</span>
            <span className="text-[10px] text-slate-500 font-mono">({completedOrders.length})</span>
          </button>
        </div>

        {/* ======================================================== */}
        {/* TAB 1: ACTIVE DELIVERIES                                  */}
        {/* ======================================================== */}
        {activeTab === 'active' && (
          <div className="space-y-3">
            {activeOrders.length === 0 ? (
              <div className="bg-slate-900/50 border border-dashed border-slate-800 rounded-3xl p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
                  <Package size={24} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">No Assigned Deliveries Right Now</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    When the kitchen assigns an order to your phone number, it will instantly pop up here with an alert chime.
                  </p>
                </div>
                <button
                  onClick={() => fetchAssignedOrders()}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold inline-flex items-center gap-1.5"
                >
                  <RefreshCw size={13} />
                  <span>Check Now</span>
                </button>
              </div>
            ) : (
              activeOrders.map((order) => {
                const isOutForDelivery = order.status === 'OUT_FOR_DELIVERY' || order.status === 'OUT FOR DELIVERY';
                const itemsList = Array.isArray(order.items) ? order.items : [];

                return (
                  <div
                    key={order.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-3 relative overflow-hidden"
                  >
                    {/* Status Ribbon */}
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-sm text-[#FF5722]">
                          #{order.id}
                        </span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Clock size={12} />
                          <span>{order.created_at ? new Date(order.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}</span>
                        </span>
                      </div>

                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
                        isOutForDelivery
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                          : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                      }`}>
                        {isOutForDelivery ? '🛵 On The Way' : '📦 Assigned to You'}
                      </span>
                    </div>

                    {/* Customer Info Card */}
                    <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Student</div>
                          <div className="text-sm font-black text-white flex items-center gap-1.5 mt-0.5">
                            <User size={14} className="text-orange-400" />
                            <span>{order.student_name || order.studentName || 'Student'}</span>
                          </div>
                        </div>

                        {/* 1-Tap Call Student */}
                        {(order.student_phone || order.studentPhone) && (
                          <a
                            href={`tel:${order.student_phone || order.studentPhone}`}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all shrink-0"
                          >
                            <Phone size={13} />
                            <span>Call Student</span>
                          </a>
                        )}
                      </div>

                      {/* Delivery Gate / Location */}
                      <div className="pt-2 border-t border-slate-850 flex items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-1.5 text-slate-300 truncate">
                          <MapPin size={14} className="text-red-400 shrink-0" />
                          <span className="font-semibold truncate">
                            {order.delivery_location || order.deliveryLocation || 'SRM University - Gate 3'}
                          </span>
                        </div>

                        {/* Navigation link */}
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(order.delivery_location || 'SRM University AP Gate 3')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold shrink-0"
                        >
                          <Navigation size={11} />
                          <span>Map</span>
                        </a>
                      </div>
                    </div>

                    {/* Restaurant & Items Breakdown */}
                    <div className="text-xs space-y-1 text-slate-300">
                      <div className="flex items-center justify-between text-slate-400 text-[11px]">
                        <span className="flex items-center gap-1 font-bold text-slate-300">
                          <Store size={12} className="text-amber-400" />
                          <span>{order.restaurant_name || order.restaurantName || 'Campus Kitchen'}</span>
                        </span>
                        <span className="font-mono font-black text-emerald-400 text-sm">
                          Collect ₹{order.total_amount ?? order.totalAmount ?? 0}
                        </span>
                      </div>

                      {itemsList.length > 0 && (
                        <div className="bg-slate-950/40 p-2 rounded-lg text-[11px] space-y-0.5">
                          {itemsList.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-slate-300">
                              <span className="truncate pr-2">{item.name}</span>
                              <span className="font-mono font-bold text-white shrink-0">x{item.quantity || 1}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Step-by-Step Delivery Actions */}
                    <div className="pt-1">
                      {!isOutForDelivery ? (
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, 'OUT_FOR_DELIVERY')}
                          disabled={statusUpdatingId === order.id}
                          className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer disabled:opacity-50"
                        >
                          {statusUpdatingId === order.id ? (
                            <RefreshCw size={14} className="animate-spin" />
                          ) : (
                            <Bike size={15} />
                          )}
                          <span>Picked Up from Kitchen (Start Ride)</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, 'DELIVERED')}
                          disabled={statusUpdatingId === order.id}
                          className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer disabled:opacity-50"
                        >
                          {statusUpdatingId === order.id ? (
                            <RefreshCw size={14} className="animate-spin" />
                          ) : (
                            <CheckCircle2 size={15} />
                          )}
                          <span>Handed Over & Collected Cash (₹{order.total_amount})</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: COMPLETED HISTORY                                  */}
        {/* ======================================================== */}
        {activeTab === 'completed' && (
          <div className="space-y-3">
            {completedOrders.length === 0 ? (
              <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 text-center text-slate-400 text-xs">
                No completed deliveries recorded today yet.
              </div>
            ) : (
              completedOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-slate-900/70 border border-slate-800/80 rounded-2xl p-3.5 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white">#{order.id}</span>
                      <span className="px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                        Delivered
                      </span>
                    </div>
                    <div className="text-slate-400 text-[11px]">
                      {order.student_name || order.studentName || 'Student'} • {order.delivery_location || 'Gate 3'}
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <div className="font-black text-emerald-400 text-sm">₹{order.total_amount ?? order.totalAmount}</div>
                    <div className="text-[10px] text-slate-500">Collected</div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
