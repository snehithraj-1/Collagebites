import React from 'react';
import { ShoppingBag, Clock, User, LogOut, Sparkles, MapPin } from 'lucide-react';
import { useStudentAuth } from '../context/StudentAuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar({ currentView, onNavigate }) {
  const { profile, logout } = useStudentAuth();
  const { totalItemsCount, totalAmount, setIsCartOpen } = useCart();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#F1EAE4] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        
        {/* Brand & Campus Identity */}
        <div 
          onClick={() => onNavigate('restaurants')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-[#FF5722] to-[#FF8A65] flex items-center justify-center text-white text-xl shadow-md shadow-[#FF5722]/20 group-hover:scale-105 transition-transform">
            🍔
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg sm:text-xl font-black text-[#0F172A] tracking-tight font-['Outfit']">
                CampusBites
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#FFF0EB] text-[#FF5722] text-[10px] font-extrabold uppercase tracking-wider">
                Student
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-[#64748B]">
              <MapPin size={11} className="text-[#FF5722]" />
              <span>SRM-AP Campus Hostel Delivery</span>
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Order History Button */}
          <button
            onClick={() => onNavigate(currentView === 'history' ? 'restaurants' : 'history')}
            className={`px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
              currentView === 'history'
                ? 'bg-[#0F172A] text-white border-[#0F172A]'
                : 'bg-white text-[#475569] hover:text-[#0F172A] hover:bg-[#FAF8F5] border-[#E2D9D0]'
            }`}
          >
            <Clock size={16} className={currentView === 'history' ? 'text-amber-400' : 'text-[#64748B]'} />
            <span className="hidden sm:inline">My Orders</span>
          </button>

          {/* Cart Trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative px-3.5 py-2 sm:px-4 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-[#FF5722] to-[#FF7A50] hover:from-[#F4511E] hover:to-[#FF5722] text-white flex items-center gap-2 shadow-md shadow-[#FF5722]/25 transition-all cursor-pointer border-none"
          >
            <ShoppingBag size={16} />
            <span className="hidden sm:inline">Cart</span>
            {totalItemsCount > 0 && (
              <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-white text-[#FF5722] text-xs font-black">
                {totalItemsCount}
              </span>
            )}
            {totalAmount > 0 && (
              <span className="hidden md:inline pl-1 border-l border-white/30 font-mono font-bold text-xs">
                ₹{totalAmount}
              </span>
            )}
          </button>

          {/* Student Profile & Sign Out */}
          {profile && (
            <div className="flex items-center gap-2 pl-2 border-l border-[#F1EAE4]">
              <div className="hidden lg:block text-right">
                <div className="text-xs font-extrabold text-[#0F172A] leading-tight">
                  {profile.name}
                </div>
                <div className="text-[10px] text-[#64748B] font-mono">
                  {profile.student_id || profile.email}
                </div>
              </div>

              <button
                onClick={logout}
                title="Sign Out"
                className="w-9 h-9 rounded-xl bg-[#FAF8F5] hover:bg-rose-50 text-[#64748B] hover:text-rose-600 flex items-center justify-center transition-colors cursor-pointer border border-[#E2D9D0]"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}

        </div>
      </div>
    </header>
  );
}
