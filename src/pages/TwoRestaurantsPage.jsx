import React from 'react';
import { MapPin, Phone, Clock, Star, ArrowRight, AlertTriangle, ShieldCheck, Store, Utensils } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { RESTAURANTS } from '../data/campusData';

export default function TwoRestaurantsPage({ onSelectRestaurant }) {
  const { 
    studentProfile, 
    overallOrderingEnabled, 
    restaurantStatuses 
  } = useApp();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* Overall Ordering Warning Banner if Disabled by Admin */}
      {!overallOrderingEnabled && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 flex items-center gap-3 text-amber-900 shadow-sm animate-fade-in">
          <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-md">
            <AlertTriangle size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-extrabold text-sm sm:text-base text-[#0F172A] font-['Outfit']">
              Ordering is currently unavailable.
            </h3>
            <p className="text-xs text-amber-800">
              Campus dining master ordering is currently paused. You can still browse restaurant menus and prices!
            </p>
          </div>
        </div>
      )}

      {/* Greeting & Student Context Card */}
      <div className="relative rounded-3xl p-6 sm:p-8 overflow-hidden bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0A0F1D] text-white shadow-xl">
        <div className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-[#FF5722]/20 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-bold text-[#FF8A65] mb-2 border border-white/10">
              <ShieldCheck size={13} />
              <span>SRM-AP Campus Dining</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black font-['Outfit'] tracking-tight">
              Hello, {studentProfile?.name || 'Student'} 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-medium mt-1 flex items-center gap-2 flex-wrap">
              <span>📱 <strong className="text-white">+91 {studentProfile?.phone || 'Campus Student'}</strong></span>
              <span>•</span>
              <span className="text-emerald-400 font-semibold">Free Hostel Doorstep Drop</span>
            </p>
          </div>

          <div className="text-left sm:text-right">
            <div className="text-xs text-slate-400">Available Campus Vendors</div>
            <div className="text-2xl font-black text-[#FF5722] font-['Outfit']">
              2 Active Kitchens
            </div>
          </div>
        </div>
      </div>

      {/* Available Restaurants Section */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#FFF0EB] flex items-center justify-center text-[#FF5722]">
              <Store size={18} />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-[#0F172A] font-['Outfit']">
                Campus Restaurants
              </h2>
              <p className="text-xs text-[#64748B]">Select a restaurant to browse full menu and place orders</p>
            </div>
          </div>
        </div>

        {/* Exactly Two Restaurants Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {RESTAURANTS.map((restaurant) => {
            const status = restaurantStatuses[restaurant.id] || 'OPEN';
            const isOpen = status === 'OPEN' && overallOrderingEnabled;

            return (
              <div
                key={restaurant.id}
                className="card-base flex flex-col bg-white border border-[#E2D9D0] rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all group"
              >
                {/* Image Container */}
                <div className="relative w-full h-52 overflow-hidden bg-[#F1EAE4]">
                  <img
                    src={restaurant.image}
                    alt={restaurant.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                  {/* Status Badge (OPEN / CLOSED) */}
                  <div className="absolute top-3 left-3">
                    {status === 'OPEN' ? (
                      <span className="px-3 py-1 rounded-full bg-emerald-500/95 backdrop-blur-md text-white text-xs font-black tracking-wider uppercase flex items-center gap-1.5 shadow-md">
                        <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        <span>OPEN</span>
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-rose-600/95 backdrop-blur-md text-white text-xs font-black tracking-wider uppercase shadow-md">
                        CLOSED
                      </span>
                    )}
                  </div>

                  {/* Badge */}
                  {restaurant.badge && (
                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-[#FF5722] text-xs font-black shadow-md">
                      {restaurant.badge}
                    </div>
                  )}

                  {/* Prep Time pill */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-xs font-medium">
                    <Clock size={13} className="text-[#F59E0B]" />
                    <span>{restaurant.prepTime}</span>
                  </div>

                  {/* Rating pill */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/95 backdrop-blur-md text-[#0F172A] text-xs font-black shadow-md">
                    <Star size={13} className="fill-[#F59E0B] text-[#F59E0B]" />
                    <span>{restaurant.rating}</span>
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-6 flex flex-col flex-1">
                  
                  {/* Name & Cuisine */}
                  <h3 className="text-2xl font-black text-[#0F172A] font-['Outfit'] mb-1 group-hover:text-[#FF5722] transition-colors">
                    {restaurant.name}
                  </h3>
                  <p className="text-xs font-bold text-[#FF5722] uppercase tracking-wider mb-3">
                    {restaurant.cuisine}
                  </p>

                  {/* Location, Landmark & Phone */}
                  <div className="space-y-1.5 text-xs text-[#475569] mb-6 p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#F1EAE4]">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-[#FF5722] flex-shrink-0" />
                      <span><strong>Location:</strong> {restaurant.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Store size={14} className="text-[#94A3B8] flex-shrink-0" />
                      <span><strong>Landmark:</strong> {restaurant.landmark}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-[#10B981] flex-shrink-0" />
                      <span><strong>Phone:</strong> {restaurant.phone}</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="mt-auto pt-3 border-t border-[#F1EAE4] flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-[#94A3B8] font-bold uppercase tracking-wider">Campus Delivery</span>
                      <div className="text-xs font-extrabold text-emerald-600">FREE Doorstep Drop</div>
                    </div>

                    <button
                      onClick={() => onSelectRestaurant(restaurant.id)}
                      className="btn-primary py-2.5 px-5 text-xs sm:text-sm font-bold rounded-xl flex items-center gap-2 cursor-pointer shadow-md"
                    >
                      <Utensils size={15} />
                      <span>Browse Menu</span>
                      <ArrowRight size={15} />
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
