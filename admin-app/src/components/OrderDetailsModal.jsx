import React, { useState } from 'react';
import { X, ArrowLeft, User, MapPin, Phone, Mail, Clock, ShoppingBag, CheckCircle2, ArrowRight, ChefHat, PackageCheck, Bike, CheckCheck } from 'lucide-react';

export default function OrderDetailsModal({
  order,
  deliveryPartners = [],
  onAssignPartner,
  onUnassignPartner,
  onOpenDeliveryPartners,
  onClose,
  onUpdateStatus,
  onCancelOrder,
  onDeleteOrder
}) {
  const [showPartnerPicker, setShowPartnerPicker] = useState(false);

  if (!order) return null;

  const orderItems = order.order_items || order.items || [];

  const statuses = [
    { key: 'CONFIRMED', label: 'CONFIRMED', color: 'bg-blue-600/80 text-white' },
    { key: 'ACCEPTED', label: '✅ ACCEPTED', color: 'bg-emerald-600 text-white font-black' },
    { key: 'PREPARING', label: '🍳 PREPARING', color: 'bg-amber-500 text-slate-950 font-black' },
    { key: 'READY', label: '📦 READY', color: 'bg-purple-600 text-white font-black' },
    { key: 'OUT_FOR_DELIVERY', label: '🚀 OUT_FOR_DELIVERY', color: 'bg-cyan-500 text-slate-950 font-black' },
    { key: 'DELIVERED', label: '✅ DELIVERED', color: 'bg-emerald-500 text-slate-950 font-black' }
  ];

  // Determine the primary next progression step for admin
  const getNextStageAction = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return {
          nextStatus: 'ACCEPTED',
          title: '✅ ACCEPT ORDER & RETURN',
          subtitle: 'Accept this order & notify student to prepare food',
          icon: CheckCircle2,
          btnStyle: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 ring-4 ring-emerald-500/20 shadow-lg shadow-emerald-500/20'
        };
      case 'ACCEPTED':
        return {
          nextStatus: 'PREPARING',
          title: '🍳 START PREPARING FOOD',
          subtitle: 'Notify student that cooking has started in kitchen',
          icon: ChefHat,
          btnStyle: 'bg-amber-500 hover:bg-amber-400 text-slate-950 ring-4 ring-amber-500/20 shadow-lg shadow-amber-500/20'
        };
      case 'PREPARING':
        return {
          nextStatus: 'READY',
          title: '📦 MARK FOOD PACKED & READY',
          subtitle: 'Meal is prepared and at the dispatch counter',
          icon: PackageCheck,
          btnStyle: 'bg-purple-600 hover:bg-purple-500 text-white ring-4 ring-purple-600/20 shadow-lg shadow-purple-600/20'
        };
      case 'READY':
        return {
          nextStatus: 'OUT_FOR_DELIVERY',
          title: '🛵 DISPATCH (OUT FOR DELIVERY)',
          subtitle: 'Courier is delivering directly to SRM University Gate 3',
          icon: Bike,
          btnStyle: 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 ring-4 ring-cyan-500/20 shadow-lg shadow-cyan-500/20'
        };
      case 'OUT_FOR_DELIVERY':
        return {
          nextStatus: 'DELIVERED',
          title: '✅ CONFIRM DELIVERED AT GATE 3',
          subtitle: 'Student has collected their order',
          icon: CheckCheck,
          btnStyle: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 ring-4 ring-emerald-500/20 shadow-lg shadow-emerald-500/20'
        };
      default:
        return null;
    }
  };

  const nextAction = getNextStageAction(order.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" />

      {/* Modal Container: Mobile-Optimized with Spring Scale Animation */}
      <div className="relative bg-[#111827] border border-slate-700 w-full max-w-lg rounded-3xl shadow-2xl flex flex-col max-h-[92vh] text-white text-xs overflow-hidden animate-scale-in">
        
        {/* Fixed Header with Direct Go Back Button */}
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-800 bg-[#0F172A] shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-black text-base text-[#FF5722]">
                #{order.id}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full font-black text-[10px] uppercase border ${
                order.status === 'ACCEPTED'
                  ? 'bg-emerald-950/60 text-emerald-400 border-emerald-700'
                  : order.status === 'PREPARING'
                  ? 'bg-amber-950/60 text-amber-400 border-amber-700'
                  : order.status === 'READY'
                  ? 'bg-purple-950/60 text-purple-400 border-purple-700'
                  : order.status === 'OUT_FOR_DELIVERY'
                  ? 'bg-cyan-950/60 text-cyan-400 border-cyan-700'
                  : order.status === 'DELIVERED'
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                  : 'bg-blue-950/60 text-blue-400 border-blue-700'
              }`}>
                {order.status}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Kitchen: <strong className="text-white">{order.restaurant_name || 'Campus Kitchen'}</strong>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center gap-1 font-bold text-xs transition-colors cursor-pointer border border-slate-700 touch-manipulation"
              title="Go Back to Dashboard"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer border border-slate-700 touch-manipulation"
              title="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 touch-pan-y">
          
          {/* Student Customer Information */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <User size={13} className="text-blue-400" />
              <span>Student Customer Information</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-slate-200">
              <div>
                <span className="text-slate-500 block text-[10px]">Name:</span>
                <span className="font-extrabold text-sm text-white">{order.student_name}</span>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px]">Email:</span>
                <span className="font-mono text-xs truncate block text-slate-300">{order.student_email || 'N/A'}</span>
              </div>

              <div>
                <span className="text-slate-500 block text-[10px]">Mobile Contact:</span>
                {order.student_phone ? (
                  <a
                    href={`tel:${order.student_phone}`}
                    className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 font-mono font-black text-xs mt-0.5 bg-emerald-950/40 px-2 py-0.5 rounded-lg border border-emerald-800"
                  >
                    <Phone size={11} />
                    <span>{order.student_phone}</span>
                  </a>
                ) : (
                  <span className="text-slate-500 text-xs">Not provided</span>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-start gap-1.5">
              <MapPin size={14} className="text-[#FF5722] shrink-0 mt-0.5" />
              <div>
                <span className="text-slate-500 block text-[10px]">Campus Drop Destination:</span>
                <span className="font-black text-xs text-white">{order.delivery_location || 'SRM University - Gate 3'}</span>
              </div>
            </div>

            {order.instructions && (
              <div className="pt-2 border-t border-slate-800">
                <span className="text-slate-500 block text-[10px]">Cooking Notes:</span>
                <p className="text-amber-300 italic mt-0.5 bg-amber-950/30 p-2 rounded-xl border border-amber-900/40">{order.instructions}</p>
              </div>
            )}
          </div>

          {/* Assigned Delivery Partner Section */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-2.5">
            <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Bike size={14} className="text-cyan-400" />
                <span>Delivery Partner Assignment</span>
              </div>
              {order.delivery_partner_name && (
                <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-bold border border-cyan-500/30">
                  Assigned
                </span>
              )}
            </div>

            {order.delivery_partner_name ? (
              <div className="flex flex-wrap items-center justify-between gap-2.5 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center text-xl font-black">
                    🛵
                  </div>
                  <div>
                    <span className="font-extrabold text-sm text-white block">
                      {order.delivery_partner_name}
                    </span>
                    {order.delivery_partner_phone && (
                      <span className="text-slate-400 font-mono text-xs block">
                        {order.delivery_partner_phone}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {order.delivery_partner_phone && (
                    <a
                      href={`tel:${order.delivery_partner_phone}`}
                      className="py-1.5 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 cursor-pointer"
                    >
                      <Phone size={12} />
                      <span>Call Partner</span>
                    </a>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowPartnerPicker(!showPartnerPicker)}
                    className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition-colors cursor-pointer"
                  >
                    <span>🔄 Switch Partner</span>
                  </button>

                  {onUnassignPartner && (
                    <button
                      type="button"
                      onClick={() => {
                        onUnassignPartner(order.id);
                        setShowPartnerPicker(false);
                      }}
                      className="py-1.5 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold text-xs flex items-center gap-1.5 border border-rose-500/40 transition-colors cursor-pointer"
                    >
                      <span>✕ Unassign</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                <div>
                  <span className="text-xs text-amber-300 font-bold block">
                    ⚠️ No Delivery Partner Assigned Yet
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Assign a registered delivery partner to handle doorstep delivery to SRM Gate 3.
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPartnerPicker(!showPartnerPicker)}
                  className="py-2 px-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20 cursor-pointer border-none transition-all active:scale-95 shrink-0"
                >
                  <span>🛵 Assign Partner</span>
                </button>
              </div>
            )}

            {/* Inline Courier Selector */}
            {showPartnerPicker && (
              <div className="p-3 bg-slate-900 rounded-xl border border-cyan-500/40 space-y-2.5 animate-scale-in">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-black text-slate-300 uppercase tracking-wider text-[10px]">
                    Choose Delivery Courier:
                  </span>
                  {onOpenDeliveryPartners && (
                    <button
                      type="button"
                      onClick={onOpenDeliveryPartners}
                      className="text-[10px] text-cyan-400 hover:underline font-bold cursor-pointer border-none bg-transparent"
                    >
                      + Register New Courier
                    </button>
                  )}
                </div>

                {deliveryPartners.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2 text-center">
                    No delivery partners registered yet.
                  </p>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {deliveryPartners.map((p) => {
                      const isAssigned = order.delivery_partner_id === p.id;
                      return (
                        <div
                          key={p.id}
                          onClick={() => {
                            if (onAssignPartner) {
                              onAssignPartner(order.id, p);
                            }
                            setShowPartnerPicker(false);
                          }}
                          className={`p-2 rounded-xl flex items-center justify-between gap-2 border transition-all cursor-pointer ${
                            isAssigned
                              ? 'bg-cyan-500/20 border-cyan-500/50'
                              : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/60 hover:border-cyan-500/40'
                          }`}
                        >
                          <div>
                            <span className="font-extrabold text-white text-xs block leading-tight">
                              {p.name}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {p.phone}
                            </span>
                          </div>

                          <button
                            type="button"
                            className="py-1 px-2.5 rounded-lg bg-cyan-400 text-slate-950 font-black text-[11px] cursor-pointer border-none shadow-xs transition-all pointer-events-none"
                          >
                            {isAssigned ? 'Selected' : 'Assign ➔'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Dishes List */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <ShoppingBag size={13} className="text-blue-400" />
                <span>Ordered Dishes ({orderItems.length})</span>
              </div>
              <span className="text-xs font-mono font-black text-emerald-400">
                Total: ₹{order.total_amount}
              </span>
            </div>

            <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-900/60 divide-y divide-slate-800/80">
              {orderItems.map((item, idx) => (
                <div key={idx} className="p-2.5 px-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-slate-800 text-slate-300 font-mono text-[10px] flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-white text-xs">{item.name}</span>
                    <span className="text-slate-400 text-xs font-mono font-extrabold ml-1">x{item.quantity}</span>
                  </div>
                  <span className="font-mono font-black text-emerald-400 text-xs">
                    ₹{item.price * item.quantity}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Manual Stage Progression Override */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Direct Status Override</span>
              <span className="text-slate-400 font-mono text-[10px]">Tap stage to jump</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pt-0.5">
              {statuses.map((st) => (
                <button
                  key={st.key}
                  onClick={() => {
                    onUpdateStatus && onUpdateStatus(order.id, st.key);
                    onClose && onClose();
                  }}
                  className={`py-2 px-2 rounded-xl text-[11px] font-bold transition-all cursor-pointer border touch-manipulation ${
                    order.status === st.key
                      ? `${st.color} border-white/40 shadow-md ring-2 ring-blue-500/50 scale-[1.02]`
                      : 'bg-slate-800/90 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Sticky Action Footer (Mobile & Desktop) */}
        <div className="p-4 sm:p-5 border-t border-slate-800 bg-[#0F172A] space-y-2.5 shrink-0">
          
          {/* Primary Action Button: Accept Order / Start Cooking / Ready / Dispatch / Deliver */}
          {nextAction ? (
            <button
              onClick={() => {
                onUpdateStatus && onUpdateStatus(order.id, nextAction.nextStatus);
                onClose && onClose();
              }}
              className={`w-full py-3.5 sm:py-4 px-4 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center gap-2.5 transition-all cursor-pointer border-none touch-manipulation active:scale-[0.98] ${nextAction.btnStyle}`}
            >
              <nextAction.icon size={18} />
              <span>{nextAction.title}</span>
              <ArrowRight size={16} className="opacity-80" />
            </button>
          ) : order.status === 'DELIVERED' ? (
            <div className="w-full py-3 px-4 rounded-2xl bg-emerald-950/60 border border-emerald-700 text-emerald-300 font-black text-center text-xs flex items-center justify-center gap-2">
              <CheckCheck size={16} />
              <span>Order Delivered & Completed at Gate 3</span>
            </div>
          ) : null}

          {/* Secondary Actions: Cancel / Delete */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => {
                onCancelOrder(order);
                onClose();
              }}
              disabled={order.status === 'CANCELLED' || order.status === 'DELIVERED'}
              className="py-2.5 px-3 rounded-xl bg-rose-950/30 hover:bg-rose-900/50 text-rose-300 border border-rose-900/50 font-bold text-xs transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed touch-manipulation"
            >
              [ CANCEL ORDER ]
            </button>

            <button
              onClick={() => {
                onDeleteOrder(order);
                onClose();
              }}
              className="py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-rose-900/80 text-slate-300 hover:text-rose-200 border border-slate-700 hover:border-rose-700 font-bold text-xs transition-colors cursor-pointer touch-manipulation"
            >
              [ DELETE ORDER ]
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
