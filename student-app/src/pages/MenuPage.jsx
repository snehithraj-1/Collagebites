import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Search, Plus, Minus, ShoppingBag, MapPin, Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { DEFAULT_MENU_ITEMS } from '../lib/campusSeedData';
import { useCart } from '../context/CartContext';

const getFallbackImage = (isVeg) => {
  return isVeg
    ? 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=500&q=80'
    : 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=500&q=80';
};

export default function MenuPage({ restaurant, onBack, orderingEnabled }) {
  const { items, addToCart, updateQuantity, setIsCartOpen, totalItemsCount, totalAmount } = useCart();
  const [menuItems, setMenuItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch live menu items for this restaurant from backend / Neon DB
  useEffect(() => {
    let isMounted = true;

    async function loadMenu() {
      try {
        const res = await fetch(`/api/menu?restaurant_id=${encodeURIComponent(restaurant.id)}`);
        if (res.ok) {
          const data = await res.json();
          const itemsList = Array.isArray(data) ? data : (data.items || data.menu || []);
          if (isMounted && Array.isArray(itemsList) && itemsList.length > 0) {
            setMenuItems(itemsList);
            setIsLoading(false);
            return;
          }
        }
      } catch (err) {
        // Fallback
      }

      if (isSupabaseConfigured() && supabase) {
        try {
          const { data, error } = await supabase
            .from('menu_items')
            .select('*')
            .eq('restaurant_id', restaurant.id);

          if (!error && data && data.length > 0) {
            if (isMounted) setMenuItems(data);
            setIsLoading(false);
            return;
          }
        } catch (err) {}
      }

      // Default fallback
      if (isMounted) {
        const fallback = DEFAULT_MENU_ITEMS.filter((i) => i.restaurant_id === restaurant.id);
        setMenuItems(fallback.length > 0 ? fallback : DEFAULT_MENU_ITEMS);
        setIsLoading(false);
      }
    }

    loadMenu();
    const interval = setInterval(loadMenu, 5000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [restaurant.id]);

  // Extract normalized categories
  const categories = useMemo(() => {
    const set = new Set(menuItems.map((i) => i.category).filter(Boolean));
    return ['ALL', ...Array.from(set)];
  }, [menuItems]);

  // Filtered dishes
  const filteredDishes = useMemo(() => {
    return menuItems.filter((item) => {
      const matchCat = activeCategory === 'ALL' || item.category === activeCategory;
      const matchSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchSearch;
    });
  }, [menuItems, activeCategory, searchQuery]);

  const isOpen = restaurant.is_open !== false && orderingEnabled;

  return (
    <div className={`max-w-4xl mx-auto px-4 sm:px-6 py-5 space-y-5 animate-fade-in ${
      totalItemsCount > 0 ? 'pb-44 md:pb-28' : 'pb-24 md:pb-12'
    }`}>
      
      {/* 1. Header: Back Navigation, Restaurant Meta & Availability */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E2D9D0] shadow-xs space-y-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#64748B] hover:text-[#0F172A] transition-colors cursor-pointer border-none bg-transparent p-0"
        >
          <ArrowLeft size={16} />
          <span>Back to Restaurants</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] font-['Outfit'] tracking-tight">
                {restaurant.name}
              </h2>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                isOpen
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}>
                {isOpen ? 'Open Now' : 'Closed'}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-[#64748B] mt-1 font-medium">
              <span className="flex items-center gap-1 text-[#0F172A]">
                <MapPin size={13} className="text-[#FF5722]" />
                {restaurant.location || 'Beside Ayyappa PG Hostel'}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock size={13} className="text-[#64748B]" />
                {restaurant.prep_time || '15-20 min'}
              </span>
              <span>•</span>
              <span className="text-emerald-700 font-bold">Free Campus Delivery</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search food in menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#E2D9D0] text-xs text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#FF5722] focus:bg-white transition-colors"
            />
          </div>
        </div>
      </div>

      {/* 2. Sticky Horizontally Scrollable Categories */}
      <div className="sticky top-16 z-20 bg-[#FAF8F5]/95 backdrop-blur-xs py-2 -mx-4 px-4 sm:-mx-6 sm:px-6 flex items-center gap-2 overflow-x-auto scrollbar-none">
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                isActive
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* 3. Compact Food Items List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-white rounded-xl p-3.5 border border-slate-200 flex items-center justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="w-16 h-3 skeleton-shimmer" />
                <div className="w-3/4 h-4 skeleton-shimmer" />
                <div className="w-14 h-4 skeleton-shimmer" />
              </div>
              <div className="w-20 h-20 skeleton-shimmer rounded-lg shrink-0" />
            </div>
          ))}
        </div>
      ) : filteredDishes.length === 0 ? (
        <div className="py-12 text-center text-slate-500 bg-white rounded-xl border border-slate-200 p-6 space-y-2">
          <h4 className="font-bold text-sm text-slate-900">No dishes found</h4>
          <p className="text-xs">Try searching for a different dish name or select another category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredDishes.map((dish) => {
            const inCart = items.find((i) => i.id === dish.id);
            const qty = inCart ? inCart.quantity : 0;
            const isSoldOut = dish.is_available === false || dish.is_available === 'false' || dish.is_available === 0 || dish.isAvailable === false || dish.isAvailable === 'false';

            return (
              <div
                key={dish.id}
                className={`bg-white rounded-xl p-3 sm:p-3.5 border transition-all flex items-start justify-between gap-3 ${
                  isSoldOut
                    ? 'opacity-60 bg-slate-50 border-slate-200'
                    : 'border-slate-200 hover:border-slate-300 shadow-xs'
                }`}
              >
                {/* Left Information Hierarchy */}
                <div className="flex-1 min-w-0 pr-1">
                  <div className="flex items-center gap-1.5 mb-1">
                    {/* Real Veg / Non-Veg Indicator Dot */}
                    <div
                      className={`w-3.5 h-3.5 rounded-xs border flex items-center justify-center shrink-0 ${
                        dish.is_veg ? 'border-emerald-600 bg-white' : 'border-rose-600 bg-white'
                      }`}
                      title={dish.is_veg ? 'Vegetarian' : 'Non-Vegetarian'}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full ${dish.is_veg ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                    </div>

                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      {dish.category}
                    </span>

                    {isSoldOut && (
                      <span className="px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 text-[9px] font-bold uppercase">
                        Sold Out
                      </span>
                    )}
                  </div>

                  <h4 className={`font-bold text-sm font-['Outfit'] leading-snug ${isSoldOut ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                    {dish.name}
                  </h4>

                  <div className={`text-xs font-bold font-mono mt-1 ${isSoldOut ? 'text-slate-400' : 'text-slate-900'}`}>
                    ₹{dish.price}
                  </div>

                  {dish.description && (
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                      {dish.description}
                    </p>
                  )}
                </div>

                {/* Right Image & Stepper Controls */}
                <div className="relative flex flex-col items-center shrink-0">
                  <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 relative">
                    <img
                      src={dish.image_url || getFallbackImage(dish.is_veg)}
                      alt={dish.name}
                      loading="lazy"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = getFallbackImage(dish.is_veg);
                      }}
                    />
                    {isSoldOut && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <span className="bg-rose-600 text-white text-[9px] font-bold uppercase px-1 py-0.5 rounded">
                          Unavailable
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Add Button / Quantity Stepper */}
                  <div className="-mt-3 z-10 w-full flex justify-center px-1">
                    {isSoldOut || !isOpen ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-400 border border-slate-200">
                        Unavailable
                      </span>
                    ) : qty === 0 ? (
                      <button
                        onClick={() => addToCart(dish, restaurant.id)}
                        className="px-3 py-1 rounded-lg text-xs font-extrabold bg-white hover:bg-[#FF5722] text-[#FF5722] hover:text-white transition-all cursor-pointer border border-[#FF5722] flex items-center gap-1 shadow-xs"
                      >
                        <Plus size={11} />
                        <span>ADD</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-1 bg-white border border-[#FF5722] rounded-lg p-0.5 shadow-xs">
                        <button
                          onClick={() => updateQuantity(dish.id, -1)}
                          className="w-5 h-5 rounded bg-slate-100 text-slate-800 hover:bg-slate-200 flex items-center justify-center font-bold text-xs cursor-pointer border-none"
                        >
                          <Minus size={10} />
                        </button>
                        <span className="font-mono text-xs font-bold w-4 text-center text-[#FF5722]">
                          {qty}
                        </span>
                        <button
                          onClick={() => updateQuantity(dish.id, 1)}
                          className="w-5 h-5 rounded bg-[#FF5722] text-white hover:bg-[#F4511E] flex items-center justify-center font-bold text-xs cursor-pointer border-none"
                        >
                          <Plus size={10} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 4. Floating Cart Summary Bar (Strictly Above Mobile BottomNav) */}
      {totalItemsCount > 0 && (
        <div
          className="fixed left-4 right-4 z-40 max-w-lg mx-auto md:sticky md:bottom-6 md:left-auto md:right-auto md:max-w-xl transition-all animate-slide-up"
          style={{
            bottom: 'calc(var(--bottom-nav-height, 60px) + env(safe-area-inset-bottom, 0px) + 12px)'
          }}
        >
          <div className="bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between gap-3 border border-slate-700">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#FF5722] flex items-center justify-center text-white shrink-0">
                <ShoppingBag size={16} />
              </div>
              <div>
                <div className="text-xs font-medium text-slate-300">
                  {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'} added
                </div>
                <div className="text-xs font-bold text-white">
                  {restaurant.name}
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(true)}
              className="py-2 px-4 rounded-lg text-xs font-extrabold bg-[#FF5722] hover:bg-[#F4511E] text-white flex items-center gap-1.5 transition-all cursor-pointer border-none shadow-xs"
            >
              <span>View Cart • ₹{totalAmount}</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
