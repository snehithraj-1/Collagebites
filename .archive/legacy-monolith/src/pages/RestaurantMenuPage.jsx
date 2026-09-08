import React, { useState, useMemo } from 'react';
import { ArrowLeft, Search, MapPin, Phone, Star, Clock, AlertTriangle, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { RESTAURANTS, LOCAL_HOME_KITCHEN_MENU, SECOND_RESTAURANT_MENU } from '../data/campusData';

export default function RestaurantMenuPage({ restaurantId, onBack }) {
  const { 
    cart, 
    addToCart, 
    updateQuantity, 
    setIsCartOpen,
    overallOrderingEnabled, 
    restaurantStatuses 
  } = useApp();

  const restaurant = RESTAURANTS.find((r) => r.id === restaurantId) || RESTAURANTS[0];
  const restaurantStatus = restaurantStatuses[restaurant.id] || 'OPEN';
  const isOrderingOpen = overallOrderingEnabled && restaurantStatus === 'OPEN';

  // Get menu items for this restaurant
  const menuItems = useMemo(() => {
    if (restaurant.id === 'local-home-kitchen') {
      return LOCAL_HOME_KITCHEN_MENU;
    }
    return SECOND_RESTAURANT_MENU;
  }, [restaurant.id]);

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = Array.from(new Set(menuItems.map((item) => item.category)));
    return ['All', ...cats];
  }, [menuItems]);

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [vegOnly, setVegOnly] = useState(false);

  // Filtered menu items
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchCat = selectedCategory === 'All' || item.category === selectedCategory;
      const matchSearch = !searchQuery.trim() || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase().trim());
      const matchVeg = !vegOnly || item.isVeg;
      return matchCat && matchSearch && matchVeg;
    });
  }, [menuItems, selectedCategory, searchQuery, vegOnly]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-bold text-[#64748B] hover:text-[#0F172A] transition-colors cursor-pointer border-none bg-transparent"
      >
        <ArrowLeft size={16} />
        <span>Back to Campus Restaurants</span>
      </button>

      {/* Restaurant Header Banner Card */}
      <div className="relative rounded-3xl p-6 sm:p-8 overflow-hidden bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0A0F1D] text-white shadow-xl">
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-[#FF5722]/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5 mb-2 flex-wrap">
              {restaurantStatus === 'OPEN' ? (
                <span className="px-3 py-0.5 rounded-full bg-emerald-500 text-white text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  <span>OPEN</span>
                </span>
              ) : (
                <span className="px-3 py-0.5 rounded-full bg-rose-600 text-white text-[11px] font-black uppercase tracking-wider">
                  CLOSED
                </span>
              )}
              <span className="text-xs font-semibold text-[#FF8A65]">{restaurant.cuisine}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black font-['Outfit'] tracking-tight">
              {restaurant.name}
            </h1>

            <div className="mt-2 space-y-1 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <MapPin size={13} className="text-[#FF5722]" />
                <span>{restaurant.location} • <span className="text-slate-400">{restaurant.landmark}</span></span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={13} className="text-[#10B981]" />
                <span>Call Kitchen: <strong className="text-white">{restaurant.phone}</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
              <div className="text-slate-400 font-medium">Avg Prep Time</div>
              <div className="text-base font-extrabold text-white mt-0.5 flex items-center gap-1">
                <Clock size={14} className="text-[#F59E0B]" />
                <span>{restaurant.prepTime}</span>
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
              <div className="text-slate-400 font-medium">Rating</div>
              <div className="text-base font-extrabold text-white mt-0.5 flex items-center gap-1">
                <Star size={14} className="fill-[#F59E0B] text-[#F59E0B]" />
                <span>{restaurant.rating}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Closed / Disabled Notice */}
      {!isOrderingOpen && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 text-amber-900">
          <AlertTriangle size={20} className="text-amber-600 flex-shrink-0" />
          <div className="text-xs">
            <strong>Ordering is currently unavailable.</strong>{' '}
            {!overallOrderingEnabled
              ? 'Campus master ordering is turned OFF by admin.'
              : `${restaurant.name} is currently marked as CLOSED.`}{' '}
            You may browse items and prices below.
          </div>
        </div>
      )}

      {/* Menu Filters & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-[#F1EAE4] shadow-xs">
        {/* Search in Menu */}
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search dish name (e.g. Biryani, Noodles, 65)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-[#E2D9D0] bg-[#FAF8F5] focus:outline-none focus:border-[#FF5722]"
          />
        </div>

        {/* Veg Only Filter */}
        <button
          onClick={() => setVegOnly(!vegOnly)}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
            vegOnly
              ? 'bg-[#ECFDF5] border-[#10B981] text-[#065F46] shadow-xs'
              : 'bg-[#FAF8F5] border-[#E2D9D0] text-[#64748B] hover:border-[#10B981]'
          }`}
        >
          <div className="veg-badge" />
          <span>Pure Veg Only</span>
        </button>
      </div>

      {/* Category Horizontal Pills */}
      <div className="w-full overflow-x-auto hide-scrollbar py-1">
        <div className="flex items-center gap-2 min-w-max">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-[#FF5722] text-white border-[#FF5722] shadow-sm scale-[1.02]'
                    : 'bg-white text-[#475569] border-[#E2D9D0] hover:border-[#FF5722]/50 hover:bg-[#FFF8F5]'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dishes Count */}
      <div className="text-xs font-bold text-[#64748B]">
        Showing {filteredItems.length} dishes {selectedCategory !== 'All' ? `in ${selectedCategory}` : ''}
      </div>

      {/* Menu Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-[#F1EAE4]">
          <p className="text-sm font-bold text-[#0F172A]">No dishes found matching your selection.</p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
              setVegOnly(false);
            }}
            className="mt-3 btn-secondary text-xs"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredItems.map((item) => {
            const cartItem = cart.find((i) => i.id === item.id);
            const qty = cartItem ? cartItem.qty : 0;

            return (
              <div
                key={item.id}
                className="bg-white border border-[#E2D9D0] rounded-2xl p-4 flex flex-col justify-between shadow-xs hover:shadow-md transition-all group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className={item.isVeg ? 'veg-badge' : 'nonveg-badge'} />
                    {item.portion && (
                      <span className="text-[10px] font-bold text-[#64748B] px-2 py-0.5 rounded bg-[#F4EFEA]">
                        {item.portion}
                      </span>
                    )}
                  </div>

                  <h3 className="font-extrabold text-sm text-[#0F172A] group-hover:text-[#FF5722] transition-colors leading-snug mb-1">
                    {item.name}
                  </h3>
                  <p className="text-[11px] text-[#94A3B8] font-semibold mb-3">
                    {item.category}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#F1EAE4] mt-3">
                  <div className="font-black text-base text-[#0F172A] font-['Outfit']">
                    ₹{item.price}
                  </div>

                  {qty === 0 ? (
                    <button
                      onClick={() => addToCart({
                        id: item.id,
                        name: item.name,
                        price: item.price,
                        isVeg: item.isVeg,
                        restaurantId: restaurant.id,
                        restaurantName: restaurant.name,
                        category: item.category
                      })}
                      disabled={!isOrderingOpen}
                      className={`btn-add py-1 px-3 text-xs cursor-pointer ${
                        !isOrderingOpen ? 'opacity-40 cursor-not-allowed hover:bg-white hover:text-[#FF5722]' : ''
                      }`}
                    >
                      <Plus size={12} />
                      <span>ADD</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-1.5 bg-[#FFF0EB] border border-[#FF5722]/30 rounded-xl px-2 py-1 shadow-xs">
                      <button
                        onClick={() => updateQuantity(item.id, qty - 1)}
                        className="w-5 h-5 rounded flex items-center justify-center text-[#FF5722] hover:bg-[#FF5722] hover:text-white transition-colors cursor-pointer border-none bg-white"
                      >
                        <Minus size={11} />
                      </button>
                      <span className="font-extrabold text-xs text-[#FF5722] min-w-[14px] text-center font-['Outfit']">
                        {qty}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, qty + 1)}
                        disabled={!isOrderingOpen}
                        className="w-5 h-5 rounded flex items-center justify-center text-[#FF5722] hover:bg-[#FF5722] hover:text-white transition-colors cursor-pointer border-none bg-white"
                      >
                        <Plus size={11} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sticky Bottom Cart Bar (if cart has items) */}
      {cart.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto z-40">
          <div
            onClick={() => setIsCartOpen(true)}
            className="p-3.5 px-5 rounded-2xl bg-[#0F172A] text-white shadow-2xl flex items-center justify-between cursor-pointer border border-white/10 hover:scale-[1.02] transition-transform animate-slide-up"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#FF5722] flex items-center justify-center text-white">
                <ShoppingBag size={16} />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-300">
                  {cart.reduce((a, b) => a + b.qty, 0)} Items Added
                </div>
                <div className="text-base font-black text-white font-['Outfit']">
                  ₹{cart.reduce((a, b) => a + b.price * b.qty, 0)}
                </div>
              </div>
            </div>

            <button className="btn-primary py-2 px-4 text-xs font-bold rounded-xl shadow-none">
              View Cart & Checkout →
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
