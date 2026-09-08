import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Search, Plus, Minus, Check, ShoppingBag, Store, MapPin, Sparkles } from 'lucide-react';
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

  // Fetch menu items for this restaurant
  // Fetch live menu items for this restaurant from backend / Neon DB
  useEffect(() => {
    let isMounted = true;

    async function loadMenu() {
      try {
        const res = await fetch(`/api/menu?restaurant_id=${encodeURIComponent(restaurant.id)}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success && Array.isArray(data.items) && data.items.length > 0) {
            setMenuItems(data.items);
            setIsLoading(false);
            return;
          }
        }
      } catch (err) {
        // Backend offline, try Supabase or fallback
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

    // Poll every 4 seconds so "Sold Out" status updates live for students
    const interval = setInterval(loadMenu, 4000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [restaurant.id]);

  // Extract unique categories
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fade-in">
      
      {/* Back Button & Restaurant Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#F1EAE4] pb-6">
        <div>
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-bold text-[#64748B] hover:text-[#0F172A] transition-colors cursor-pointer border-none bg-transparent p-0 mb-3"
          >
            <ArrowLeft size={16} />
            <span>Back to Restaurants</span>
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF0EB] text-[#FF5722] flex items-center justify-center font-black text-2xl shadow-xs">
              👨‍🍳
            </div>
            <div>
              <h2 className="text-2xl font-black text-[#0F172A] font-['Outfit']">
                {restaurant.name}
              </h2>
              <div className="flex items-center gap-2 text-xs text-[#64748B] mt-0.5">
                <MapPin size={12} className="text-[#FF5722]" />
                <span>{restaurant.location || 'Neerukonda Village'}</span>
                <span>•</span>
                <span className="text-emerald-600 font-bold">Free Hostel Delivery</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search dishes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-white border border-[#E2D9D0] text-xs text-[#0F172A] placeholder-slate-400 focus:outline-none focus:border-[#FF5722] shadow-xs"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
              activeCategory === cat
                ? 'bg-[#FF5722] text-white border-[#FF5722] shadow-md shadow-[#FF5722]/20'
                : 'bg-white text-[#64748B] hover:text-[#0F172A] border-[#E2D9D0] hover:bg-[#FAF8F5]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Menu Items Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 animate-fade-in">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="card-elevated p-5 space-y-4 border border-[#F1EAE4] bg-white">
              <div className="flex justify-between items-center">
                <div className="w-20 h-4 skeleton-shimmer" />
                <div className="w-12 h-4 skeleton-shimmer" />
              </div>
              <div className="w-3/4 h-5 skeleton-shimmer" />
              <div className="w-full h-8 skeleton-shimmer" />
              <div className="pt-2 border-t border-[#F1EAE4] flex justify-between items-center">
                <div className="w-14 h-5 skeleton-shimmer" />
                <div className="w-24 h-8 skeleton-shimmer rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredDishes.length === 0 ? (
        <div className="py-16 text-center text-[#64748B] space-y-2">
          <div className="text-4xl">🔍</div>
          <h4 className="font-bold text-sm text-[#0F172A]">No dishes matched your search</h4>
          <p className="text-xs">Try searching for a different dish name or reset filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredDishes.map((dish) => {
            const inCart = items.find((i) => i.id === dish.id);
            const qty = inCart ? inCart.quantity : 0;
            const isSoldOut = dish.is_available === false;

            return (
              <div
                key={dish.id}
                className={`card-elevated p-4 sm:p-5 flex flex-col justify-between space-y-3 transition-all duration-200 bg-white border border-[#F1EAE4] rounded-2xl ${
                  isSoldOut
                    ? 'opacity-70 bg-slate-50/80 border-slate-200'
                    : 'hover:border-[#FF5722]/40 hover:shadow-md'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Dish Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <div
                        className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center ${
                          dish.is_veg ? 'border-emerald-600 bg-white' : 'border-rose-600 bg-white'
                        }`}
                        title={dish.is_veg ? 'Vegetarian' : 'Non-Vegetarian'}
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${dish.is_veg ? 'bg-emerald-600' : 'bg-rose-600'}`} />
                      </div>
                      <span className="text-[10px] font-bold text-[#8A7B70] uppercase tracking-wider">
                        {dish.category}
                      </span>
                      {isSoldOut && (
                        <span className="ml-1 px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-700 border border-rose-200 text-[9px] font-black uppercase tracking-wider">
                          Sold Out
                        </span>
                      )}
                    </div>

                    <h4 className={`font-bold text-sm sm:text-base font-['Outfit'] leading-snug ${isSoldOut ? 'text-slate-400 line-through' : 'text-[#0F172A]'}`}>
                      {dish.name}
                    </h4>

                    <div className={`font-mono text-sm sm:text-base font-black mt-1 ${isSoldOut ? 'text-slate-400' : 'text-[#0F172A]'}`}>
                      ₹{dish.price}
                    </div>

                    {dish.description && (
                      <p className="text-xs text-[#64748B] mt-1.5 line-clamp-2 leading-relaxed">
                        {dish.description}
                      </p>
                    )}
                  </div>

                  {/* Food Dish Image */}
                  <div className="relative flex flex-col items-center shrink-0">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-slate-100 border border-[#F1EAE4] shadow-xs relative">
                      <img
                        src={dish.image_url || getFallbackImage(dish.is_veg)}
                        alt={dish.name}
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.src = getFallbackImage(dish.is_veg);
                        }}
                      />
                      {isSoldOut && (
                        <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
                          <span className="bg-rose-600 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider shadow-sm">
                            Sold Out
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Add to Cart / Quantity Control Button */}
                    <div className="-mt-3.5 z-10 w-full flex justify-center px-1">
                      {isSoldOut ? (
                        <span className="px-2.5 py-1 rounded-xl text-[10px] font-bold bg-slate-100 text-slate-400 border border-slate-200 shadow-xs">
                          Unavailable
                        </span>
                      ) : qty === 0 ? (
                        <button
                          onClick={() => addToCart(dish, restaurant.id)}
                          disabled={!orderingEnabled}
                          className="px-4 py-1.5 rounded-xl text-xs font-black bg-white hover:bg-[#FF5722] text-[#FF5722] hover:text-white transition-all cursor-pointer border border-[#FF5722]/40 hover:border-[#FF5722] flex items-center gap-1 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus size={13} />
                          <span>ADD</span>
                        </button>
                      ) : (
                        <div className="flex items-center gap-1.5 bg-white border border-[#FF5722] rounded-xl p-0.5 shadow-md">
                          <button
                            onClick={() => updateQuantity(dish.id, -1)}
                            className="w-6 h-6 rounded-lg bg-slate-100 text-[#0F172A] hover:bg-slate-200 flex items-center justify-center font-bold text-xs cursor-pointer border-none"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="font-mono text-xs font-black w-4 text-center text-[#FF5722]">
                            {qty}
                          </span>
                          <button
                            onClick={() => updateQuantity(dish.id, 1)}
                            className="w-6 h-6 rounded-lg bg-[#FF5722] text-white hover:bg-[#F4511E] flex items-center justify-center font-bold text-xs cursor-pointer border-none"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating View Cart Bar if Cart has items */}
      {totalItemsCount > 0 && (
        <div className="sticky bottom-6 z-30 max-w-xl mx-auto animate-slide-up">
          <div className="bg-[#0F172A] text-white p-4 rounded-3xl shadow-2xl flex items-center justify-between gap-4 border border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FF5722] flex items-center justify-center font-bold text-white shadow-md">
                <ShoppingBag size={18} />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-300">
                  {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'} in cart
                </div>
                <div className="text-sm font-black font-mono text-emerald-400">
                  Total: ₹{totalAmount}
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(true)}
              className="btn-primary py-2.5 px-6 rounded-2xl text-xs font-bold cursor-pointer border-none"
            >
              Review & Checkout
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
