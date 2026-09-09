import React, { useState, useEffect, useRef } from 'react';
import { ChefHat, PackageCheck, Bike, CheckCheck, X, ArrowRight, Bell, Sparkles, CheckCircle2, Phone } from 'lucide-react';
import { playStudentChime, sendStudentNotification, requestStudentNotificationPermission } from '../lib/notificationSound';
import { useStudentAuth } from '../context/StudentAuthContext';

const STATUS_DETAILS = {
  CONFIRMED: {
    title: 'Order Confirmed!',
    desc: 'Your food order has been confirmed and received by the kitchen.',
    icon: CheckCircle2,
    bg: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    badge: 'bg-emerald-100 text-emerald-800'
  },
  CANCELLED: {
    title: 'Order Cancelled',
    desc: 'Your order has been cancelled.',
    icon: X,
    bg: 'bg-rose-50 border-rose-200 text-rose-900',
    badge: 'bg-rose-100 text-rose-800'
  }
};

export default function StudentNotificationToast({ onTrackOrder }) {
  const { profile } = useStudentAuth();
  const [activeToast, setActiveToast] = useState(null);
  
  // Track previous statuses: map of orderId -> status
  const orderStatusesRef = useRef(new Map());
  const orderPartnersRef = useRef(new Map());
  const isFirstCheckRef = useRef(true);

  // Request browser notification permission on first user interaction
  useEffect(() => {
    const handleFirstClick = () => {
      requestStudentNotificationPermission();
      window.removeEventListener('click', handleFirstClick);
    };
    window.addEventListener('click', handleFirstClick);
    return () => window.removeEventListener('click', handleFirstClick);
  }, []);

  // Poll orders every 2.5s for status changes
  useEffect(() => {
    let isMounted = true;

    async function checkOrderStatusChanges() {
      try {
        const localOrders = JSON.parse(localStorage.getItem('cb_shared_orders') || '[]');
        const localIds = new Set(localOrders.map((o) => o.id));
        const identifier = profile?.email || profile?.id || '';

        let orders = [];
        if (identifier) {
          const res = await fetch(`/api/orders/student/${encodeURIComponent(identifier)}`);
          if (res.ok) {
            const data = await res.json();
            orders = data.orders || [];
          }
        }

        // Merge with any matching local orders from global orders feed
        if (localIds.size > 0) {
          try {
            const allRes = await fetch('/api/orders');
            if (allRes.ok) {
              const allData = await allRes.json();
              const relevant = (allData.orders || []).filter((o) => localIds.has(o.id));
              const map = new Map();
              orders.forEach((o) => map.set(o.id, o));
              relevant.forEach((o) => map.set(o.id, o));
              orders = Array.from(map.values());
            }
          } catch {}
        }

        if (isFirstCheckRef.current) {
          // Initialize map without firing alerts on initial page load
          orders.forEach((o) => {
            orderStatusesRef.current.set(o.id, o.status);
            orderPartnersRef.current.set(o.id, o.delivery_partner_name || '');
          });
          isFirstCheckRef.current = false;
          return;
        }

        // Check for changes
        for (const order of orders) {
          const prevStatus = orderStatusesRef.current.get(order.id);
          const newStatus = order.status;
          const prevPartner = orderPartnersRef.current.get(order.id);
          const currentPartner = order.delivery_partner_name || '';

          // Check if partner was just assigned
          if (!prevPartner && currentPartner) {
            orderPartnersRef.current.set(order.id, currentPartner);
            if (isMounted) {
              setActiveToast({
                order,
                status: 'PARTNER_ASSIGNED',
                title: '🛵 Delivery Partner Assigned!',
                desc: `${currentPartner} (${order.delivery_partner_phone || 'Courier'}) will deliver your food to SRM University Gate 3!`,
                icon: Bike,
                bg: 'from-cyan-500/10 to-emerald-500/10 border-cyan-500/30 text-cyan-900',
                badge: 'bg-cyan-100 text-cyan-800'
              });
              playStudentChime('OUT_FOR_DELIVERY');
              sendStudentNotification(
                '🛵 Delivery Partner Assigned!',
                `${currentPartner} is assigned to deliver #${order.id} to SRM Gate 3`
              );
            }
            break;
          } else {
            orderPartnersRef.current.set(order.id, currentPartner);
          }

          // If status changed to a new pipeline stage
          if (prevStatus && prevStatus !== newStatus && STATUS_DETAILS[newStatus]) {
            orderStatusesRef.current.set(order.id, newStatus);

            // Sync updated status to localStorage
            try {
              const stored = JSON.parse(localStorage.getItem('cb_shared_orders') || '[]');
              const updated = stored.map((o) =>
                o.id === order.id ? { ...o, status: newStatus } : o
              );
              localStorage.setItem('cb_shared_orders', JSON.stringify(updated));
            } catch {}

            const details = STATUS_DETAILS[newStatus];
            if (isMounted) {
              setActiveToast({
                order,
                status: newStatus,
                ...details
              });

              // Play audio chime
              playStudentChime(newStatus);

              // Send system browser notification
              sendStudentNotification(
                details.title,
                `Order #${order.id}: ${details.desc}`
              );
            }
            break;
          } else {
            orderStatusesRef.current.set(order.id, newStatus);
          }
        }
      } catch (err) {
        // Silent catch for network hiccups
      }
    }

    checkOrderStatusChanges();
    const interval = setInterval(checkOrderStatusChanges, 2500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [profile?.email, profile?.id]);

  // Auto-dismiss toast after 7 seconds
  useEffect(() => {
    if (!activeToast) return;
    const timer = setTimeout(() => {
      setActiveToast(null);
    }, 7000);
    return () => clearTimeout(timer);
  }, [activeToast]);

  if (!activeToast) return null;

  const Icon = activeToast.icon;

  return (
    <div className="fixed top-20 right-4 sm:right-6 z-50 max-w-sm w-full animate-slide-down">
      <div className={`p-4 rounded-2xl bg-white border shadow-2xl shadow-slate-900/10 flex flex-col gap-3 relative overflow-hidden ${activeToast.bg}`}>
        
        {/* Animated Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#FF5722] to-emerald-500 animate-pulse" />

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-[#E2D9D0] flex items-center justify-center shrink-0 text-xl">
              <Icon size={20} className="text-[#FF5722]" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${activeToast.badge}`}>
                  {activeToast.status}
                </span>
                <span className="font-mono text-xs font-bold text-slate-400">
                  #{activeToast.order.id}
                </span>
              </div>
              <h4 className="font-black text-sm text-[#0F172A] font-['Outfit'] mt-0.5">
                {activeToast.title}
              </h4>
              <p className="text-xs text-[#64748B] mt-1 leading-snug">
                {activeToast.desc}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveToast(null)}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-black/5 transition-colors cursor-pointer border-none bg-transparent"
          >
            <X size={16} />
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 gap-2">
          {activeToast.order?.delivery_partner_phone ? (
            <a
              href={`tel:${activeToast.order.delivery_partner_phone}`}
              className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Phone size={12} />
              <span>Call Partner</span>
            </a>
          ) : (
            <span className="text-[10px] font-bold text-slate-400">
              Destination: SRM Gate 3
            </span>
          )}

          <button
            onClick={() => {
              if (onTrackOrder) onTrackOrder(activeToast.order);
              setActiveToast(null);
            }}
            className="px-3 py-1.5 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-all shadow-sm"
          >
            <span>Track Order</span>
            <ArrowRight size={13} />
          </button>
        </div>

      </div>
    </div>
  );
}
