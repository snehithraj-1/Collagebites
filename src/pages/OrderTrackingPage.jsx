import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  CheckCircle2, 
  Clock, 
  ChefHat, 
  Bike, 
  PackageCheck, 
  Truck, 
  Sparkles, 
  AlertCircle, 
  XCircle, 
  ArrowLeft, 
  ArrowRight, 
  RefreshCw, 
  Copy, 
  Check, 
  MapPin, 
  Phone, 
  Receipt, 
  Utensils 
} from 'lucide-react';
import { getOrderById } from '../lib/api';

const ORDER_STAGES = [
  {
    status: 'PENDING_CONFIRMATION',
    label: 'Order Placed',
    message: 'Awaiting 30-second student confirmation',
    icon: Clock,
    color: '#F59E0B'
  },
  {
    status: 'CONFIRMED',
    label: 'Order Confirmed',
    message: 'Your order has been confirmed.',
    icon: CheckCircle2,
    color: '#10B981'
  },
  {
    status: 'PREPARING',
    label: 'Preparing Food',
    message: 'The restaurant is preparing your food.',
    icon: ChefHat,
    color: '#3B82F6'
  },
  {
    status: 'READY',
    label: 'Food Ready',
    message: 'Your food is ready.',
    icon: PackageCheck,
    color: '#6366F1'
  },
  {
    status: 'PICKED_UP',
    label: 'Picked Up',
    message: 'Your order has been picked up.',
    icon: Bike,
    color: '#8B5CF6'
  },
  {
    status: 'OUT_FOR_DELIVERY',
    label: 'Out for Delivery',
    message: 'Your order is on the way.',
    icon: Truck,
    color: '#06B6D4'
  },
  {
    status: 'DELIVERED',
    label: 'Delivered',
    message: 'Your order has been delivered. Enjoy your meal!',
    icon: Sparkles,
    color: '#10B981'
  }
];

const STAGE_INDEX_MAP = {
  'PENDING_CONFIRMATION': 0,
  'CONFIRMED': 1,
  'PREPARING': 2,
  'READY': 3,
  'PICKED_UP': 4,
  'OUT_FOR_DELIVERY': 5,
  'DELIVERED': 6
};

const TERMINAL_STATUSES = ['DELIVERED', 'CANCELLED', 'EXPIRED'];

