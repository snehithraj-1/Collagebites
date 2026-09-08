import React, { useState, useEffect } from 'react';
import { Clock, RefreshCw, ShoppingBag, ArrowLeft, CheckCircle2, XCircle, AlertCircle, MapPin } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useStudentAuth } from '../context/StudentAuthContext';

export default function OrderHistoryPage({ onBackToRestaurants }) {
  const { profile } = useStudentAuth();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchOrders = async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);

    if (!isSupabaseConfigured() || !supabase) {
      // Fallback local persistence
      try {
        const stored = JSON.parse(localStorage.getItem('cb_shared_orders') || '[]');
        // Filter strictly to current student's orders
        const filtered = stored.filter(
          (o) => !o.user_id || o.user_id === profile?.id || o.student_email === profile?.email
        );
        setOrders(filtered);
      } catch {
        setOrders([]);
      }
      setIsLoading(false);
      setIsRefreshing(false);
      return;
    }

    try {
      // Query Supabase: RLS also strictly guarantees only own orders are returned
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('user_id', profile?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.warn('[Supabase Orders History]:', err.message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (profile?.id) {
      fetchOrders();

      // Realtime updates for live status changes on student's orders
      if (isSupabaseConfigured() && supabase) {
        const channel = supabase
          .channel(`student-orders-${profile.id}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'orders',
              filter: `user_id=eq.${profile.id}`
            },
            () => {
              fetchOrders(true);
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      }
    }
  }, [profile?.id]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return { label: 'Confirmed', bg: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'PREPARING':
        return { label: 'Cooking 🍳', bg: 'bg-amber-100 text-amber-800 border-amber-200 animate-pulse' };
      case 'READY':
        return { label: 'Ready for Pickup', bg: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'OUT_FOR_DELIVERY':
        return { label: 'Out for Delivery 🚀', bg: 'bg-cyan-100 text-cyan-800 border-cyan-200 animate-pulse' };
      case 'DELIVERED':
        return { label: 'Delivered ✅', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'CANCELLED':
        return { label: 'Cancelled ❌', bg: 'bg-rose-100 text-rose-800 border-rose-200' };
      case 'EXPIRED':
        return { label: 'Expired ⏱️', bg: 'bg-slate-100 text-slate-700 border-slate-200' };
      default:
        return { label: status, bg: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#F1EAE4] pb-4">
        <div>
          <button
            onClick={onBackToRestaurants}
            className="flex items-center gap-1.5 text-xs font-bold text-[#64748B] hover:text-[#0F172A] transition-colors cursor-pointer border-none bg-transparent p-0 mb-2"
          >
            <ArrowLeft size={16} />
            <span>Back to Restaurants</span>
          </button>
          <h2 className="text-2xl font-black text-[#0F172A] font-['Outfit']">
            My Order History
          </h2>
          <p className="text-xs text-[#64748B]">
            Only showing orders placed by your student account ({profile?.email})
          </p>
        </div>

        <button
          onClick={() => fetchOrders(true)}
          disabled={isRefreshing}
          className="p-2.5 rounded-xl bg-white border border-[#E2D9D0] text-[#64748B] hover:text-[#0F172A] transition-colors cursor-pointer"
          title="Refresh Orders"
        >
          <RefreshCw size={15} className={isRefreshing ? 'animate-spin text-[#FF5722]' : ''} />
        </button>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 rounded-full border-3 border-[#FF5722] border-t-transparent animate-spin mx-auto" />
          <p className="text-xs text-[#64748B] font-bold">Loading your orders from Supabase...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="card-elevated p-12 text-center space-y-3">
          <div className="text-5xl">📦</div>
          <h3 className="text-lg font-bold text-[#0F172A] font-['Outfit']">No past orders yet</h3>
          <p className="text-xs text-[#64748B] max-w-sm mx-auto">
            You haven't placed any food orders yet. Pick dishes from our campus kitchens and enjoy doorstep delivery!
          </p>
          <button
            onClick={onBackToRestaurants}
            className="btn-primary py-2.5 px-6 rounded-xl text-xs font-bold mt-2 cursor-pointer border-none"
          >
            Browse Food Menu
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const badge = getStatusBadge(order.status);
            const dateFormatted = new Date(order.created_at).toLocaleDateString('en-IN', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });
            const orderItems = order.order_items || order.items || [];

            return (
              <div key={order.id} className="card-elevated p-5 sm:p-6 space-y-3">
                {/* Order Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F1EAE4] pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm text-[#0F172A]">
                        #{order.id}
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="font-extrabold text-xs text-[#0F172A]">
                        {order.restaurant_name || 'Campus Kitchen'}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#64748B] mt-0.5">
                      Placed on {dateFormatted}
                    </div>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${badge.bg}`}>
                    {badge.label}
                  </span>
                </div>

                {/* Items and Location */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="sm:col-span-2 space-y-1">
                    <div className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">
                      Ordered Items:
                    </div>
                    <div className="text-[#0F172A] font-medium leading-relaxed">
                      {orderItems.length > 0
                        ? orderItems.map((item, idx) => (
                            <span key={idx}>
                              {item.name} <strong className="font-mono text-[#FF5722]">x{item.quantity}</strong>
                              {idx < orderItems.length - 1 ? ', ' : ''}
                            </span>
                          ))
                        : 'Food order'}
                    </div>
                  </div>

                  <div className="sm:text-right space-y-1">
                    <div className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">
                      Total Bill:
                    </div>
                    <div className="text-base font-black font-mono text-[#FF5722]">
                      ₹{order.total_amount}
                    </div>
                  </div>
                </div>

                {/* Drop Destination */}
                <div className="pt-2 border-t border-[#F1EAE4] flex items-center justify-between text-[11px] text-[#64748B]">
                  <div className="flex items-center gap-1.5">
                    <MapPin size={12} className="text-[#FF5722]" />
                    <span>Drop: {order.delivery_location}</span>
                  </div>
                  <span className="text-emerald-600 font-bold">Free Hostel Delivery</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
