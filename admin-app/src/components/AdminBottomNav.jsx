import React from 'react';
import { LayoutDashboard, Power, ClipboardList, UtensilsCrossed, Menu } from 'lucide-react';

export default function AdminBottomNav({
  activeTab = 'overview',
  onSelectTab,
  onOpenMenuModal,
  onOpenSideMenu
}) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0F172A]/95 backdrop-blur-md border-t border-slate-800/90 shadow-2xl transition-all pb-safe">
      <div className="max-w-md mx-auto px-2 h-14 flex items-center justify-around relative">
        
        {/* 1. Overview */}
        <button
          onClick={() => {
            onSelectTab && onSelectTab('overview');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all cursor-pointer border-none bg-transparent group relative active:scale-95 ${
            activeTab === 'overview' ? 'text-[#FF5722]' : 'text-slate-400 hover:text-white'
          }`}
          title="Dashboard Overview"
        >
          {activeTab === 'overview' && (
            <span className="absolute top-0 w-8 h-0.5 rounded-full bg-[#FF5722]" />
          )}
          <LayoutDashboard
            size={18}
            className={`transition-transform duration-200 ${
              activeTab === 'overview' ? 'stroke-[2.5]' : ''
            }`}
          />
          <span className={`text-[10px] mt-0.5 font-['Outfit'] font-bold ${activeTab === 'overview' ? 'font-extrabold text-orange-400' : ''}`}>
            Stats
          </span>
        </button>

        {/* 2. Controls / Toggles */}
        <button
          onClick={() => {
            onSelectTab && onSelectTab('controls');
            const el = document.getElementById('admin-system-controls');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all cursor-pointer border-none bg-transparent group relative active:scale-95 ${
            activeTab === 'controls' ? 'text-[#FF5722]' : 'text-slate-400 hover:text-white'
          }`}
          title="Kitchen & System Toggles"
        >
          {activeTab === 'controls' && (
            <span className="absolute top-0 w-8 h-0.5 rounded-full bg-[#FF5722]" />
          )}
          <Power
            size={18}
            className={`transition-transform duration-200 ${
              activeTab === 'controls' ? 'stroke-[2.5]' : ''
            }`}
          />
          <span className={`text-[10px] mt-0.5 font-['Outfit'] font-bold ${activeTab === 'controls' ? 'font-extrabold text-orange-400' : ''}`}>
            Toggles
          </span>
        </button>

        {/* 3. Orders */}
        <button
          onClick={() => {
            onSelectTab && onSelectTab('orders');
            const el = document.getElementById('admin-orders-section');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-all cursor-pointer border-none bg-transparent group relative active:scale-95 ${
            activeTab === 'orders' ? 'text-[#FF5722]' : 'text-slate-400 hover:text-white'
          }`}
          title="Live Orders"
        >
          {activeTab === 'orders' && (
            <span className="absolute top-0 w-8 h-0.5 rounded-full bg-[#FF5722]" />
          )}
          <ClipboardList
            size={18}
            className={`transition-transform duration-200 ${
              activeTab === 'orders' ? 'stroke-[2.5]' : ''
            }`}
          />
          <span className={`text-[10px] mt-0.5 font-['Outfit'] font-bold ${activeTab === 'orders' ? 'font-extrabold text-orange-400' : ''}`}>
            Orders
          </span>
        </button>

        {/* 4. Menu / Dishes Manager */}
        <button
          onClick={() => onOpenMenuModal && onOpenMenuModal()}
          className="flex-1 flex flex-col items-center justify-center py-1 transition-all cursor-pointer border-none bg-transparent group relative active:scale-95 text-slate-400 hover:text-white"
          title="Dish Availability & Menu Manager"
        >
          <UtensilsCrossed size={18} />
          <span className="text-[10px] mt-0.5 font-['Outfit'] font-bold">
            Dishes
          </span>
        </button>

        {/* 5. More / Side Menu */}
        <button
          onClick={() => onOpenSideMenu && onOpenSideMenu()}
          className="flex-1 flex flex-col items-center justify-center py-1 transition-all cursor-pointer border-none bg-transparent group relative active:scale-95 text-slate-400 hover:text-white"
          title="Operations Menu"
        >
          <Menu size={18} />
          <span className="text-[10px] mt-0.5 font-['Outfit'] font-bold">
            Menu
          </span>
        </button>

      </div>
    </nav>
  );
}
