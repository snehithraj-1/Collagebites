import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CAMPUS_LOCATIONS, PROMO_COUPONS, INITIAL_PAST_ORDERS, STUDENT_PROFILE } from '../data/campusFoodData';

const CartContext = createContext();

export function CartProvider({ children }) {
  // Cart state
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('cb_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Selected delivery location
  const [selectedLocation, setSelectedLocation] = useState(() => {
    return CAMPUS_LOCATIONS[1]; // Default to Block B
  });

  // Applied Coupon
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  // Cart Drawer open/close state
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Detail Modal open item
  const [selectedFoodItem, setSelectedFoodItem] = useState(null);

  // Active Ongoing Order for Live Tracking
  const [activeOrder, setActiveOrder] = useState(() => {
    try {
      const saved = localStorage.getItem('cb_active_order');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Past Orders
  const [pastOrders, setPastOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('cb_past_orders');
      return saved ? JSON.parse(saved) : INITIAL_PAST_ORDERS;
    } catch {
      return INITIAL_PAST_ORDERS;
    }
  });

  // Toast message
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Sync cart to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('cb_cart', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  // Sync active order to LocalStorage
  useEffect(() => {
    try {
      if (activeOrder) {
        localStorage.setItem('cb_active_order', JSON.stringify(activeOrder));
      } else {
        localStorage.removeItem('cb_active_order');
      }
    } catch (e) {
      console.error(e);
    }
  }, [activeOrder]);

  // Add Item to Cart
  const addToCart = (item, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, qty: i.qty + quantity } : i
        );
      }
      return [
        ...prev,
        {
          id: item.id,
          name: item.name,
          price: item.price,
          qty: quantity,
          vendorId: item.vendorId,
          vendorName: item.vendorName,
          isVeg: item.isVeg,
          image: item.image
        }
      ];
    });
    showToast(`Added "${item.name}" to cart! 🍔`);
  };

  // Update Quantity
  const updateQuantity = (itemId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, qty: newQty } : i))
    );
  };

  // Remove Item
  const removeFromCart = (itemId) => {
    setCart((prev) => prev.filter((i) => i.id !== itemId));
    showToast('Item removed from cart', 'info');
  };

  // Clear Cart
  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  // Apply Coupon
  const applyCoupon = (code) => {
    setCouponError('');
    const clean = code.trim().toUpperCase();
    const found = PROMO_COUPONS.find((c) => c.code === clean);

    if (!found) {
      setCouponError('Invalid promo code. Try "CAMPUS50"!');
      return false;
    }

    const subtotal = cart.reduce((acc, i) => acc + i.price * i.qty, 0);
    if (found.minOrder && subtotal < found.minOrder) {
      setCouponError(`Min order of ₹${found.minOrder} required for ${found.code}`);
      return false;
    }

    setAppliedCoupon(found);
    showToast(`Coupon ${found.code} applied! 🎉`);
    return true;
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponError('');
  };

  // Pricing calculations
  const cartSubtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const totalCartCount = cart.reduce((acc, item) => acc + item.qty, 0);
  const deliveryFee = 0; // Campus delivery is free!
  const platformFee = cartSubtotal > 0 ? 5 : 0; // ₹5 packaging & platform fee

  let discountAmount = 0;
  if (appliedCoupon && cartSubtotal > 0) {
    if (appliedCoupon.discountPercent) {
      const rawDisc = (cartSubtotal * appliedCoupon.discountPercent) / 100;
      discountAmount = appliedCoupon.maxDiscount
        ? Math.min(rawDisc, appliedCoupon.maxDiscount)
        : rawDisc;
    } else if (appliedCoupon.discountFlat) {
      discountAmount = appliedCoupon.discountFlat;
    }
  }

  const finalTotal = Math.max(0, cartSubtotal - discountAmount + deliveryFee + platformFee);

  // Place Order Simulation
  const placeOrder = (details = {}) => {
    const orderId = `CB-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder = {
      id: orderId,
      createdAt: new Date().toISOString(),
      dateFormatted: "Just Now",
      items: [...cart],
      subtotal: cartSubtotal,
      discount: discountAmount,
      deliveryFee: deliveryFee,
      platformFee: platformFee,
      total: finalTotal,
      deliveredTo: `${details.block || selectedLocation.name}, ${details.room || 'Room 412'}`,
      studentName: details.name || STUDENT_PROFILE.name,
      studentPhone: details.phone || STUDENT_PROFILE.phone,
      paymentMethod: details.paymentMethod || 'Cash on Delivery / UPI',
      notes: details.notes || '',
      currentStage: 1, // 1: Placed, 2: Confirmed, 3: Preparing, 4: Out for Delivery, 5: Delivered
      estimatedMinutes: 20
    };

    setActiveOrder(newOrder);
    setPastOrders((prev) => [newOrder, ...prev]);
    clearCart();
    setIsCartOpen(false);

    // Confetti celebration
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });

    showToast(`Order #${orderId} placed successfully! 🎉`);
  };

  // Re-order past order
  const reorder = (pastOrder) => {
    pastOrder.items.forEach((item) => {
      addToCart(item, item.qty || 1);
    });
    setIsCartOpen(true);
    showToast('Items added to cart from past order! ⚡');
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartSubtotal,
        totalCartCount,
        deliveryFee,
        platformFee,
        discountAmount,
        finalTotal,
        appliedCoupon,
        couponError,
        applyCoupon,
        removeCoupon,
        selectedLocation,
        setSelectedLocation,
        isCartOpen,
        setIsCartOpen,
        selectedFoodItem,
        setSelectedFoodItem,
        activeOrder,
        setActiveOrder,
        placeOrder,
        pastOrders,
        reorder,
        toast,
        showToast
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
