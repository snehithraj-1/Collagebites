import React from 'react';
import { X, Clock, CheckCircle2, XCircle, ShoppingBag, MapPin } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function StudentOrdersModal({ isOpen, onClose }) {
  const { orders, studentProfile } = useApp();

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
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white border border-[#E2D9D0] flex items-center justify-center text-[#64748B] hover:text-[#0F172A] cursor-pointer"
          >
            <X size={18} />
          </button>
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
            studentOrders.map((order) => (
              <div 
                key={order.id || order.tempId} 
                className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#F1EAE4] space-y-2.5"
              >
                <div className="flex items-center justify-between pb-2 border-b border-[#F1EAE4]">
                  <div>
                    <span className="text-xs font-black text-[#FF5722] font-mono">#{order.id || order.tempId}</span>
                    <h4 className="text-sm font-black text-[#0F172A] font-['Outfit']">{order.restaurantName}</h4>
                  </div>
                  <div className="text-right">
                    {order.status === 'CONFIRMED' ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-black uppercase tracking-wider">
                        CONFIRMED
                      </span>
                    ) : order.status === 'CANCELLED' ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[11px] font-black uppercase tracking-wider">
                        CANCELLED
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[11px] font-black uppercase tracking-wider">
                        PENDING
                      </span>
                    )}
                    <div className="text-xs font-black text-[#0F172A] font-mono mt-1">₹{order.totalAmount}</div>
                  </div>
                </div>

                <div className="space-y-1 text-xs text-[#475569]">
                  <p><strong>Dishes:</strong> {order.items?.map((i) => `${i.name} (x${i.qty})`).join(', ')}</p>
                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                    <MapPin size={12} className="text-[#FF5722]" />
                    <span>{order.deliveryLocation}</span>
                  </div>
                  {order.cancelledReason && (
                    <p className="text-rose-600 text-[11px] font-semibold">Reason: {order.cancelledReason}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