export default function OrderTrackingPage({ orderId, onNavigateHome }) {
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isPollingActive, setIsPollingActive] = useState(true);
  const [lastPolledAt, setLastPolledAt] = useState(null);

  const timerRef = useRef(null);

  // 1. Fetch latest order metadata from Neon PostgreSQL
  const fetchOrder = useCallback(async (isSilent = false) => {
    if (!orderId) return;

    if (!isSilent) setIsRefreshing(true);

    try {
      const liveOrder = await getOrderById(orderId);
      setOrder(liveOrder);
      setError(null);
      setLastPolledAt(new Date());

      // Stop polling if order reached a terminal status
      if (TERMINAL_STATUSES.includes(liveOrder.status)) {
        setIsPollingActive(false);
      }
    } catch (err) {
      console.error('[OrderTrackingPage] Error fetching order:', err);
      if (!isSilent) {
        setError(err.message || `Could not find order #${orderId}`);
      }
    } finally {
      if (!isSilent) setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [orderId]);

  // Order metadata poller (5 seconds)
  useEffect(() => {
    setIsLoading(true);
    setIsPollingActive(true);
    fetchOrder(false);

    timerRef.current = setInterval(() => {
      fetchOrder(true);
    }, 5000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [fetchOrder]);

  // Copy order ID helper
  const handleCopyOrderId = () => {
    if (!orderId) return;
    navigator.clipboard.writeText(orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to format ISO timestamps nicely
  const formatTime = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    } catch (e) {
      return '';
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return '';
    }
  };

  // 1. Loading State
  if (isLoading && !order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-[#FFF0EB] border border-[#FFD3C4] flex items-center justify-center text-[#FF5722] mx-auto animate-spin">
          <RefreshCw size={28} />
        </div>
        <h2 className="text-xl font-extrabold text-[#0F172A] font-['Outfit']">Connecting to Kitchen...</h2>
        <p className="text-xs text-[#64748B]">Fetching live order #{orderId} from Neon PostgreSQL</p>
      </div>
    );
  }

  // 2. Error / Order Not Found State
  if (error && !order) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-20 h-20 rounded-3xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500 mx-auto">
          <AlertCircle size={40} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-[#0F172A] font-['Outfit']">Order Not Found</h2>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1.5">{error}</p>
        </div>
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => fetchOrder(false)}
            className="px-5 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw size={14} />
            <span>Try Again</span>
          </button>
          <button
            onClick={onNavigateHome}
            className="px-5 py-2.5 rounded-xl bg-[#FF5722] text-white font-bold text-xs hover:bg-[#E64A19] transition-colors flex items-center gap-1.5 cursor-pointer border-none shadow-md shadow-[#FF5722]/20"
          >
            <ArrowLeft size={14} />
            <span>Back to Kitchens</span>
          </button>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const currentStatus = order.status;
  const currentStageIndex = STAGE_INDEX_MAP[currentStatus] !== undefined ? STAGE_INDEX_MAP[currentStatus] : 1;
  const isTerminal = TERMINAL_STATUSES.includes(currentStatus);
  const isCancelled = currentStatus === 'CANCELLED';
  const isExpired = currentStatus === 'EXPIRED';
  const isDelivered = currentStatus === 'DELIVERED';

  // Find history timestamp mapping
  const getStageTimestamp = (stageStatus) => {
    if (!order.statusHistory || !Array.isArray(order.statusHistory)) {
      if (stageStatus === 'CONFIRMED' && order.confirmedAt) return formatTime(order.confirmedAt);
      if (stageStatus === 'PENDING_CONFIRMATION' && order.createdAt) return formatTime(order.createdAt);
      return null;
    }
    const match = order.statusHistory.find(h => h.status === stageStatus);
    return match ? formatTime(match.changedAt) : null;
  };

  // Status message logic
  const activeStageConfig = ORDER_STAGES.find(s => s.status === currentStatus);
  const currentStatusMessage = isCancelled
    ? 'Your order has been cancelled.'
    : isExpired
    ? 'Your order confirmation expired.'
    : activeStageConfig?.message || 'Processing your order';

  return (
    <div className="pb-24 pt-4 space-y-6 animate-fade-in">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-1.5 text-xs font-bold text-[#64748B] hover:text-[#0F172A] transition-colors cursor-pointer bg-transparent border-none p-0"
          >
            <ArrowLeft size={15} />
            <span>Back to Restaurants</span>
          </button>

          {/* Polling Activity Status Indicator */}
          <div className="flex items-center gap-2">
            {isPollingActive ? (
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Tracking (5s)
              </span>
            ) : (
              <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                Tracking Complete
              </span>
            )}

            <button
              onClick={() => fetchOrder(false)}
              disabled={isRefreshing}
              title="Refresh Status"
              className={`w-8 h-8 rounded-full bg-white border border-[#E2D9D0] flex items-center justify-center text-[#64748B] hover:text-[#FF5722] transition-colors cursor-pointer ${
                isRefreshing ? 'animate-spin text-[#FF5722]' : ''
              }`}
            >
              <RefreshCw size={13} />
            </button>
          </div>
        </div>

        {/* Main Status Banner Card */}
        <div className={`p-6 sm:p-7 rounded-3xl text-white shadow-xl mb-6 relative overflow-hidden transition-all ${
          isCancelled
            ? 'bg-gradient-to-br from-rose-950 via-rose-900 to-[#1E293B] border border-rose-800'
            : isExpired
            ? 'bg-gradient-to-br from-amber-950 via-amber-900 to-[#1E293B] border border-amber-800'
            : isDelivered
            ? 'bg-gradient-to-br from-emerald-950 via-emerald-900 to-[#0F172A] border border-emerald-800'
            : 'bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] border border-slate-800'
        }`}>
          {/* Subtle Glow Backdrop */}
          <div className={`absolute -right-10 -bottom-10 w-44 h-44 rounded-full blur-3xl opacity-30 ${
            isCancelled ? 'bg-rose-500' : isDelivered ? 'bg-emerald-500' : 'bg-[#FF5722]'
          }`} />

          <div className="relative z-10">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                  isCancelled 
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' 
                    : isExpired 
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    : isDelivered 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                    : 'bg-[#FF5722]/20 text-[#FF8A65] border-[#FF5722]/30'
                }`}>
                  Status: {currentStatus}
                </span>

                <button
                  onClick={handleCopyOrderId}
                  className="flex items-center gap-1 text-xs text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded-lg border border-white/10 transition-colors cursor-pointer font-mono"
                  title="Copy Order ID"
                >
                  <span>#{order.id}</span>
                  {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                </button>
              </div>

              {lastPolledAt && (
                <span className="text-[10px] text-slate-400 font-mono">
                  Updated: {formatTime(lastPolledAt)}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black font-['Outfit'] tracking-tight mb-2">
              {currentStatusMessage}
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 flex items-center gap-2 flex-wrap">
              <span>Kitchen: <strong className="text-white">{order.restaurantName || order.restaurant_name}</strong></span>
              <span>•</span>
              <span>Delivering to: <strong className="text-white">{order.deliveryLocation || 'Campus Delivery'}</strong></span>
            </p>

            {/* If Cancelled or Expired, highlight details */}
            {isCancelled && order.cancelledReason && (
              <div className="mt-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-200 text-xs font-medium">
                <strong>Cancellation Reason:</strong> {order.cancelledReason}
              </div>
            )}
            {isExpired && (
              <div className="mt-4 p-3 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-200 text-xs font-medium">
                The 30-second confirmation window expired. No charges were deducted.
              </div>
            )}
          </div>
        </div>

        {/* Assigned Courier Card (Active when courier is assigned or in transit) */}
        {!isCancelled && !isExpired && (order.deliveryPartnerName || ['PICKED_UP', 'OUT_FOR_DELIVERY'].includes(currentStatus)) && (
          <div className="p-5 bg-white rounded-3xl border border-[#F1EAE4] shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-[#FFF0EB] to-[#FFE4DB] text-[#FF5722] flex items-center justify-center font-black text-2xl font-['Outfit'] shadow-xs">
                🛵
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-base text-[#0F172A]">
                    {order.deliveryPartnerName || 'Assigned Campus Rider'}
                  </h4>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                    {currentStatus === 'OUT_FOR_DELIVERY' ? 'Out for Delivery 🚀' : 'Assigned Courier'}
                  </span>
                </div>
                <p className="text-xs text-[#64748B] mt-0.5">SRM-AP Campus Express Courier</p>
                <div className="flex items-center gap-2 text-[11px] text-emerald-600 font-bold mt-1">
                  <span>★ 4.9 Rating</span>
                  <span>•</span>
                  <span className="text-slate-600">Doorstep Drop to {order.deliveryLocation || 'Hostel'}</span>
                </div>
              </div>
            </div>

            {order.deliveryPartnerPhone && (
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${order.deliveryPartnerPhone}`}
                  className="px-4 py-2.5 rounded-2xl bg-[#ECFDF5] hover:bg-[#D1FAE5] text-[#059669] text-xs font-bold transition-colors flex items-center gap-1.5 no-underline shadow-xs"
                >
                  <Phone size={14} />
                  <span>Call Rider</span>
                </a>
              </div>
            )}
          </div>
        )}

        {/* Visual Order Progress Timeline (Part 2) */}
        {!isCancelled && !isExpired && (
          <div className="p-6 sm:p-7 bg-white rounded-3xl border border-[#F1EAE4] shadow-card space-y-6">
            <div className="flex items-center justify-between border-b border-[#F1EAE4] pb-4">
              <div>
                <h2 className="text-lg font-extrabold text-[#0F172A] font-['Outfit']">
                  Order Progress Timeline
                </h2>
                <p className="text-xs text-[#64748B]">Live status updates synchronized with kitchen & courier</p>
              </div>

              {isDelivered && (
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-black">
                  DELIVERED ✅
                </span>
              )}
            </div>

            {/* Vertical Stepper with Dynamic Nodes */}
            <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E2D9D0]">
              {ORDER_STAGES.slice(1).map((stage, idx) => {
                const stageIndex = idx + 1; // Map starting from CONFIRMED = 1
                const isCompleted = currentStageIndex >= stageIndex;
                const isCurrent = currentStageIndex === stageIndex;
                const isUpcoming = currentStageIndex < stageIndex;
                const Icon = stage.icon;
                const timestamp = getStageTimestamp(stage.status);

                return (
                  <div key={stage.status} className="relative flex items-start gap-4">
                    {/* Node Dot / Check Icon */}
                    <div
                      className={`absolute -left-6 sm:-left-8 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs transition-all ${
                        isCompleted && !isCurrent
                          ? 'bg-[#10B981] ring-4 ring-[#ECFDF5]'
                          : isCurrent
                          ? 'bg-[#FF5722] ring-4 ring-[#FFF0EB] scale-110 shadow-md'
                          : 'bg-[#CBD5E1]'
                      }`}
                    >
                      {isCompleted && !isCurrent ? (
                        <CheckCircle2 size={14} />
                      ) : isCurrent ? (
                        <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>

                    {/* Stage Details */}
                    <div className="flex-1 bg-[#FAF8F5] p-3.5 sm:p-4 rounded-2xl border border-[#F1EAE4]">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2">
                          <Icon 
                            size={16} 
                            className={
                              isCurrent 
                                ? 'text-[#FF5722]' 
                                : isCompleted 
                                ? 'text-emerald-600' 
                                : 'text-slate-400'
                            } 
                          />
                          <h3
                            className={`text-sm font-bold ${
                              isCurrent
                                ? 'text-[#FF5722]'
                                : isCompleted
                                ? 'text-[#0F172A]'
                                : 'text-[#94A3B8]'
                            }`}
                          >
                            {stage.label}
                          </h3>
                        </div>

                        {/* Status Label & Timestamp */}
                        <div className="flex items-center gap-2">
                          {timestamp && (
                            <span className="text-[11px] font-bold text-slate-500 font-mono bg-white px-2 py-0.5 rounded-md border border-[#E2D9D0]">
                              {timestamp}
                            </span>
                          )}

                          {isCurrent && (
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-[#FFF0EB] text-[#FF5722] uppercase tracking-wider animate-pulse">
                              In Progress
                            </span>
                          )}
                          {isCompleted && !isCurrent && (
                            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                              Completed ✓
                            </span>
                          )}
                        </div>
                      </div>

                      <p className={`text-xs mt-1 ${isUpcoming ? 'text-slate-400' : 'text-[#475569]'}`}>
                        {stage.message}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Order Status History Log (Part 4) */}
        {order.statusHistory && order.statusHistory.length > 0 && (
          <div className="p-5 sm:p-6 bg-white rounded-3xl border border-[#F1EAE4] shadow-xs space-y-3">
            <h3 className="font-extrabold text-sm text-[#0F172A] font-['Outfit'] flex items-center gap-2">
              <Clock size={16} className="text-[#FF5722]" />
              <span>Status Event Log</span>
            </h3>

            <div className="divide-y divide-[#F1EAE4] text-xs">
              {order.statusHistory.map((item, idx) => (
                <div key={idx} className="py-2 flex items-center justify-between text-[#475569]">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF5722]" />
                    <span className="font-bold text-[#0F172A]">{item.status.replace(/_/g, ' ')}</span>
                  </div>
                  <span className="font-mono text-slate-500 font-semibold">{formatTime(item.changedAt)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Complete Order Items & Receipt Breakdown (Part 1) */}
        <div className="p-6 bg-white rounded-3xl border border-[#F1EAE4] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#F1EAE4] pb-3">
            <h3 className="font-extrabold text-base text-[#0F172A] font-['Outfit'] flex items-center gap-2">
              <Receipt size={17} className="text-[#FF5722]" />
              <span>Order Receipt & Details</span>
            </h3>
            <span className="text-xs font-bold text-[#64748B]">
              Placed: {formatDate(order.createdAt)} at {formatTime(order.createdAt)}
            </span>
          </div>

          {/* Student & Destination info */}
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#F1EAE4] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#334155]">
            <div className="flex items-start gap-2">
              <MapPin size={14} className="text-[#FF5722] mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-bold text-[#64748B] block">Delivery Location:</span>
                <span className="font-extrabold text-[#0F172A]">{order.deliveryLocation || 'Hostel Room Delivery'}</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Phone size={14} className="text-emerald-600 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-bold text-[#64748B] block">Recipient Contact:</span>
                <span className="font-extrabold text-[#0F172A]">{order.studentName} ({order.studentPhone})</span>
              </div>
            </div>
          </div>

          {/* Itemized list */}
          <div className="divide-y divide-[#F1EAE4] text-xs">
            {order.items?.map((item, idx) => {
              const qty = item.qty || item.quantity || 1;
              const price = item.price || item.unit_price || item.unitPrice || 0;
              const lineTotal = item.total || item.total_price || (price * qty);

              return (
                <div key={idx} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-[#FF5722] bg-[#FFF0EB] px-2 py-0.5 rounded-md">
                      {qty}x
                    </span>
                    <span className="font-bold text-[#0F172A]">{item.name || item.item_name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-[#0F172A]">₹{lineTotal}</span>
                    <div className="text-[10px] text-slate-400">₹{price} each</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Financial Breakdown */}
          <div className="pt-3 border-t border-[#F1EAE4] space-y-1.5 text-xs text-[#475569]">
            <div className="flex justify-between">
              <span>Items Subtotal</span>
              <span>₹{Math.max(0, (order.totalAmount || order.total_amount || 0) - 5)}</span>
            </div>
            <div className="flex justify-between">
              <span>Campus Delivery</span>
              <span className="text-emerald-600 font-bold">FREE</span>
            </div>
            <div className="flex justify-between">
              <span>Platform Fee</span>
              <span>₹5</span>
            </div>
            <div className="pt-2 border-t border-[#F1EAE4] flex justify-between text-base font-extrabold text-[#0F172A]">
              <span>Total Bill Paid</span>
              <span className="text-[#FF5722]">₹{order.totalAmount || order.total_amount}</span>
            </div>
          </div>
        </div>

        {/* Bottom Home CTA */}
        <div className="text-center pt-2">
          <button
            onClick={onNavigateHome}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#FF5722] to-[#FF7A50] text-white font-extrabold text-sm shadow-xl shadow-[#FF5722]/30 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer inline-flex items-center justify-center gap-2 border-none"
          >
            <span>Order Food from Another Kitchen</span>
            <ArrowRight size={16} />
          </button>
        </div>

      </div>
    </div>
  );
}
