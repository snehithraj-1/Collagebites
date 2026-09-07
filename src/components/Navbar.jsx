import React from 'react';
import { 
  ShoppingBag, 
  MapPin, 
  Search, 
  User, 
  ShieldCheck, 
  LogOut, 
  AlertTriangle, 
  Sparkles,
  ArrowRight,
  Store,
  Clock,
  Bike
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Navbar({ onNavigate, onOpenSearch }) {
  const { 
    userRole, 
    studentProfile, 
    isAdminAuthenticated, 
    cartCount, 
    cartSubtotal, 
    setIsCartOpen, 
    overallOrderingEnabled,
    switchRole,
    logout
  } = useApp();

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#F1EAE4] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => onNavigate('restaurants')}
              className="flex items-center gap-2.5 group text-left border-none bg-transparent cursor-pointer"
            >
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#FF5722] to-[#FF8A65] flex items-center justify-center shadow-lg shadow-[#FF5722]/30 group-hover:scale-105 transition-transform">
                <span className="text-2xl">🍔</span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-2xl tracking-tight text-[#0F172A] font-['Outfit']">
                    Campus<span className="text-[#FF5722]">Bites</span>
                  </span>
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-[#FFF0EB] text-[#FF5722] uppercase tracking-wider">
                    SRM-AP
                  </span>
                </div>
                <p className="text-[11px] text-[#64748B] font-semibold hidden sm:block">
                  Campus Food Ordering Platform
                </p>
              </div>
            </button>

            {/* Ordering System Status Badge */}
            <div className="hidden md:flex items-center">
              {overallOrderingEnabled ? (
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-extrabold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Ordering Active</span>
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-extrabold flex items-center gap-1.5">
                  <AlertTriangle size={12} className="text-amber-500" />
                  <span>Ordering Paused</span>
                </span>
              )}
            </div>
          </div>

          {/* Right Navigation & Actions */}
          <div className="flex items-center gap-3">
            
            {/* Student Role Actions */}
            {userRole === 'student' && (
              <>
                {/* Student Identity Chip */}
                <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-[#FAF8F5] border border-[#E2D9D0]">
                  <div className="w-7 h-7 rounded-xl bg-[#FFF0EB] flex items-center justify-center text-[#FF5722] font-bold text-xs">
                    {studentProfile?.name?.charAt(0) || 'S'}
                  </div>
                  <div className="text-left leading-tight">
                    <div className="text-xs font-black text-[#0F172A] truncate max-w-[120px]">
                      {studentProfile?.name || 'Student'}
                    </div>
                    <div className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                      <span>✓</span>
                      <span>+91 {studentProfile?.phone || 'Verified'}</span>
                    </div>
                  </div>
                </div>

                {/* Orders History Quick Link */}
                <button
                  onClick={() => onNavigate('orders')}
                  className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-[#475569] hover:text-[#0F172A] hover:bg-[#F4EFEA] transition-colors cursor-pointer border-none bg-transparent"
                >
                  <Clock size={14} />
                  <span>My Orders</span>
                </button>

                {/* Cart Drawer Trigger */}
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="relative flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#FF5722] to-[#FF7A50] text-white font-black text-xs sm:text-sm shadow-lg shadow-[#FF5722]/25 hover:shadow-xl hover:shadow-[#FF5722]/35 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer border-none"
                >
                  <ShoppingBag size={17} />
                  <span className="hidden sm:inline">Cart</span>
                  {cartCount > 0 && (
                    <span className="flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full bg-white text-[#FF5722] text-xs font-black shadow-xs">
                      {cartCount}
                    </span>
                  )}
                  {cartSubtotal > 0 && (
                    <span className="hidden md:inline border-l border-white/30 pl-2 text-xs font-extrabold font-mono">
                      ₹{cartSubtotal}
                    </span>
                  )}
                </button>

                {/* Delivery Partner Portal Link */}
                <button
                  onClick={() => switchRole('delivery')}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 flex items-center gap-1.5 transition-colors cursor-pointer border border-amber-200"
                  title="Switch to Delivery Partner Portal"
                >
                  <Bike size={14} className="text-amber-600" />
                  <span className="hidden sm:inline">Delivery Partner</span>
                </button>

                {/* Admin Switch Portal Link */}
                <button
                  onClick={() => switchRole('admin')}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-[#64748B] hover:text-[#0F172A] hover:bg-[#F4EFEA] flex items-center gap-1.5 transition-colors cursor-pointer border border-[#E2D9D0] bg-white"
                  title="Switch to Admin Portal"
                >
                  <ShieldCheck size={14} className="text-blue-500" />
                  <span className="hidden lg:inline">Admin Portal</span>
                </button>

                {/* Sign Out */}
                <button
                  onClick={logout}
                  className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-[#64748B] flex items-center justify-center transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut size={16} />
                </button>
              </>
            )}

            {/* Admin Role Header */}
            {userRole === 'admin' && (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-black">
                  <ShieldCheck size={14} className="text-blue-600" />
                  <span>Admin Mode</span>
                </div>

                <button
                  onClick={() => switchRole('student')}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Store size={14} className="text-[#FF5722]" />
                  <span>Student View</span>
                </button>

                <button
                  onClick={logout}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <LogOut size={14} />
                  <span>Exit Admin</span>
                </button>
              </>
            )}

            {/* Fallback if not logged in */}
            {!userRole && (
              <button
                onClick={() => switchRole('admin')}
                className="px-3 py-2 rounded-xl text-xs font-bold text-[#64748B] hover:text-[#0F172A] flex items-center gap-1.5 border border-[#E2D9D0]"
              >
                <ShieldCheck size={14} className="text-blue-500" />
                <span>Admin Login</span>
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
}
