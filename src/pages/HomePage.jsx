import React, { useState, useMemo } from 'react';
import { Search, Sparkles, Flame, Clock, TrendingUp, Store, ArrowRight, ShieldCheck } from 'lucide-react';
import CategoryPills from '../components/CategoryPills';
import FoodCard from '../components/FoodCard';
import VendorCard from '../components/VendorCard';
import { FOOD_ITEMS, VENDORS, CAMPUS_INFO, STUDENT_TESTIMONIALS } from '../data/campusFoodData';
import { useCart } from '../context/CartContext';

export default function HomePage({ onOpenFoodDetails, onSelectVendor, onOpenSearch }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [vegOnlyFilter, setVegOnlyFilter] = useState(false);
  const { applyCoupon, setIsCartOpen } = useCart();

  // Dynamic time-based greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning ☀️";
    if (hour < 17) return "Good Afternoon 🌤️";
    if (hour < 22) return "Good Evening 🌆";
    return "Late Night Cravings? 🌙";
  }, []);

  // Filtered dishes
  const filteredDishes = useMemo(() => {
    return FOOD_ITEMS.filter((item) => {
      const matchCat = selectedCategory === 'all' || item.category === selectedCategory;
      const matchVeg = !vegOnlyFilter || item.isVeg;
      return matchCat && matchVeg;
    });
  }, [selectedCategory, vegOnlyFilter]);

  // Popular items
  const popularItems = useMemo(() => {
    return FOOD_ITEMS.filter((item) => item.isPopularNearYou);
  }, []);

  return (
    <div className="pb-24 pt-4 sm:pt-6 space-y-10">
      
      {/* 1. Hero Welcome & Search Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl p-6 sm:p-10 lg:p-12 overflow-hidden bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0A0F1D] text-white shadow-2xl border border-white/10">
          {/* Background decorative glow mesh */}
          <div className="absolute -right-20 -bottom-20 w-96 h-96 rounded-full bg-[#FF5722]/25 blur-3xl pointer-events-none" />
          <div className="absolute left-1/4 -top-24 w-80 h-80 rounded-full bg-[#F59E0B]/15 blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Column: Heading, Search & Benefits */}
            <div className="lg:col-span-7 flex flex-col">
              {/* Campus Status Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-bold text-slate-200 mb-5 w-fit shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[#FF8A65]">SRM-AP Dining</span>
                <span>•</span>
                <span className="text-slate-300">Free Hostel Doorstep Drop</span>
              </div>

              {/* Greeting & Headline */}
              <h1 className="text-3xl sm:text-5xl lg:text-5xl font-black font-['Outfit'] tracking-tight leading-[1.15] mb-3">
                {greeting} <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF7A50] via-[#FF8A65] to-[#FFAB91]">
                  Craving Fresh Food?
                </span>
              </h1>
              
              <p className="text-sm sm:text-base text-slate-300 font-medium mb-6 max-w-xl leading-relaxed">
                Order authentic meals from <strong className="text-white">Hotel Bheemasena</strong>, <strong className="text-white">Food Corner</strong>, and <strong className="text-white">A1 Biryani</strong> directly to your room in 15–20 minutes.
              </p>

              {/* Search Bar Input */}
              <div
                onClick={onOpenSearch}
                className="flex items-center gap-3 w-full max-w-xl bg-white rounded-2xl p-2 sm:p-2.5 shadow-xl shadow-black/30 cursor-pointer group hover:ring-2 hover:ring-[#FF5722] transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-[#FFF0EB] flex items-center justify-center text-[#FF5722] flex-shrink-0 group-hover:scale-105 transition-transform">
                  <Search size={18} />
                </div>
                <span className="text-xs sm:text-sm font-medium text-[#64748B] flex-1 truncate">
                  Search for Chicken Dum Biryani, noodles, rolls, shakes...
                </span>
                <button
                  type="button"
                  className="btn-primary py-2 px-5 text-xs sm:text-sm font-bold rounded-xl hidden sm:flex items-center gap-1.5"
                >
                  <span>Explore Menu</span>
                </button>
              </div>

              {/* Quick Cravings Filter Chips */}
              <div className="flex items-center gap-2 mt-4 text-xs text-slate-300 overflow-x-auto hide-scrollbar">
                <span className="font-semibold text-slate-400">Popular:</span>
                {[
                  { label: 'Chicken Dum Biryani', emoji: '🍗' },
                  { label: 'Chicken Noodles', emoji: '🍜' },
                  { label: 'Veg Manchurian', emoji: '🥢' },
                  { label: 'Oreo Shake', emoji: '🥤' }
                ].map((tag) => (
                  <button
                    key={tag.label}
                    onClick={onOpenSearch}
                    className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-xs text-slate-200 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <span>{tag.emoji}</span>
                    <span>{tag.label}</span>
                  </button>
                ))}
              </div>

              {/* Key Trust Signals */}
              <div className="flex items-center gap-6 mt-8 pt-6 border-t border-white/10 text-xs text-slate-300 flex-wrap">
                <div className="flex items-center gap-2">
                  <span className="text-base">⚡</span>
                  <div>
                    <div className="font-bold text-white">15-20 Min</div>
                    <div className="text-[11px] text-slate-400">Avg. Cooking Time</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-base">🛵</span>
                  <div>
                    <div className="font-bold text-white">₹0 Delivery Fee</div>
                    <div className="text-[11px] text-slate-400">To All Hostel Blocks</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-base">⭐</span>
                  <div>
                    <div className="font-bold text-white">4.9 / 5.0</div>
                    <div className="text-[11px] text-slate-400">Student Verified</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Highlight Card (Desktop Showcase) */}
            <div className="hidden lg:block lg:col-span-5">
              <div className="relative mx-auto max-w-sm">
                {/* Glow backdrop */}
                <div className="absolute -inset-1 bg-gradient-to-r from-[#FF5722] to-[#F59E0B] rounded-3xl blur-lg opacity-40 animate-pulse" />
                
                {/* Card */}
                <div className="relative bg-[#1E293B] border border-white/15 rounded-3xl overflow-hidden shadow-2xl">
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80"
                      alt="Chicken Dum Biryani"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1E293B] via-transparent to-transparent" />
                    
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[11px] font-bold flex items-center gap-1.5">
                      <span className="text-amber-400">★ 4.9</span>
                      <span className="text-slate-400">•</span>
                      <span>#1 Campus Craving</span>
                    </div>

                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-[#FF5722] text-white text-[10px] font-black uppercase tracking-wider shadow-md">
                      Hotel Bheemasena
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center justify-between mb-1.5">
                      <h3 className="text-lg font-bold text-white font-['Outfit']">
                        Special Chicken Dum Biryani
                      </h3>
                      <div className="text-lg font-black text-[#FF8A65] font-['Outfit']">
                        ₹290
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2 mb-4 leading-relaxed">
                      Fragrant dum basmati rice layered with marinated chicken, saffron, fried onions, and served with spiced salan & raita.
                    </p>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => onOpenFoodDetails(FOOD_ITEMS[0])}
                        className="btn-primary flex-1 py-2.5 text-xs font-bold rounded-xl"
                      >
                        Customize & Order
                      </button>
                      <button
                        onClick={onOpenSearch}
                        className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
                      >
                        View More
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. Promo Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#FFF0EB] via-[#FFE3D8] to-[#FFF0EB] border border-[#FFD3C4] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-xl bg-[#FF5722] text-white flex items-center justify-center text-xl flex-shrink-0 shadow-md shadow-[#FF5722]/30">
              🎉
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-[#0F172A] font-['Outfit']">
                Student Special: 50% OFF with code <span className="text-[#FF5722] uppercase">CAMPUS50</span>
              </h3>
              <p className="text-xs text-[#64748B]">Zero delivery fee on all hostel block drop-offs today.</p>
            </div>
          </div>
          <button
            onClick={() => {
              applyCoupon('CAMPUS50');
              setIsCartOpen(true);
            }}
            className="btn-primary py-2 px-4 text-xs font-bold flex-shrink-0 shadow-sm"
          >
            Apply Voucher
          </button>
        </div>
      </section>

      {/* 3. Categories Shelf */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] font-['Outfit']">
              Explore Cuisines & Bites
            </h2>
            <p className="text-xs text-[#64748B]">Filter your favorite campus food categories</p>
          </div>
          {/* Veg Only Toggle */}
          <button
            onClick={() => setVegOnlyFilter(!vegOnlyFilter)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
              vegOnlyFilter
                ? 'bg-[#ECFDF5] border-[#10B981] text-[#065F46] shadow-xs'
                : 'bg-white border-[#E2D9D0] text-[#64748B] hover:border-[#10B981]'
            }`}
          >
            <div className="veg-badge" />
            <span>Pure Veg</span>
          </button>
        </div>

        <CategoryPills
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </section>

      {/* 4. Popular Near You (Horizontal Scroll Shelf) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#FFF0EB] flex items-center justify-center text-[#FF5722]">
              <Flame size={18} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#0F172A] font-['Outfit']">
                Popular Near Your Hostel
              </h2>
              <p className="text-xs text-[#64748B]">Most ordered campus dishes right now</p>
            </div>
          </div>
        </div>

        {/* Scrollable Row */}
        <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-3 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0">
          {popularItems.map((food) => (
            <div key={food.id} className="min-w-[260px] sm:min-w-[280px] max-w-[280px] flex-shrink-0">
              <FoodCard food={food} onOpenDetails={onOpenFoodDetails} />
            </div>
          ))}
        </div>
      </section>

      {/* 5. Top Campus Food Corners (Vendors) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#F4EFEA] flex items-center justify-center text-[#0F172A]">
              <Store size={18} />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#0F172A] font-['Outfit']">
                Campus Food Corners
              </h2>
              <p className="text-xs text-[#64748B]">Authentic kitchens delivering inside the campus</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {VENDORS.map((vendor) => (
            <VendorCard
              key={vendor.id}
              vendor={vendor}
              onSelectVendor={onSelectVendor}
            />
          ))}
        </div>
      </section>

      {/* 6. All Trending Dishes Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-[#0F172A] font-['Outfit']">
              Trending Campus Dishes
            </h2>
            <p className="text-xs text-[#64748B]">
              Showing {filteredDishes.length} dishes in {selectedCategory === 'all' ? 'All Categories' : selectedCategory}
            </p>
          </div>
        </div>

        {filteredDishes.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-[#F1EAE4]">
            <p className="text-sm font-bold text-[#0F172A]">No dishes found in this category.</p>
            <button
              onClick={() => {
                setSelectedCategory('all');
                setVegOnlyFilter(false);
              }}
              className="mt-3 btn-secondary text-xs"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {filteredDishes.map((food) => (
              <FoodCard
                key={food.id}
                food={food}
                onOpenDetails={onOpenFoodDetails}
              />
            ))}
          </div>
        )}
      </section>

      {/* 7. Real Student Reviews & Campus Buzz */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-[#ECFDF5] flex items-center justify-center text-[#10B981]">
            <ShieldCheck size={18} />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-[#0F172A] font-['Outfit']">
              What SRM-AP Students Say
            </h2>
            <p className="text-xs text-[#64748B]">Real reviews from hostel residents</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {STUDENT_TESTIMONIALS.map((t, idx) => (
            <div 
              key={idx}
              className="p-4 rounded-2xl bg-white border border-[#E2D9D0] shadow-xs flex flex-col justify-between"
            >
              <div className="mb-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1 text-[#F59E0B] text-xs">
                    {'★'.repeat(t.stars)}
                  </div>
                  <span className="text-[11px] font-bold text-[#64748B] px-2 py-0.5 rounded-full bg-[#FAF8F5]">
                    {t.block}
                  </span>
                </div>
                <p className="text-xs text-[#334155] leading-relaxed italic">
                  "{t.text}"
                </p>
              </div>
              <div className="text-[11px] font-bold text-[#0F172A]">
                — {t.name}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Demo Notice Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#E2D9D0] text-center text-xs text-[#94A3B8]">
          <p>{CAMPUS_INFO.disclaimer}</p>
        </div>
      </div>

    </div>
  );
}
