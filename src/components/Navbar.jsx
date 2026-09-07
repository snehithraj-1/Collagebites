import React, { useState } from 'react';
import { ShoppingBag, MapPin, Search, User, ChevronDown, Clock, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { CAMPUS_LOCATIONS } from '../data/campusFoodData';

export default function Navbar({ currentPage, activeTab, onNavigate, onOpenSearch }) {
  const current = currentPage || activeTab || 'home';
  const { totalCartCount, cartSubtotal, setIsCartOpen, selectedLocation, setSelectedLocation } = useCart();
  const [isLocDropdownOpen, setIsLocDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 glass-nav">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Left: Brand Logo & Campus Selector */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2.5 group text-left border-none bg-transparent cursor-pointer"
            >
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#FF5722] to-[#FF8A65] flex items-center justify-center shadow-lg shadow-[#FF5722]/30 group-hover:scale-105 transition-transform">
                <span className="text-2xl">🍔</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-2xl tracking-tight text-[#0F172A] font-['Outfit']">
                    Campus<span className="text-[#FF5722]">Bites</span>
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FFF0EB] text-[#FF5722] uppercase tracking-wider">
                    SRM-AP
                  </span>
                </div>
                <p className="text-xs text-[#64748B] font-medium hidden sm:block">Campus Food & Hostel Delivery</p>
              </div>
            </button>

            {/* Location Switcher Pill */}
            <div className="relative">
              <button
                onClick={() => setIsLocDropdownOpen(!isLocDropdownOpen)}
                className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-full bg-[#F4EFEA] hover:bg-[#EAE4DC] border border-[#E2D9D0] text-xs font-semibold text-[#334155] transition-colors cursor-pointer"
              >
                <MapPin size={14} className="text-[#FF5722]" />
                <span className="max-w-[140px] truncate">{selectedLocation.name}</span>
                <ChevronDown size={14} className="text-[#94A3B8]" />
              </button>

              {/* Location Dropdown Menu */}
              {isLocDropdownOpen && (
                <div
                  className="absolute left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-[#F1EAE4] py-2 z-50 animate-slide-up"
                  onClick={() => setIsLocDropdownOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-[#F1EAE4]">
                    <p className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">Select Campus Drop-Off</p>
                  </div>
                  {CAMPUS_LOCATIONS.map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => setSelectedLocation(loc)}
                      className={`w-full text-left px-4 py-2.5 flex items-center justify-between text-xs hover:bg-[#FFF0EB] transition-colors ${
                        selectedLocation.id === loc.id ? 'bg-[#FFF0EB] font-bold text-[#FF5722]' : 'text-[#334155]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <MapPin size={13} className={selectedLocation.id === loc.id ? 'text-[#FF5722]' : 'text-[#94A3B8]'} />
                        <span>{loc.name}</span>
                      </div>
                      <span className="text-[10px] text-[#64748B] font-medium">{loc.time}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Center: Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              onClick={() => onNavigate('home')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer border-none bg-transparent ${
                current === 'home'
                  ? 'text-[#FF5722] bg-[#FFF0EB]'
                  : 'text-[#475569] hover:text-[#0F172A] hover:bg-black/5'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => onNavigate('home')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer border-none bg-transparent ${
                current === 'vendor'
                  ? 'text-[#FF5722] bg-[#FFF0EB]'
                  : 'text-[#475569] hover:text-[#0F172A] hover:bg-black/5'
              }`}
            >
              Food Corners
            </button>
            <button
              onClick={() => onNavigate('tracking')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer border-none bg-transparent ${
                current === 'tracking'
                  ? 'text-[#FF5722] bg-[#FFF0EB]'
                  : 'text-[#475569] hover:text-[#0F172A] hover:bg-black/5'
              }`}
            >
              Track Orders
            </button>
            <button
              onClick={() => onNavigate('profile')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer border-none bg-transparent ${
                current === 'profile'
                  ? 'text-[#FF5722] bg-[#FFF0EB]'
                  : 'text-[#475569] hover:text-[#0F172A] hover:bg-black/5'
              }`}
            >
              Student Profile
            </button>
          </nav>

          {/* Right: Search, Cart Drawer Trigger & User Profile */}
          <div className="flex items-center gap-3">
            {/* Search Trigger */}
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-full bg-[#F4EFEA] hover:bg-[#EAE4DC] border border-[#E2D9D0] text-xs font-semibold text-[#475569] transition-all cursor-pointer"
            >
              <Search size={16} className="text-[#FF5722]" />
              <span className="hidden sm:inline">Search food, biryani, rolls...</span>
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#FF5722] to-[#FF6F00] text-white font-bold text-sm shadow-lg shadow-[#FF5722]/25 hover:shadow-xl hover:shadow-[#FF5722]/35 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer border-none"
            >
              <ShoppingBag size={18} />
              <span className="hidden sm:inline">Cart</span>
              {totalCartCount > 0 && (
                <span className="flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full bg-white text-[#FF5722] text-xs font-extrabold shadow-sm">
                  {totalCartCount}
                </span>
              )}
              {cartSubtotal > 0 && (
                <span className="hidden md:inline border-l border-white/30 pl-2 text-xs font-semibold">
                  ₹{cartSubtotal}
                </span>
              )}
            </button>

            {/* Profile Avatar Button (Desktop) */}
            <button
              onClick={() => onNavigate('profile')}
              className="hidden sm:flex items-center justify-center w-10 h-10 rounded-2xl bg-[#FFF0EB] border border-[#FFD3C4] text-[#FF5722] font-bold hover:bg-[#FFE6DC] transition-colors cursor-pointer"
              title="Student Profile"
            >
              <User size={18} />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
