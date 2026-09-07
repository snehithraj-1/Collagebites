import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ShoppingBag, 
  MapPin, 
  AlertTriangle, 
  Sparkles, 
  Phone, 
  User, 
  ShieldCheck,
  Building
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CAMPUS_LOCATIONS } from '../data/campusData';

export default function CartDrawer() {
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartSubtotal,
    platformFee,
    deliveryFee,
    cartTotal,
    startOrderConfirmation,
    overallOrderingEnabled,
    restaurantStatuses,
    studentProfile
  } = useApp();

  const [selectedHostel, setSelectedHostel] = useState(
    studentProfile?.hostel || 'Hostel Block B (Boys)'
  );
  const [roomNumber, setRoomNumber] = useState(
    studentProfile?.roomNumber || 'Room 412'
  );
  const [contactPhone, setContactPhone] = useState(
    studentProfile?.phone || '9989955833'
  );
  const [specialInstructions, setSpecialInstructions] = useState('');

  if (!isCartOpen) return null;

  // Check restaurant status of current cart items
  const currentRestaurantId = cart[0]?.restaurantId;
  const currentRestaurantName = cart[0]?.restaurantName || 'Restaurant';
  const isRestaurantOpen = currentRestaurantId 
    ? (restaurantStatuses[currentRestaurantId] || 'OPEN') === 'OPEN' 
    : true;

  const canPlaceOrder = overallOrderingEnabled && isRestaurantOpen && cart.length > 0;

  const handleCheckoutClick = () => {
    if (!canPlaceOrder) return;

    startOrderConfirmation({
      hostel: selectedHostel,
      roomNumber: roomNumber,
      phone: contactPhone,
      instructions: specialInstructions,
      name: studentProfile?.name,
      studentId: studentProfile?.studentId
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={() => setIsCartOpen(false)} />

      {/* Slide-over Drawer Panel */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-slide-up sm:animate-slide-left">
        
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-[#F1EAE4] flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FFF0EB] flex items-center justify-center text-[#FF5722]">
              <ShoppingBag size={18} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-[#0F172A] font-['Outfit']">Your Campus Cart</h2>
              <p className="text-xs text-[#64748B]">
                {cart.length > 0 ? `${cart.reduce((a, b) => a + b.qty, 0)} items from ${currentRestaurantName}` : 'No items yet'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="w-8 h-8 rounded-full bg-white border border-[#E2D9D0] flex items-center justify-center text-[#64748B] hover:text-[#0F172A] hover:bg-[#F4EFEA] transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Master Ordering Warning if Disabled */}
        {!overallOrderingEnabled && (
          <div className="px-5 py-3 bg-amber-500/10 border-b border-amber-500/30 flex items-center gap-2 text-xs font-bold text-amber-900">
            <AlertTriangle size={15} className="text-amber-600 flex-shrink-0" />
            <span>Ordering is currently unavailable campus-wide.</span>
          </div>
        )}

        {/* Restaurant Closed Warning if Specific Restaurant is Closed */}
        {overallOrderingEnabled && !isRestaurantOpen && cart.length > 0 && (
          <div className="px-5 py-3 bg-rose-50 border-b border-rose-200 flex items-center gap-2 text-xs font-bold text-rose-800">
            <AlertTriangle size={15} className="text-rose-600 flex-shrink-0" />
            <span>{currentRestaurantName} is currently CLOSED by admin.</span>
          </div>
        )}

        {/* Cart Items List or Empty State */}
        <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-[#F1EAE4]">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-20 h-20 rounded-3xl bg-[#FAF8F5] border border-[#F1EAE4] flex items-center justify-center text-4xl mb-4 shadow-sm">
                🍽️
              </div>
              <h3 className="font-extrabold text-lg text-[#0F172A] mb-1 font-['Outfit']">Your Cart is Empty</h3>
              <p className="text-xs text-[#64748B] max-w-xs mb-6">
                Explore Local Home Kitchen for authentic Biryanis, Fried Rice, and Starters!
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="btn-primary py-2.5 px-5 text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer shadow-md"
              >
                <span>Browse Restaurant Menu</span>
                <ArrowRight size={15} />
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Clear cart quick action */}
              <div className="flex items-center justify-between pb-2 text-xs text-[#64748B]">
                <span className="font-bold text-[#0F172A]">Kitchen: {currentRestaurantName}</span>
                <button
                  onClick={clearCart}
                  className="text-rose-500 hover:text-rose-700 flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <Trash2 size={13} />
                  <span>Clear Cart</span>
                </button>
              </div>

              {cart.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between gap-3 border-b border-[#F1EAE4]">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${item.isVeg ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      <h4 className="font-extrabold text-sm text-[#0F172A] truncate font-['Outfit']">
                        {item.name}
                      </h4>
                    </div>
                    <div className="text-xs text-[#64748B] mt-0.5">
                      ₹{item.price} {item.portion ? `• ${item.portion}` : ''}
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-2 bg-[#FAF8F5] border border-[#E2D9D0] rounded-xl px-2 py-1">
                    <button
                      onClick={() => updateQuantity(item.id, item.qty - 1)}
                      className="w-6 h-6 rounded-lg bg-white border border-[#E2D9D0] flex items-center justify-center text-[#64748B] hover:text-[#0F172A] cursor-pointer"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="text-xs font-extrabold text-[#0F172A] w-5 text-center font-mono">
                      {item.qty}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.qty + 1)}
                      className="w-6 h-6 rounded-lg bg-[#FF5722] text-white flex items-center justify-center cursor-pointer shadow-xs"
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  {/* Total item price */}
                  <div className="text-xs font-black text-[#0F172A] font-mono w-14 text-right">
                    ₹{item.price * item.qty}
                  </div>
                </div>
              ))}

              {/* Delivery Details Form */}
              <div className="pt-4 space-y-3 bg-[#FAF8F5] p-4 rounded-2xl border border-[#F1EAE4]">
                <h4 className="text-xs font-black text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin size={13} className="text-[#FF5722]" />
                  <span>Campus Delivery Details</span>
                </h4>

                <div>
                  <label className="block text-[11px] font-bold text-[#64748B] mb-1">Hostel Block</label>
                  <select
                    value={selectedHostel}
                    onChange={(e) => setSelectedHostel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#E2D9D0] bg-white text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#FF5722]"
                  >
                    {CAMPUS_LOCATIONS.map((loc) => (
                      <option key={loc.id} value={loc.name}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-bold text-[#64748B] mb-1">Room / Floor</label>
                    <input
                      type="text"
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                      placeholder="Room 412"
                      className="w-full px-3 py-2 rounded-xl border border-[#E2D9D0] bg-white text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#FF5722]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#64748B] mb-1">Contact Phone</label>
                    <input
                      type="text"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="9989955833"
                      className="w-full px-3 py-2 rounded-xl border border-[#E2D9D0] bg-white text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#FF5722]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#64748B] mb-1">Cooking / Delivery Note (Optional)</label>
                  <input
                    type="text"
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="e.g. Extra raita, mild spicy, call upon arrival"
                    className="w-full px-3 py-2 rounded-xl border border-[#E2D9D0] bg-white text-xs text-[#0F172A] focus:outline-none focus:border-[#FF5722]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Checkout Summary */}
        {cart.length > 0 && (
          <div className="p-6 border-t border-[#F1EAE4] bg-[#FAF8F5] space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-[#64748B]">
                <span>Item Subtotal</span>
                <span className="font-bold text-[#0F172A]">₹{cartSubtotal}</span>
              </div>
              <div className="flex justify-between text-[#64748B]">
                <span>Campus Delivery Fee</span>
                <span className="font-bold text-emerald-600">FREE</span>
              </div>
              <div className="flex justify-between text-[#64748B]">
                <span>Platform & Packaging Fee</span>
                <span className="font-bold text-[#0F172A]">₹{platformFee}</span>
              </div>
              <div className="pt-2 border-t border-[#E2D9D0] flex justify-between items-center text-base">
                <span className="font-extrabold text-[#0F172A] font-['Outfit']">Total Payable</span>
                <span className="font-black text-xl text-[#FF5722] font-mono">₹{cartTotal}</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              onClick={handleCheckoutClick}
              disabled={!canPlaceOrder}
              className={`w-full py-3.5 px-6 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer ${
                canPlaceOrder 
                  ? 'bg-gradient-to-r from-[#FF5722] to-[#FF7A50] text-white hover:brightness-105 shadow-[#FF5722]/30 active:scale-[0.99]'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
              }`}
            >
              <span>{canPlaceOrder ? 'Proceed to 30s Confirmation' : 'Ordering Unavailable'}</span>
              <ArrowRight size={16} />
            </button>

            <p className="text-center text-[11px] text-[#94A3B8]">
              You will have 30 seconds to review and confirm your order.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
