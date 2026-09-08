import React, { useState, useMemo } from 'react';
import { ArrowLeft, Star, Clock, MapPin, Search, Sparkles, Filter } from 'lucide-react';
import { FOOD_ITEMS } from '../data/campusFoodData';
import FoodCard from '../components/FoodCard';

export default function VendorPage({ vendor, onBack, onOpenFoodDetails }) {
  const [inMenuQuery, setInMenuQuery] = useState('');
  const [vendorCategory, setVendorCategory] = useState('all');
  const [vegOnly, setVegOnly] = useState(false);

  // Get all dishes for this vendor
  const vendorDishes = useMemo(() => {
    return FOOD_ITEMS.filter((item) => item.vendorId === vendor.id);
  }, [vendor]);

  // Categories available in this vendor's menu
  const availableCategories = useMemo(() => {
    const cats = new Set(vendorDishes.map((d) => d.category));
    return ['all', ...Array.from(cats)];
  }, [vendorDishes]);

  // Filtered dishes
  const filteredDishes = useMemo(() => {
    return vendorDishes.filter((item) => {
      const q = inMenuQuery.toLowerCase().trim();
      const matchQuery = !q || item.name.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
      const matchCat = vendorCategory === 'all' || item.category === vendorCategory;
      const matchVeg = !vegOnly || item.isVeg;
      return matchQuery && matchCat && matchVeg;
    });
  }, [vendorDishes, inMenuQuery, vendorCategory, vegOnly]);

  return (
    <div className="pb-24 pt-4 space-y-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Back Button */}
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#E2D9D0] text-xs font-bold text-[#475569] hover:text-[#0F172A] hover:bg-[#F4EFEA] mb-4 cursor-pointer transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to All Corners</span>
        </button>

        {/* Vendor Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden bg-[#0F172A] text-white shadow-xl">
          {/* Cover image */}
          <div className="relative h-48 sm:h-64 w-full">
            <img
              src={vendor.banner}
              alt={vendor.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/60 to-transparent" />
          </div>

          {/* Vendor Details Overlaid */}
          <div className="p-6 sm:p-8 relative -mt-16 sm:-mt-20 z-10 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={vendor.logo}
                alt={vendor.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-4 border-white shadow-xl"
              />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl sm:text-3xl font-black font-['Outfit'] text-white">
                    {vendor.name}
                  </h1>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 font-medium mb-2">{vendor.tagline}</p>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                  <span className="flex items-center gap-1 font-bold text-amber-400 bg-black/40 px-2.5 py-0.5 rounded-md backdrop-blur-sm">
                    <Star size={13} className="fill-amber-400" />
                    <span>{vendor.rating} ({vendor.reviewsCount})</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock size={13} className="text-slate-400" />
                    <span>{vendor.prepTime}</span>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin size={13} className="text-slate-400" />
                    <span>{vendor.location}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Free Delivery Tag */}
            <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold backdrop-blur-sm flex items-center gap-1.5 self-stretch sm:self-auto justify-center">
              <Sparkles size={14} />
              <span>Campus Delivery: FREE</span>
            </div>
          </div>
        </div>

        {/* In-Menu Search & Filters Bar */}
        <div className="p-4 bg-white rounded-2xl border border-[#F1EAE4] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 mt-6">
          {/* In-menu search */}
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              placeholder={`Search inside ${vendor.name}...`}
              value={inMenuQuery}
              onChange={(e) => setInMenuQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E2D9D0] focus:outline-none focus:border-[#FF5722]"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar w-full sm:w-auto">
            {availableCategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setVendorCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-colors cursor-pointer border whitespace-nowrap ${
                  vendorCategory === cat
                    ? 'bg-[#FF5722] text-white border-[#FF5722]'
                    : 'bg-[#FAF8F5] text-[#475569] border-[#E2D9D0] hover:bg-[#FFF0EB]'
                }`}
              >
                {cat}
              </button>
            ))}

            {/* Veg toggle */}
            <button
              onClick={() => setVegOnly(!vegOnly)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer whitespace-nowrap ${
                vegOnly ? 'bg-[#ECFDF5] text-[#065F46] border-[#10B981]' : 'bg-[#FAF8F5] text-[#475569] border-[#E2D9D0]'
              }`}
            >
              <div className="veg-badge" />
              <span>Veg Only</span>
            </button>
          </div>
        </div>

        {/* Menu Dishes Grid */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-extrabold text-[#0F172A] font-['Outfit']">
              Menu ({filteredDishes.length} items)
            </h2>
          </div>

          {filteredDishes.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-[#F1EAE4]">
              <p className="text-sm font-bold text-[#0F172A]">No dishes match your search.</p>
              <button
                onClick={() => {
                  setInMenuQuery('');
                  setVendorCategory('all');
                  setVegOnly(false);
                }}
                className="mt-3 btn-secondary text-xs"
              >
                Clear Filters
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
        </div>

      </div>
    </div>
  );
}
