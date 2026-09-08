import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Search, Plus, Minus, Check, ShoppingBag, Store, MapPin, Sparkles } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { DEFAULT_MENU_ITEMS } from '../lib/campusSeedData';
import { useCart } from '../context/CartContext';

export default function MenuPage({ restaurant, onBack, orderingEnabled }) {
  const { items, addToCart, updateQuantity, setIsCartOpen, totalItemsCount, totalAmount } = useCart();
  const [menuItems, setMenuItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch menu items for this restaurant
  useEffect(() => {
    async function loadMenu() {
      if (!isSupabaseConfigured() || !supabase) {
        const filtered = DEFAULT_MENU_ITEMS.filter((i) => i.restaurant_id === restaurant.id);
        setMenuItems(filtered.length > 0 ? filtered : DEFAULT_MENU_ITEMS);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('menu_items')
          .select('*')
          .eq('restaurant_id', restaurant.id)
          .eq('is_available', true);

        if (error) throw error;
        if (data && data.length > 0) {
          setMenuItems(data);
        } else {
          const fallback = DEFAULT_MENU_ITEMS.filter((i) => i.restaurant_id === restaurant.id);
          setMenuItems(fallback);
        }
      } catch (err) {
        console.warn('Menu fetch error:', err.message);
        const fallback = DEFAULT_MENU_ITEMS.filter((i) => i.restaurant_id === restaurant.id);
        setMenuItems(fallback);
      } finally {
        setIsLoading(false);
      }
    }

    loadMenu();
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
      {filteredDishes.length === 0 ? (
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

            return (
              <div
                key={dish.id}
                className="card-elevated p-5 flex flex-col justify-between space-y-4 hover:border-[#FF5722]/40 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${dish.is_veg ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {dish.category}
                    </span>
                  </div>

                  <h4 className="font-bold text-base text-[#0F172A] font-['Outfit']">
                    {dish.name}
                  </h4>

                  {dish.description && (
                    <p className="text-xs text-[#64748B] mt-1 line-clamp-2">
                      {dish.description}
                    </p>
                  )}
                </div>

                <div className="pt-2 border-t border-[#F1EAE4] flex items-center justify-between">
                  <div className="font-mono text-base font-black text-[#0F172A]">
                    ₹{dish.price}
                  </div>

                  {qty === 0 ? (
                    <button
                      onClick={() => addToCart(dish, restaurant.id)}
                      disabled={!orderingEnabled}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-[#FFF0EB] hover:bg-[#FF5722] text-[#FF5722] hover:text-white transition-all cursor-pointer border border-[#FFD3C4] flex items-center gap-1.5 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus size={14} />
                      <span>Add to Cart</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2 bg-[#FAF8F5] border border-[#E2D9D0] rounded-xl p-1">
                      <button
                        onClick={() => updateQuantity(dish.id, -1)}
                        className="w-7 h-7 rounded-lg bg-white text-[#0F172A] hover:bg-slate-100 flex items-center justify-center font-bold text-xs cursor-pointer border-none shadow-xs"
                      >
                        <Minus size={13} />
                      </button>
                      <span className="font-mono text-xs font-extrabold w-5 text-center text-[#FF5722]">
                        {qty}
                      </span>
                      <button
                        onClick={() => updateQuantity(dish.id, 1)}
                        className="w-7 h-7 rounded-lg bg-[#FF5722] text-white hover:bg-[#F4511E] flex items-center justify-center font-bold text-xs cursor-pointer border-none shadow-xs"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  )}
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
