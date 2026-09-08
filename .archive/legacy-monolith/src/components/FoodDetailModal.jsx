import React, { useState } from 'react';
import { X, Star, Clock, Plus, Minus, ShoppingBag, Flame, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function FoodDetailModal({ food, onClose }) {
  const { addToCart } = useCart();
  const [qty, setQty] = useState(1);
  const [spiceLevel, setSpiceLevel] = useState('Medium');
  const [customNotes, setCustomNotes] = useState('');

  if (!food) return null;

  const handleAdd = () => {
    addToCart(food, qty);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/90 backdrop-blur-md border border-[#F1EAE4] flex items-center justify-center text-[#475569] hover:text-[#0F172A] hover:bg-white shadow-md cursor-pointer transition-transform hover:scale-105"
        >
          <X size={18} />
        </button>

        {/* Large Food Image with Badges */}
        <div className="relative w-full h-64 overflow-hidden bg-[#F1EAE4] flex-shrink-0">
          <img
            src={food.image}
            alt={food.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

          {/* Dietary Tag */}
          <div className="absolute bottom-4 left-4 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/95 backdrop-blur-md shadow-sm">
            <div className={food.isVeg ? 'veg-badge' : 'nonveg-badge'} />
            <span className="text-xs font-bold text-[#334155] uppercase tracking-wider">
              {food.isVeg ? '100% Pure Veg' : 'Non-Vegetarian'}
            </span>
          </div>

          {/* Prep Time & Rating */}
          <div className="absolute bottom-4 right-4 flex items-center gap-2">
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-xs font-medium">
              <Clock size={13} className="text-[#F59E0B]" />
              <span>{food.prepTime}</span>
            </div>
            <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/95 backdrop-blur-md text-[#0F172A] text-xs font-bold shadow-sm">
              <Star size={13} className="fill-[#F59E0B] text-[#F59E0B]" />
              <span>{food.rating}</span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* Header Info */}
          <div>
            <span className="text-xs font-bold text-[#FF5722] uppercase tracking-wider">
              {food.vendorName}
            </span>
            <h2 className="text-2xl font-black text-[#0F172A] font-['Outfit'] mt-0.5">
              {food.name}
            </h2>
            <div className="text-xl font-extrabold text-[#0F172A] font-['Outfit'] mt-1">
              ₹{food.price}
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-[#475569] leading-relaxed">
            {food.description}
          </p>

          {/* Ingredients list */}
          {food.ingredients && (
            <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#F1EAE4]">
              <p className="text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider mb-1">
                Ingredients & Details
              </p>
              <p className="text-xs text-[#334155] font-medium">
                {food.ingredients}
              </p>
            </div>
          )}

          {/* Customization: Spice Level */}
          <div>
            <label className="block text-xs font-bold text-[#334155] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Flame size={14} className="text-[#FF5722]" />
              <span>Select Spiciness Level</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['Mild', 'Medium', 'Spicy'].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setSpiceLevel(level)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    spiceLevel === level
                      ? 'bg-[#FFF0EB] text-[#FF5722] border-[#FF5722] shadow-sm'
                      : 'bg-white text-[#64748B] border-[#E2D9D0] hover:bg-[#FAF8F5]'
                  }`}
                >
                  {level === 'Mild' && '🌶️ Mild'}
                  {level === 'Medium' && '🌶️🌶️ Medium'}
                  {level === 'Spicy' && '🌶️🌶️🌶️ Extra Spicy'}
                </button>
              ))}
            </div>
          </div>

          {/* Special Instructions Input */}
          <div>
            <label className="block text-xs font-bold text-[#334155] uppercase tracking-wider mb-1.5">
              Cooking Instructions (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Extra onions, less oil, keep cutlery..."
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#E2D9D0] bg-white focus:outline-none focus:border-[#FF5722]"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 bg-[#FAF8F5] border-t border-[#F1EAE4] flex items-center justify-between gap-4">
          
          {/* Quantity Stepper */}
          <div className="flex items-center gap-3 bg-white border border-[#E2D9D0] rounded-2xl px-3 py-2 shadow-xs">
            <button
              onClick={() => setQty((prev) => Math.max(1, prev - 1))}
              className="w-7 h-7 rounded-xl bg-[#F4EFEA] flex items-center justify-center text-[#475569] hover:bg-[#EAE4DC] cursor-pointer border-none"
            >
              <Minus size={13} />
            </button>
            <span className="font-extrabold text-base text-[#0F172A] min-w-[20px] text-center font-['Outfit']">
              {qty}
            </span>
            <button
              onClick={() => setQty((prev) => prev + 1)}
              className="w-7 h-7 rounded-xl bg-[#FFF0EB] flex items-center justify-center text-[#FF5722] hover:bg-[#FFE0D5] cursor-pointer border-none"
            >
              <Plus size={13} />
            </button>
          </div>

          {/* Add to Cart Button */}
          <button
            onClick={handleAdd}
            className="btn-primary flex-1 py-3 text-sm font-bold flex items-center justify-center gap-2"
          >
            <ShoppingBag size={17} />
            <span>Add to Cart • ₹{food.price * qty}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
