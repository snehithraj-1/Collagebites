import React, { useState, useMemo } from 'react';
import { Search, X, Star, Clock, Plus, ArrowRight, Utensils, Store } from 'lucide-react';
import { FOOD_ITEMS, VENDORS } from '../data/campusFoodData';
import { useCart } from '../context/CartContext';

export default function SearchModal({ isOpen, onClose, onSelectVendor, onOpenFoodDetails, onSelectFood }) {
  const handleOpenFood = onOpenFoodDetails || onSelectFood;
  const [query, setQuery] = useState('');
  const [vegOnly, setVegOnly] = useState(false);
  const [under100Only, setUnder100Only] = useState(false);
  const { addToCart } = useCart();

  const popularTags = ["Chicken Biryani", "Egg Roll", "Butter Maggi", "Cold Coffee", "Peri Peri Fries", "Paneer Tikka", "Dosa"];

  // Filtered dishes
  const filteredFoods = useMemo(() => {
    if (!query.trim() && !vegOnly && !under100Only) return [];
    const q = query.toLowerCase().trim();
    return FOOD_ITEMS.filter((item) => {
      const matchQuery = !q ||
        item.name.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.vendorName.toLowerCase().includes(q);
      const matchVeg = !vegOnly || item.isVeg;
      const matchPrice = !under100Only || item.price <= 100;
      return matchQuery && matchVeg && matchPrice;
    });
  }, [query, vegOnly, under100Only]);

  // Filtered vendors
  const filteredVendors = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return VENDORS.filter((v) =>
      v.name.toLowerCase().includes(q) ||
      v.cuisine.toLowerCase().includes(q) ||
      v.tagline.toLowerCase().includes(q)
    );
  }, [query]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white animate-fade-in overflow-hidden">
      
      {/* Search Header */}
      <div className="px-4 sm:px-8 py-4 border-b border-[#F1EAE4] bg-[#FAF8F5] flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#FF5722]" />
          <input
            type="text"
            placeholder="Search food, vendors, dishes, rolls, biryani..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-white border border-[#E2D9D0] text-sm font-semibold text-[#0F172A] focus:outline-none focus:border-[#FF5722] shadow-xs"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A] border-none bg-transparent cursor-pointer"
            >
              <X size={16} />
            </button>
          )}
        </div>
        <button
          onClick={onClose}
          className="px-4 py-3 rounded-2xl bg-white border border-[#E2D9D0] text-xs font-bold text-[#475569] hover:bg-[#F4EFEA] transition-colors cursor-pointer"
        >
          Cancel
        </button>
      </div>

      {/* Quick Filter Toggles */}
      <div className="px-4 sm:px-8 py-3 bg-white border-b border-[#F1EAE4] flex items-center gap-2 overflow-x-auto hide-scrollbar">
        <button
          onClick={() => setVegOnly(!vegOnly)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
            vegOnly ? 'bg-[#ECFDF5] text-[#065F46] border-[#10B981]' : 'bg-[#FAF8F5] text-[#475569] border-[#E2D9D0]'
          }`}
        >
          <div className="veg-badge" />
          <span>Pure Veg Only</span>
        </button>

        <button
          onClick={() => setUnder100Only(!under100Only)}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
            under100Only ? 'bg-[#FFF0EB] text-[#FF5722] border-[#FF5722]' : 'bg-[#FAF8F5] text-[#475569] border-[#E2D9D0]'
          }`}
        >
          ⚡ Under ₹100 Budget
        </button>
      </div>

      {/* Search Body Content */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 max-w-5xl mx-auto w-full">
        
        {/* If Query is Empty: Show Popular Campus Cravings */}
        {!query && (
          <div>
            <h3 className="text-xs font-extrabold text-[#94A3B8] uppercase tracking-wider mb-3">
              Popular Campus Cravings 🔥
            </h3>
            <div className="flex flex-wrap gap-2 mb-8">
              {popularTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setQuery(tag)}
                  className="px-3.5 py-2 rounded-xl bg-[#F4EFEA] hover:bg-[#FFF0EB] border border-[#E2D9D0] hover:border-[#FF5722] text-xs font-semibold text-[#334155] hover:text-[#FF5722] transition-colors cursor-pointer"
                >
                  {tag}
                </button>
              ))}
            </div>

            <h3 className="text-xs font-extrabold text-[#94A3B8] uppercase tracking-wider mb-3">
              Campus Food Corners 🏪
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {VENDORS.map((vendor) => (
                <div
                  key={vendor.id}
                  onClick={() => {
                    onClose();
                    onSelectVendor(vendor);
                  }}
                  className="p-3 rounded-2xl border border-[#F1EAE4] hover:border-[#FF5722]/30 hover:bg-[#FAF8F5] flex items-center gap-3 cursor-pointer transition-colors"
                >
                  <img src={vendor.logo} alt={vendor.name} className="w-12 h-12 rounded-xl object-cover" />
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-sm text-[#0F172A] truncate">{vendor.name}</h4>
                    <p className="text-xs text-[#64748B] truncate">{vendor.cuisine}</p>
                  </div>
                  <ArrowRight size={16} className="text-[#94A3B8]" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Results: Matching Food Items */}
        {query && (
          <div className="space-y-6">
            
            {/* Matching Vendors */}
            {filteredVendors.length > 0 && (
              <div>
                <h3 className="text-xs font-extrabold text-[#94A3B8] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Store size={15} className="text-[#FF5722]" />
                  <span>Matching Food Corners ({filteredVendors.length})</span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredVendors.map((vendor) => (
                    <div
                      key={vendor.id}
                      onClick={() => {
                        onClose();
                        onSelectVendor(vendor);
                      }}
                      className="p-3.5 rounded-2xl border border-[#F1EAE4] bg-[#FAF8F5] hover:bg-white hover:border-[#FF5722] flex items-center gap-3 cursor-pointer transition-all shadow-xs"
                    >
                      <img src={vendor.logo} alt={vendor.name} className="w-14 h-14 rounded-xl object-cover" />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm text-[#0F172A] truncate">{vendor.name}</h4>
                        <p className="text-xs text-[#64748B] truncate">{vendor.cuisine}</p>
                        <div className="flex items-center gap-2 mt-1 text-[11px] font-semibold text-[#0F172A]">
                          <span className="flex items-center gap-0.5 text-amber-600">★ {vendor.rating}</span>
                          <span>•</span>
                          <span className="text-emerald-600">Free Delivery</span>
                        </div>
                      </div>
                      <button className="btn-secondary py-1.5 px-3 text-xs">
                        View Menu
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Matching Dishes */}
            <div>
              <h3 className="text-xs font-extrabold text-[#94A3B8] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Utensils size={15} className="text-[#FF5722]" />
                <span>Dishes Found ({filteredFoods.length})</span>
              </h3>

              {filteredFoods.length === 0 && filteredVendors.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 rounded-2xl bg-[#FAF8F5] flex items-center justify-center text-3xl mx-auto mb-3">
                    🔍
                  </div>
                  <h4 className="font-bold text-base text-[#0F172A]">No dishes matching "{query}"</h4>
                  <p className="text-xs text-[#64748B] mt-1 max-w-xs mx-auto">
                    Try searching for "Biryani", "Roll", "Maggi", or "Coffee"
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredFoods.map((food) => (
                    <div
                      key={food.id}
                      className="p-3 rounded-2xl border border-[#F1EAE4] hover:border-[#FF5722]/30 bg-white flex gap-3 shadow-xs hover:shadow-md transition-all"
                    >
                      <img
                        src={food.image}
                        alt={food.name}
                        onClick={() => {
                          onClose();
                          if (handleOpenFood) handleOpenFood(food);
                        }}
                        className="w-20 h-20 rounded-xl object-cover cursor-pointer flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0 flex flex-col">
                        <div className="flex items-center gap-1.5 mb-1">
                          <div className={food.isVeg ? 'veg-badge' : 'nonveg-badge'} />
                          <span className="text-[11px] text-[#94A3B8] truncate">{food.vendorName}</span>
                        </div>
                        <h4
                          onClick={() => {
                            onClose();
                            if (handleOpenFood) handleOpenFood(food);
                          }}
                          className="font-bold text-sm text-[#0F172A] truncate cursor-pointer hover:text-[#FF5722]"
                        >
                          {food.name}
                        </h4>
                        <div className="flex items-center justify-between mt-auto pt-2">
                          <span className="font-black text-sm text-[#0F172A]">₹{food.price}</span>
                          <button
                            onClick={() => addToCart(food, 1)}
                            className="btn-add py-1 px-3 text-xs"
                          >
                            <Plus size={13} />
                            <span>ADD</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
