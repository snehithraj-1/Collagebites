import React, { useEffect, useState } from 'react';
import { X, Clock, CheckCircle2, XCircle, ShoppingBag, MapPin, RefreshCw, ChefHat, Package, Bike, Truck } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function StudentOrdersModal({ isOpen, onClose }) {
  const { orders, studentProfile, refreshCloudData } = useApp();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sync latest orders when modal opens
  useEffect(() => {
    if (isOpen) {
      refreshCloudData();
    }
  }, [isOpen, refreshCloudData]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshCloudData();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  if (!isOpen) return null;

  // Filter orders by student if profile exists, or show all student's orders
  const studentOrders = orders.filter((o) => 
    !studentProfile || 
    (o.studentId && o.studentId === studentProfile.studentId) ||
    (o.studentPhone && o.studentPhone === studentProfile.phone)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[85vh] border border-[#E2D9D0]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-[#FAF8F5] border-b border-[#F1EAE4] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FFF0EB] flex items-center justify-center text-[#FF5722]">
              <Clock size={18} />
            </div>
            <div>
              <h2 className="text-lg font-black text-[#0F172A] font-['Outfit']">My Campus Orders</h2>
              <p className="text-xs text-[#64748B]">Orders placed under {studentProfile?.name || 'your profile'}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={handleManualRefresh}
              title="Refresh Orders"
              className={`w-8 h-8 rounded-full bg-white border border-[#E2D9D0] flex items-center justify-center text-[#64748B] hover:text-[#FF5722] transition-colors cursor-pointer ${
                isRefreshing ? 'animate-spin text-[#FF5722]' : ''
              }`}
            >
              <RefreshCw size={14} />
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white border border-[#E2D9D0] flex items-center justify-center text-[#64748B] hover:text-[#0F172A] cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Orders list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {studentOrders.length === 0 ? (
            <div className="text-center py-12 text-[#64748B]">
              <ShoppingBag size={40} className="mx-auto mb-2 text-[#CBD5E1]" />
              <h3 className="font-bold text-sm text-[#0F172A]">No orders found</h3>
              <p className="text-xs mt-1">Place an order from Local Home Kitchen or Campus Delight!</p>
            </div>
          ) : (
            studentOrders.map((order) => {
              const formattedDishes = order.items
                ?.map((i) => `${i.name || i.item_name || 'Dish'} (x${i.qty || i.quantity || 1})`)
                .join(', ') || 'No items listed';

              return (
                <div 
                  key={order.id || order.tempId} 
                  className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#F1EAE4] space-y-2.5 transition-all hover:border-[#FF5722]/30"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-[#F1EAE4]">
                    <div>
                      <span className="text-xs font-black text-[#FF5722] font-mono">#{order.id || order.tempId}</span>
                      <h4 className="text-sm font-black text-[#0F172A] font-['Outfit']">{order.restaurantName}</h4>
                    </div>
                    
                    {/* Status Badge with all Phase 5 stages */}
                    <div className="text-right">
                      {order.status === 'DELIVERED' ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-black uppercase tracking-wider">
                          DELIVERED ✅
                        </span>
                      ) : order.status === 'OUT_FOR_DELIVERY' ? (
                        <span className="px-2.5 py-1 rounded-full bg-cyan-100 text-cyan-800 border border-cyan-300 text-[10px] font-black uppercase tracking-wider animate-pulse">
                          ON THE WAY 🚚
                        </span>
                      ) : order.status === 'PICKED_UP' ? (
                        <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 border border-purple-300 text-[10px] font-black uppercase tracking-wider">
                          PICKED UP 🛵
                        </span>
                      ) : order.status === 'READY' ? (
                        <span className="px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-300 text-[10px] font-black uppercase tracking-wider">
                          READY 📦
                        </span>
                      ) : order.status === 'PREPARING' ? (
                        <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-300 text-[10px] font-black uppercase tracking-wider">
                          COOKING 🍳
                        </span>
                      ) : order.status === 'CONFIRMED' ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-black uppercase tracking-wider">
                          CONFIRMED 👍
                        </span>
                      ) : order.status === 'PENDING_CONFIRMATION' ? (
                        <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-black uppercase tracking-wider">
                          PENDING ⏱️
                        </span>
                      ) : order.status === 'EXPIRED' ? (
                        <span className="px-2.5 py-1 rounded-full bg-slate-200 text-slate-700 border border-slate-300 text-[10px] font-black uppercase tracking-wider">
                          EXPIRED ⌛
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-300 text-[10px] font-black uppercase tracking-wider">
                          CANCELLED ❌
                        </span>
                      )}

                      <div className="text-xs font-black text-[#0F172A] font-mono mt-1">₹{order.totalAmount}</div>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-[#475569]">
                    <p><strong>Dishes:</strong> {formattedDishes}</p>
                    <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                      <MapPin size={12} className="text-[#FF5722]" />
                      <span>{order.deliveryLocation || 'Hostel Delivery'}</span>
                    </div>
                    {order.cancelledReason && (
                      <p className="text-rose-600 text-[11px] font-semibold">Reason: {order.cancelledReason}</p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

