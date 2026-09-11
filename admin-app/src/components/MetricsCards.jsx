import React from 'react';
import { IndianRupee, ShoppingBag, Clock, ChefHat, CheckCircle2, TrendingUp } from 'lucide-react';

export default function MetricsCards({ orders = [] }) {
  // Compute analytics
  const nonCancelledOrders = orders.filter((o) => o.status !== 'cancelled');
  const totalRevenue = nonCancelledOrders.reduce((sum, o) => sum + (Number(o.total_amount || o.totalAmount) || 0), 0);
  const pendingCount = orders.filter((o) => o.status === 'pending').length;
  const inKitchenCount = orders.filter((o) => ['accepted', 'preparing', 'ready'].includes(o.status)).length;
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;
  const averageTicket = nonCancelledOrders.length > 0 ? totalRevenue / nonCancelledOrders.length : 0;

  const metrics = [
    {
      title: "Total Revenue",
      value: `₹${totalRevenue.toLocaleString('en-IN')}`,
      subtitle: `${nonCancelledOrders.length} successful orders`,
      icon: IndianRupee,
      color: "from-emerald-500/20 to-teal-500/20",
      border: "border-emerald-500/30",
      text: "text-emerald-400"
    },
    {
      title: "New Orders",
      value: pendingCount,
      subtitle: pendingCount > 0 ? "Action required immediately" : "All orders acknowledged",
      icon: Clock,
      color: pendingCount > 0 ? "from-orange-500/30 to-amber-500/30 animate-pulse" : "from-slate-800/40 to-slate-800/20",
      border: pendingCount > 0 ? "border-orange-500/50" : "border-slate-800",
      text: pendingCount > 0 ? "text-orange-400" : "text-slate-400"
    },
    {
      title: "In Kitchen",
      value: inKitchenCount,
      subtitle: "Preparing or ready for pickup",
      icon: ChefHat,
      color: "from-blue-500/20 to-indigo-500/20",
      border: "border-blue-500/30",
      text: "text-blue-400"
    },
    {
      title: "Delivered",
      value: deliveredCount,
      subtitle: "Completed successfully",
      icon: CheckCircle2,
      color: "from-purple-500/20 to-pink-500/20",
      border: "border-purple-500/30",
      text: "text-purple-400"
    },
    {
      title: "Avg. Ticket",
      value: `₹${Math.round(averageTicket)}`,
      subtitle: "Per order basket value",
      icon: TrendingUp,
      color: "from-amber-500/20 to-yellow-500/20",
      border: "border-amber-500/30",
      text: "text-amber-400"
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
      {metrics.map((m, idx) => {
        const Icon = m.icon;
        return (
          <div
            key={idx}
            className={`p-4 rounded-2xl bg-gradient-to-br ${m.color} border ${m.border} backdrop-blur-sm relative overflow-hidden transition-transform hover:-translate-y-0.5`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {m.title}
              </span>
              <Icon size={18} className={m.text} />
            </div>
            <div className="text-xl sm:text-2xl font-black font-['Outfit'] text-white">
              {m.value}
            </div>
            <p className="text-[11px] text-slate-400 mt-1 truncate">
              {m.subtitle}
            </p>
          </div>
        );
      })}
    </div>
  );
}
