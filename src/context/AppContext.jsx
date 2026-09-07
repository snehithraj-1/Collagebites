import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { RESTAURANTS, INITIAL_ORDERS, CAMPUS_LOCATIONS } from '../data/campusData';

const AppContext = createContext();

export function AppProvider({ children }) {
  // 1. Authentication State
  const [userRole, setUserRole] = useState(() => {
    try {
      return localStorage.getItem('cb_active_role') || null; // 'student' | 'admin' | null
    } catch {
      return null;
    }
  });

  const [studentProfile, setStudentProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('cb_student_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    try {
      return localStorage.getItem('cb_admin_auth') === 'true';
    } catch {
      return false;
    }
  });

  // 2. System Settings (Admin Controlled)
  const [overallOrderingEnabled, setOverallOrderingEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem('cb_overall_ordering');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const [restaurantStatuses, setRestaurantStatuses] = useState(() => {
    try {
      const saved = localStorage.getItem('cb_restaurant_statuses');
      return saved ? JSON.parse(saved) : {
        'local-home-kitchen': 'OPEN',
        'campus-delight-dhaba': 'OPEN'
      };
    } catch {
      return {
        'local-home-kitchen': 'OPEN',
        'campus-delight-dhaba': 'OPEN'
      };
    }
  });

  // 3. Cart State
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('cb_campus_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  // 4. Orders State
  const [orders, setOrders] = useState(() => {
    try {
      const saved = localStorage.getItem('cb_all_orders');
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  // 5. 30-Second Confirmation Flow State
  const [pendingOrder, setPendingOrder] = useState(null);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [confirmedOrderResult, setConfirmedOrderResult] = useState(null);

  // 6. Toast Notification
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // Sync state to LocalStorage
  useEffect(() => {
    try {
      if (userRole) localStorage.setItem('cb_active_role', userRole);
      else localStorage.removeItem('cb_active_role');
    } catch (e) { console.error(e); }
  }, [userRole]);

  useEffect(() => {
    try {
      if (studentProfile) localStorage.setItem('cb_student_profile', JSON.stringify(studentProfile));
      else localStorage.removeItem('cb_student_profile');
    } catch (e) { console.error(e); }
  }, [studentProfile]);

  useEffect(() => {
    try {
      localStorage.setItem('cb_admin_auth', isAdminAuthenticated ? 'true' : 'false');
    } catch (e) { console.error(e); }
  }, [isAdminAuthenticated]);

  useEffect(() => {
    try {
      localStorage.setItem('cb_overall_ordering', overallOrderingEnabled ? 'true' : 'false');
    } catch (e) { console.error(e); }
  }, [overallOrderingEnabled]);

  useEffect(() => {
    try {
      localStorage.setItem('cb_restaurant_statuses', JSON.stringify(restaurantStatuses));
    } catch (e) { console.error(e); }
  }, [restaurantStatuses]);

  useEffect(() => {
    try {
      localStorage.setItem('cb_campus_cart', JSON.stringify(cart));
    } catch (e) { console.error(e); }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('cb_all_orders', JSON.stringify(orders));
    } catch (e) { console.error(e); }
  }, [orders]);

  // Synchronize across open browser tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'cb_overall_ordering') {
        setOverallOrderingEnabled(e.newValue === 'true');
      }
      if (e.key === 'cb_restaurant_statuses' && e.newValue) {
        setRestaurantStatuses(JSON.parse(e.newValue));
      }
      if (e.key === 'cb_all_orders' && e.newValue) {
        setOrders(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Auth Functions
  const loginStudent = (profileData) => {
    setStudentProfile(profileData);
    setUserRole('student');
    showToast(`Welcome back, ${profileData.name}! 👋`, 'success');
  };

  const loginAdmin = (password) => {
    // Standard secure demo admin password check
    if (password === 'admin123' || password === 'clgbites@admin2024' || password === 'admin') {
      setIsAdminAuthenticated(true);
      setUserRole('admin');
      showToast('Admin access authorized 🛡️', 'success');
      return true;
    } else {
      showToast('Incorrect administrator password', 'error');
      return false;
    }
  };

  const logout = () => {
    setUserRole(null);
    setIsAdminAuthenticated(false);
    showToast('Signed out successfully', 'info');
  };

  const switchRole = (newRole) => {
    if (newRole === 'admin') {
      if (isAdminAuthenticated) {
        setUserRole('admin');
      } else {
        setUserRole('admin_login');
      }
    } else {
      setUserRole('student');
    }
  };

  // Admin Controls
  const toggleOverallOrdering = (enabled) => {
    setOverallOrderingEnabled(enabled);
    showToast(
      enabled ? 'Master Ordering is now ACTIVE' : 'Master Ordering has been PAUSED',
      enabled ? 'success' : 'info'
    );
  };

  const toggleRestaurantStatus = (restaurantId) => {
    setRestaurantStatuses((prev) => {
      const current = prev[restaurantId] || 'OPEN';
      const next = current === 'OPEN' ? 'CLOSED' : 'OPEN';
      const restObj = RESTAURANTS.find((r) => r.id === restaurantId);
      const restName = restObj ? restObj.name : restaurantId;
      showToast(`${restName} is now ${next}`, next === 'OPEN' ? 'success' : 'info');
      return { ...prev, [restaurantId]: next };
    });
  };

  // Cart Functions
  const addToCart = (item, quantity = 1) => {
    // Check if overall ordering is active
    if (!overallOrderingEnabled) {
      showToast('Ordering is currently unavailable campus-wide.', 'error');
      return false;
    }

    // Check if restaurant is open
    const status = restaurantStatuses[item.restaurantId] || 'OPEN';
    if (status === 'CLOSED') {
      showToast('This restaurant is currently CLOSED for ordering.', 'error');
      return false;
    }

    // Check if cart has items from another restaurant
    if (cart.length > 0 && cart[0].restaurantId !== item.restaurantId) {
      const existingRestName = cart[0].restaurantName || 'another restaurant';
      const confirmReset = window.confirm(
        `Your cart contains items from ${existingRestName}. Would you like to clear your cart and start an order from ${item.restaurantName}?`
      );
      if (confirmReset) {
        setCart([{ ...item, qty: quantity }]);
        showToast(`Added ${item.name} to cart! 🍔`);
        return true;
      }
      return false;
    }

    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, qty: i.qty + quantity } : i
        );
      }
      return [...prev, { ...item, qty: quantity }];
    });

    showToast(`Added ${item.name} to cart! 🍔`);
    return true;
  };

  const updateQuantity = (itemId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, qty: newQty } : i))
    );
  };

  const removeFromCart = (itemId) => {
    setCart((prev) => prev.filter((i) => i.id !== itemId));
    showToast('Item removed from cart', 'info');
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartSubtotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const cartCount = cart.reduce((acc, item) => acc + item.qty, 0);
  const platformFee = cartSubtotal > 0 ? 5 : 0;
  const deliveryFee = 0; // Free campus delivery
  const cartTotal = cartSubtotal + platformFee + deliveryFee;

  // 30-Second Order Confirmation Flow
  const startOrderConfirmation = (deliveryDetails) => {
    if (cart.length === 0) {
      showToast('Your cart is empty', 'error');
      return;
    }

    if (!overallOrderingEnabled) {
      showToast('Ordering is currently unavailable.', 'error');
      return;
    }

    const firstItem = cart[0];
    const restStatus = restaurantStatuses[firstItem.restaurantId] || 'OPEN';
    if (restStatus === 'CLOSED') {
      showToast(`${firstItem.restaurantName} is currently closed.`, 'error');
      return;
    }

    const orderPrep = {
      tempId: `TMP-${Date.now()}`,
      createdAt: new Date().toISOString(),
      studentName: studentProfile?.name || deliveryDetails.name || 'Campus Student',
      studentId: studentProfile?.studentId || deliveryDetails.studentId || 'AP22110010482',
      studentPhone: studentProfile?.phone || deliveryDetails.phone || '9989955833',
      restaurantId: firstItem.restaurantId,
      restaurantName: firstItem.restaurantName,
      items: [...cart],
      totalAmount: cartTotal,
      deliveryLocation: `${deliveryDetails.hostel || 'Hostel Block B'}, ${deliveryDetails.roomNumber || 'Room 412'}`,
      instructions: deliveryDetails.instructions || '',
      status: 'PENDING'
    };

    setPendingOrder(orderPrep);
    setIsConfirmationModalOpen(true);
    setIsCartOpen(false);
  };

  // Confirm Order within 30 seconds
  const confirmOrder = () => {
    if (!pendingOrder) return null;

    // Prevent duplicate orders
    const prefix = pendingOrder.restaurantId === 'local-home-kitchen' ? 'LHK' : 'ORD';
    const finalOrderId = `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;

    const finalizedOrder = {
      ...pendingOrder,
      id: finalOrderId,
      status: 'CONFIRMED',
      confirmedAt: new Date().toISOString(),
      orderTimeFormatted: 'Just now'
    };

    setOrders((prev) => [finalizedOrder, ...prev]);
    setConfirmedOrderResult(finalizedOrder);
    setPendingOrder(null);
    clearCart();

    // Confetti celebration
    confetti({
      particleCount: 140,
      spread: 80,
      origin: { y: 0.6 }
    });

    showToast(`Order #${finalOrderId} Confirmed! 🎉`, 'success');
    return finalizedOrder;
  };

  // Cancel Order (User clicked cancel or 30s timed out)
  const cancelPendingOrder = (isTimeout = false) => {
    if (!pendingOrder) return;

    const prefix = pendingOrder.restaurantId === 'local-home-kitchen' ? 'LHK' : 'ORD';
    const cancelledOrderId = `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`;

    const cancelledOrder = {
      ...pendingOrder,
      id: cancelledOrderId,
      status: 'CANCELLED',
      cancelledAt: new Date().toISOString(),
      cancelledReason: isTimeout ? '30-Second Timeout Expired' : 'Cancelled by Student',
      orderTimeFormatted: 'Just now'
    };

    setOrders((prev) => [cancelledOrder, ...prev]);
    setPendingOrder(null);
    setIsConfirmationModalOpen(false);

    showToast(
      isTimeout
        ? '30-second window expired. Order was automatically cancelled.'
        : 'Order was cancelled.',
      'info'
    );
  };

  // Admin Order Actions
  const cancelOrderByAdmin = (orderId) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, status: 'CANCELLED', cancelledReason: 'Cancelled by Administrator' } : o
      )
    );
    showToast(`Order #${orderId} marked as Cancelled`, 'info');
  };

  const deleteOrderByAdmin = (orderId) => {
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    showToast(`Order #${orderId} deleted permanently`, 'info');
  };

  return (
    <AppContext.Provider
      value={{
        // Auth
        userRole,
        setUserRole,
        studentProfile,
        loginStudent,
        isAdminAuthenticated,
        loginAdmin,
        logout,
        switchRole,

        // System Settings
        overallOrderingEnabled,
        toggleOverallOrdering,
        restaurantStatuses,
        toggleRestaurantStatus,

        // Cart
        cart,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartSubtotal,
        cartCount,
        platformFee,
        deliveryFee,
        cartTotal,

        // Orders
        orders,
        pendingOrder,
        isConfirmationModalOpen,
        setIsConfirmationModalOpen,
        confirmedOrderResult,
        setConfirmedOrderResult,
        startOrderConfirmation,
        confirmOrder,
        cancelPendingOrder,
        cancelOrderByAdmin,
        deleteOrderByAdmin,

        // Notifications
        toast,
        showToast
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
