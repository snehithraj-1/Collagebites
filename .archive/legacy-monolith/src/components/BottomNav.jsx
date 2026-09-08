import React from 'react';
import { Home, Store, Search, ShoppingBag, Clock, User } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function BottomNav({ currentPage, activeTab, onNavigate, onOpenSearch }) {
  const current = currentPage || activeTab || 'home';
  const { totalCartCount, setIsCartOpen } = useCart();

  return (
    <nav className="bottom-nav md:hidden">
      {/* Home Tab */}
      <button
        onClick={() => onNavigate('home')}
        className={`flex flex-col items-center justify-center flex-1 py-1 border-none bg-transparent cursor-pointer transition-colors ${
          current === 'home' ? 'text-[#FF5722]' : 'text-[#64748B]'
        }`}
      >
        <Home size={20} className={current === 'home' ? 'stroke-[2.5]' : 'stroke-2'} />
        <span className="text-[10px] font-semibold mt-1">Home</span>
      </button>

      {/* Search */}
      <button
        onClick={onOpenSearch}
        className="flex flex-col items-center justify-center flex-1 py-1 border-none bg-transparent cursor-pointer text-[#64748B] hover:text-[#FF5722] transition-colors"
      >
        <Search size={20} className="stroke-2" />
        <span className="text-[10px] font-semibold mt-1">Search</span>
      </button>

      {/* Cart (Opens Drawer) */}
      <button
        onClick={() => setIsCartOpen(true)}
        className="relative flex flex-col items-center justify-center flex-1 py-1 border-none bg-transparent cursor-pointer text-[#64748B]"
      >
        <div className="relative">
          <ShoppingBag size={20} className="stroke-2 text-[#FF5722]" />
          {totalCartCount > 0 && (
            <span className="absolute -top-1.5 -right-2.5 flex items-center justify-center min-w-[17px] h-[17px] px-1 rounded-full bg-[#FF5722] text-white text-[9px] font-black shadow-sm">
              {totalCartCount}
            </span>
          )}
        </div>
        <span className="text-[10px] font-semibold mt-1 text-[#FF5722]">Cart</span>
      </button>

      {/* Track Orders */}
      <button
        onClick={() => onNavigate('tracking')}
        className={`flex flex-col items-center justify-center flex-1 py-1 border-none bg-transparent cursor-pointer transition-colors ${
          current === 'tracking' ? 'text-[#FF5722]' : 'text-[#64748B]'
        }`}
      >
        <Clock size={20} className={current === 'tracking' ? 'stroke-[2.5]' : 'stroke-2'} />
        <span className="text-[10px] font-semibold mt-1">Orders</span>
      </button>

      {/* Profile */}
      <button
        onClick={() => onNavigate('profile')}
        className={`flex flex-col items-center justify-center flex-1 py-1 border-none bg-transparent cursor-pointer transition-colors ${
          current === 'profile' ? 'text-[#FF5722]' : 'text-[#64748B]'
        }`}
      >
        <User size={20} className={current === 'profile' ? 'stroke-[2.5]' : 'stroke-2'} />
        <span className="text-[10px] font-semibold mt-1">Profile</span>
      </button>
    </nav>
  );
}
