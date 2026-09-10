import React, { useState, useEffect, useCallback } from 'react';
import { Bike, Phone, MapPin, CheckCircle2, Clock, RefreshCw, LogOut, ArrowLeft, ChevronRight, Package, AlertCircle, Key, Eye, EyeOff } from 'lucide-react';

const DEMO_RIDERS = [
  { name: 'Suresh Reddy', phone: '9398414231', pin: '1234', kitchen: 'Local Home Kitchen' },
  { name: 'Rajesh Kumar', phone: '8240756887', pin: '1234', kitchen: 'CLG Bites' },
  { name: 'Manoj Varma', phone: '8247840765', pin: '1234', kitchen: 'Campus Fleet' }
];

export default function RiderPortalPage({ onBackToStudent }) {
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

  // Fetch orders assigned to this rider
  const fetchAssignedOrders = useCallback(async () => {
    if (!rider) return;
    try {
      const params = new URLSearchParams();
      if (rider.id) params.append('partner_id', rider.id);
      if (rider.phone) params.append('phone', rider.phone);

      const res = await fetch(`/api/rider/orders?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.orders)) {
          setOrders(data.orders);
        }
      }
    } catch (e) {
      console.warn('[Rider Portal Fetch Error]:', e);
    } finally {
      setIsLoadingOrders(false);
    }
  }, [rider]);

  useEffect(() => {
    if (!rider) return;
    setIsLoadingOrders(true);
    fetchAssignedOrders();
    const interval = setInterval(fetchAssignedOrders, 4000);
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
      if (res.ok && data.success && data.partner) {
        setRider(data.partner);
        localStorage.setItem('cb_rider_user', JSON.stringify(data.partner));
      } else {
        setLoginError(data.error || 'Failed to authenticate delivery partner.');
      }
    } catch (err) {
      // Fallback local check
      const matched = DEMO_RIDERS.find(r => r.phone === cleanPhone);
      if (matched && matched.pin === cleanPin) {
        const fallbackPartner = {
          id: `dp-${cleanPhone.slice(-4)}`,
          name: matched.name,
          phone: cleanPhone,
          pin: cleanPin,
          is_active: true
        };
        setRider(fallbackPartner);
        localStorage.setItem('cb_rider_user', JSON.stringify(fallbackPartner));
      } else {
        setLoginError('Incorrect PIN or mobile number. Contact administrator.');
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

    try {
      await fetch('/api/rider/orders/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          status: nextStatus,
          partnerId: rider?.id
        })
      });
      // Also notify shared status endpoint
      await fetch('/api/orders/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          status: nextStatus
        })
      });
    } catch (e) {
      console.warn('[Rider Status Update Error]:', e);
    } finally {
      setStatusUpdatingId(null);
      fetchAssignedOrders();
    }
  };

  // Filter orders
  const activeOrders = orders.filter(o => o.status === 'ASSIGNED' || o.status === 'OUT_FOR_DELIVERY' || o.status === 'CONFIRMED');
  const completedOrders = orders.filter(o => o.status === 'DELIVERED');

  // If not logged in as rider, show mobile-first login view
  if (!rider) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 font-sans">
        <div className="max-w-md w-full mx-auto space-y-6 pt-6">
          {/* Back button */}
          {onBackToStudent && (
            <button
              onClick={onBackToStudent}
              className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0"
            >
              <ArrowLeft size={14} />
              <span>Back to Student Portal</span>
            </button>
          )}

          {/* Header */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#FF5722] flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
              <Bike size={28} />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white font-['Outfit'] tracking-tight">
              Campus Delivery Partner
            </h1>
            <p className="text-xs text-slate-400">
              Assigned rider portal for SRM University campus deliveries
            </p>
          </div>

          {/* Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Rider Mobile Number
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 font-mono">
                  +91
                </span>
                <input
                  type="tel"
                  placeholder="Enter 10-digit mobile"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-3 py-2.5 text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-[#FF5722]"
                />
              </div>
            </div>

            {/* Security PIN */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Security PIN
                </label>
                <span className="text-[10px] text-slate-500 font-semibold">
                  Provided by Admin
                </span>
              </div>
              <div className="relative">
                <Key size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPin ? 'text' : 'password'}
                  placeholder="Enter 4-digit PIN"
                  maxLength={6}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white font-mono tracking-widest placeholder:tracking-normal placeholder:text-slate-600 focus:outline-none focus:border-[#FF5722]"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 bg-transparent border-none p-0 cursor-pointer"
                >
                  {showPin ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="text-xs text-rose-400 bg-rose-950/40 border border-rose-800/60 rounded-xl p-2.5 flex items-start gap-2">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              onClick={() => handleLogin()}
              disabled={isLoggingIn || phoneInput.length < 10 || pinInput.length < 4}
              className="w-full py-3 bg-[#FF5722] hover:bg-[#E64A19] disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all cursor-pointer border-none shadow-md flex items-center justify-center gap-2"
            >
              {isLoggingIn ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In as Rider</span>
                  <ChevronRight size={16} />
                </>
              )}
            </button>

            {/* Quick Demo Selectors */}
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Quick Demo Rider Logins:
                </span>
                <span className="text-[10px] text-slate-500">Auto-fills Mobile + PIN</span>
              </div>
              <div className="space-y-1.5">
                {DEMO_RIDERS.map((r) => (
                  <button
                    key={r.phone}
                    onClick={() => {
                      setPhoneInput(r.phone);
                      setPinInput(r.pin);
                      handleLogin(r.phone, r.pin);
                    }}
                    className="w-full text-left p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 text-xs flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div>
                      <div className="font-bold text-white">{r.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        +91 {r.phone} • PIN: <span className="text-amber-400 font-bold">{r.pin}</span> • {r.kitchen}
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-orange-400">Login →</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-[11px] text-slate-500 py-4">
          CampusBites Dispatch • SRM AP Gate 3
        </div>
      </div>
    );
  }

  // Active Rider Dashboard
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Top Mobile Bar */}
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-4 py-3 shadow-md">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FF5722] text-white flex items-center justify-center shrink-0">
              <Bike size={20} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm text-white font-['Outfit'] truncate max-w-[150px]">
                  {rider.name}
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                +91 {rider.phone} • Active Rider
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => fetchAssignedOrders()}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border-none cursor-pointer"
              title="Refresh assigned orders"
            >
              <RefreshCw size={14} className={isLoadingOrders ? 'animate-spin text-orange-400' : ''} />
            </button>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 transition-colors border-none cursor-pointer"
              title="Log out"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-md w-full mx-auto p-4 space-y-4 pb-20">
        
        {/* Navigation / Back to student app button */}
        {onBackToStudent && (
          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <button
              onClick={onBackToStudent}
              className="inline-flex items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0 text-xs font-semibold"
            >
              <ArrowLeft size={13} />
              <span>Exit Rider View</span>
            </button>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              Live Sync On
            </span>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-bold">
          <button
            onClick={() => setActiveTab('active')}
            className={`py-2 rounded-lg transition-all border-none cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'active'
                ? 'bg-[#FF5722] text-white shadow-xs'
                : 'bg-transparent text-slate-400 hover:text-white'
            }`}
          >
            <span>Assigned Deliveries</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/30 text-white font-mono">
              {activeOrders.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`py-2 rounded-lg transition-all border-none cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'completed'
                ? 'bg-slate-800 text-white shadow-xs'
                : 'bg-transparent text-slate-400 hover:text-white'
            }`}
          >
            <span>Completed</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-950 text-slate-300 font-mono">
              {completedOrders.length}
            </span>
          </button>
        </div>

        {/* Orders List */}
        {activeTab === 'active' ? (
          <div className="space-y-3">
            {activeOrders.length === 0 ? (
              <div className="bg-slate-900 rounded-2xl p-8 text-center border border-slate-800 space-y-2">
                <Package size={32} className="mx-auto text-slate-600" />
                <h3 className="font-bold text-sm text-white">No Assigned Orders</h3>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  New orders assigned by Local Home Kitchen or CLG Bites will automatically appear here.
                </p>
              </div>
            ) : (
              activeOrders.map((order) => {
                const isDispatched = order.status === 'OUT_FOR_DELIVERY';
                const isUpdating = statusUpdatingId === order.id;

                return (
                  <div
                    key={order.id}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3.5 shadow-md"
                  >
                    {/* Top Row: Order ID & Status Badge */}
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                      <div>
                        <span className="font-mono font-black text-sm text-[#FF5722]">
                          #{order.id}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          From: <strong className="text-white">{order.restaurant_name || 'Kitchen'}</strong>
                        </div>
                      </div>

                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                        isDispatched
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                          : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                      }`}>
                        {isDispatched ? 'Out For Delivery' : 'Assigned to You'}
                      </span>
                    </div>

                    {/* Delivery Destination */}
                    <div className="flex items-start gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 text-xs">
                      <MapPin size={15} className="text-[#FF5722] shrink-0 mt-0.5" />
                      <div>
                        <span className="text-slate-400 text-[10px] block font-bold uppercase">Delivery Drop Point:</span>
                        <span className="font-bold text-white text-xs">{order.delivery_location || 'SRM University • Gate 3'}</span>
                      </div>
                    </div>

                    {/* Student Info & 1-Tap Call */}
                    <div className="flex items-center justify-between bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60 text-xs">
                      <div>
                        <span className="text-slate-400 text-[10px] block font-bold uppercase">Customer:</span>
                        <span className="font-bold text-white text-xs">{order.student_name || 'Student'}</span>
                        <span className="font-mono text-[11px] text-slate-400 block">{order.student_phone || '—'}</span>
                      </div>

                      {order.student_phone && (
                        <a
                          href={`tel:${order.student_phone}`}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors no-underline shadow-xs"
                        >
                          <Phone size={12} />
                          <span>Call Student</span>
                        </a>
                      )}
                    </div>

                    {/* Order Amount & Items */}
                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-slate-400">Total Amount:</span>
                      <span className="font-mono font-black text-sm text-emerald-400">
                        ₹{order.total_amount} <span className="text-[10px] text-slate-500 font-normal">({order.payment_method || 'COD'})</span>
                      </span>
                    </div>

                    {/* Rider Action Buttons */}
                    <div className="pt-1">
                      {!isDispatched ? (
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, 'OUT_FOR_DELIVERY')}
                          disabled={isUpdating}
                          className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all cursor-pointer border-none shadow-md flex items-center justify-center gap-2"
                        >
                          {isUpdating ? (
                            <RefreshCw size={13} className="animate-spin" />
                          ) : (
                            <Bike size={14} />
                          )}
                          <span>Pick Up Order & Start Delivery</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, 'DELIVERED')}
                          disabled={isUpdating}
                          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all cursor-pointer border-none shadow-md flex items-center justify-center gap-2"
                        >
                          {isUpdating ? (
                            <RefreshCw size={13} className="animate-spin" />
                          ) : (
                            <CheckCircle2 size={14} />
                          )}
                          <span>Mark Handed Over & Delivered</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {completedOrders.length === 0 ? (
              <div className="bg-slate-900 rounded-2xl p-8 text-center border border-slate-800 text-xs text-slate-500">
                No completed deliveries yet.
              </div>
            ) : (
              completedOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 text-xs space-y-2 opacity-90"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-white">#{order.id}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <CheckCircle2 size={10} />
                      <span>Delivered</span>
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>{order.student_name || 'Student'} • Gate 3</span>
                    <span className="font-mono text-emerald-400 font-bold">₹{order.total_amount}</span>
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
