import React from 'react';
import { Star, Clock, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function FoodCard({ food, onOpenDetails }) {
  const { cart, addToCart, updateQuantity } = useCart();
  const cartItem = cart.find((i) => i.id === food.id);
  const qtyInCart = cartItem ? cartItem.qty : 0;

  return (
    <div className="card-base flex flex-col h-full group">
      {/* Image Container with Badges */}
      <div
        onClick={() => onOpenDetails(food)}
        className="relative w-full h-44 sm:h-48 overflow-hidden cursor-pointer bg-[#F1EAE4]"
      >
        <img
          src={food.image}
          alt={food.name}
          className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

        {/* Top Dietary Badge */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/95 backdrop-blur-md shadow-sm">
          <div className={food.isVeg ? 'veg-badge' : 'nonveg-badge'} />
          <span className="text-[10px] font-bold text-[#334155] uppercase tracking-wider">
            {food.isVeg ? 'Veg' : 'Non-Veg'}
          </span>
        </div>

        {/* Bestseller Badge */}
        {food.isBestseller && (
          <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-[#FF5722] text-white text-[10px] font-extrabold tracking-wider uppercase shadow-md shadow-[#FF5722]/40">
            ★ Bestseller
          </div>
        )}

        {/* Prep Time pill */}
        <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 px-2 py-1 rounded-md bg-black/60 backdrop-blur-md text-white text-[11px] font-medium">
          <Clock size={12} className="text-[#F59E0B]" />
          <span>{food.prepTime}</span>
        </div>

        {/* Rating pill */}
        <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1 px-2 py-1 rounded-md bg-white/95 backdrop-blur-md text-[#0F172A] text-xs font-bold shadow-sm">
          <Star size={12} className="fill-[#F59E0B] text-[#F59E0B]" />
          <span>{food.rating}</span>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-4 flex flex-col flex-1">
        {/* Vendor tag */}
        <p className="text-[11px] font-semibold text-[#FF5722] uppercase tracking-wider mb-1">
          {food.vendorName}
        </p>

        {/* Title */}
        <h3
          onClick={() => onOpenDetails(food)}
          className="font-bold text-base text-[#0F172A] hover:text-[#FF5722] transition-colors cursor-pointer line-clamp-1 mb-1"
        >
          {food.name}
        </h3>

        {/* Short Description */}
        <p className="text-xs text-[#64748B] line-clamp-2 mb-3 leading-relaxed flex-1">
          {food.description}
        </p>

        {/* Bottom Bar: Price & Add Stepper */}
        <div className="flex items-center justify-between pt-3 border-t border-[#F1EAE4] mt-auto">
          <div>
            <span className="text-xs text-[#94A3B8] font-medium">Price</span>
            <div className="text-lg font-black text-[#0F172A] font-['Outfit']">
              ₹{food.price}
            </div>
          </div>

          {/* Add / Stepper Button */}
          {qtyInCart === 0 ? (
            <button
              onClick={() => addToCart(food, 1)}
              className="btn-add cursor-pointer"
            >
              <Plus size={14} />
              <span>ADD</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-[#FFF0EB] border border-[#FF5722]/30 rounded-xl px-2 py-1 shadow-sm">
              <button
                onClick={() => updateQuantity(food.id, qtyInCart - 1)}
                className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-[#FF5722] hover:bg-[#FF5722] hover:text-white transition-colors cursor-pointer border-none"
              >
                <Minus size={12} />
              </button>
              <span className="font-extrabold text-sm text-[#FF5722] min-w-[16px] text-center font-['Outfit']">
                {qtyInCart}
              </span>
              <button
                onClick={() => updateQuantity(food.id, qtyInCart + 1)}
                className="w-6 h-6 rounded-lg bg-white flex items-center justify-center text-[#FF5722] hover:bg-[#FF5722] hover:text-white transition-colors cursor-pointer border-none"
              >
                <Plus size={12} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
