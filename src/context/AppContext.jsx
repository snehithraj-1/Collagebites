import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { RESTAURANTS, INITIAL_ORDERS } from '../data/campusData';
import {
  createOrder as apiCreateOrder,
  getOrder as apiGetOrder,
  confirmOrder as apiConfirmOrder,
  cancelOrder as apiCancelOrder,
  updateOrderStatus as apiUpdateOrderStatus,
  deleteOrder as apiDeleteOrder,
  getAllOrders as apiGetAllOrders,
  getSystemStatus as apiGetSystemStatus,
  updateSystemSettings as apiUpdateSystemSettings,
  updateRestaurantStatus as apiUpdateRestaurantStatus
} from '../lib/api';

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
  const [overallOrderingEnabled, setOverallOrderingEnabled] = useState(true);
  const [restaurantStatuses, setRestaurantStatuses] = useState({
    'local-home-kitchen': 'OPEN',
    'campus-delight-dhaba': 'OPEN'
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
  const [orders, setOrders] = useState(INITIAL_ORDERS);

  // 5. 30-Second Confirmation Flow State
  const [pendingOrder, setPendingOrder] = useState(null);
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
  const [confirmedOrderResult, setConfirmedOrderResult] = useState(null);

  // 6. Toast Notification
  const [toast, setToast] = useState(null);

  // 7. Neon Cloud Status State
  const [isNeonConnected, setIsNeonConnected] = useState(true);

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
      localStorage.setItem('cb_campus_cart', JSON.stringify(cart));
    } catch (e) { console.error(e); }
  }, [cart]);

  // Load latest cloud data from backend API
  const refreshCloudData = useCallback(async () => {
    try {
      // 1. Fetch system status
      const statusData = await apiGetSystemStatus();
      if (statusData && statusData.success) {
        setOverallOrderingEnabled(statusData.overallOrdering !== false);
        if (statusData.restaurantStatuses) {
          setRestaurantStatuses(statusData.restaurantStatuses);
        }
        setIsNeonConnected(true);
      }

      // 2. Fetch all orders
      const ordersData = await apiGetAllOrders();
      if (ordersData && Array.isArray(ordersData)) {
        setOrders(ordersData);
      }
    } catch (err) {
      console.warn('[API Data Sync] Error loading backend data:', err.message);
    }
  }, []);

  // On initial mount: sync data, poll updates every 4s, and check for active pending confirmation
  useEffect(() => {
    refreshCloudData();

    // Live background polling to automatically synchronize order status changes (every 4 seconds)
    const interval = setInterval(() => {
      refreshCloudData();
    }, 4000);

    // Check if there is an active pending order in local storage (Page refresh recovery)
    const savedPendingOrderId = localStorage.getItem('cb_pending_order_id');
    if (savedPendingOrderId) {
      apiGetOrder(savedPendingOrderId)
        .then((order) => {
          if (order && order.status === 'PENDING_CONFIRMATION' && order.confirmationExpiresAt) {
            const expiryTime = new Date(order.confirmationExpiresAt).getTime();
            if (Date.now() < expiryTime) {
              setPendingOrder(order);
              setIsConfirmationModalOpen(true);
            } else {
              localStorage.removeItem('cb_pending_order_id');
            }
          } else {
            localStorage.removeItem('cb_pending_order_id');
          }
        })
        .catch(() => {
          localStorage.removeItem('cb_pending_order_id');
        });
    }

    return () => clearInterval(interval);
  }, [refreshCloudData]);

  // Auth Functions
  const loginStudent = (profileData) => {
    setStudentProfile(profileData);
    setUserRole('student');
    showToast(`Welcome, ${profileData.name}! 👋`, 'success');
  };

  const loginAdmin = (password) => {
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
  const toggleOverallOrdering = async (enabled) => {
    setOverallOrderingEnabled(enabled);
    try {
      await apiUpdateSystemSettings({ overallOrdering: enabled });
      showToast(
        enabled ? 'Master Ordering is now ACTIVE' : 'Master Ordering has been PAUSED',
        enabled ? 'success' : 'info'
      );
    } catch (err) {
      showToast('Failed to update master setting on server', 'error');
    }
  };

  const toggleRestaurantStatus = async (restaurantId) => {
    const current = restaurantStatuses[restaurantId] || 'OPEN';
    const next = current === 'OPEN' ? 'CLOSED' : 'OPEN';
    setRestaurantStatuses((prev) => ({ ...prev, [restaurantId]: next }));

    try {
      await apiUpdateRestaurantStatus(restaurantId, next);
      const restObj = RESTAURANTS.find((r) => r.id === restaurantId);
      const restName = restObj ? restObj.name : restaurantId;
      showToast(`${restName} is now ${next}`, next === 'OPEN' ? 'success' : 'info');
    } catch (err) {
      showToast('Failed to update restaurant status on server', 'error');
    }
  };

  // Cart Functions
  const addToCart = (item, quantity = 1) => {
    if (!overallOrderingEnabled) {
      showToast('Ordering is currently unavailable campus-wide.', 'error');
      return false;
    }

    const status = restaurantStatuses[item.restaurantId] || 'OPEN';
    if (status === 'CLOSED') {
      showToast('This restaurant is currently CLOSED for ordering.', 'error');
      return false;
    }

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

  // Phase 3: Start Order Confirmation Flow
  // Creates order on backend with PENDING_CONFIRMATION and confirmation_expires_at = NOW() + 30s
  const startOrderConfirmation = async (deliveryDetails) => {
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

    try {
      const createdOrder = await apiCreateOrder({
        studentName: studentProfile?.name || deliveryDetails.name || 'Campus Student',
        studentPhone: studentProfile?.phone || deliveryDetails.phone || '9989955833',
        studentId: studentProfile?.studentId || deliveryDetails.studentId || null,
        restaurantId: firstItem.restaurantId,
        restaurantName: firstItem.restaurantName,
        deliveryLocation: `${deliveryDetails.hostel || 'Hostel Block B'}, ${deliveryDetails.roomNumber || 'Room 412'}`,
        instructions: deliveryDetails.instructions || '',
        items: cart.map(i => ({
          id: i.id,
          name: i.name,
          qty: i.qty,
          price: i.price
        }))
      });

      // Save pending order ID in localStorage for page refresh recovery
      localStorage.setItem('cb_pending_order_id', createdOrder.id);
      setPendingOrder(createdOrder);
      setIsConfirmationModalOpen(true);
      setIsCartOpen(false);
    } catch (err) {
      showToast(`Error creating order: ${err.message}`, 'error');
    }
  };

  // Phase 4: Confirm Order within 30 seconds
  const confirmOrder = async () => {
    if (!pendingOrder) return null;

    try {
      const confirmed = await apiConfirmOrder(pendingOrder.id);
      localStorage.removeItem('cb_pending_order_id');
      setConfirmedOrderResult(confirmed);
      setOrders((prev) => [confirmed, ...prev.filter(o => o.id !== confirmed.id)]);
      setPendingOrder(null);
      clearCart();

      // Confetti celebration
      confetti({
        particleCount: 140,
        spread: 80,
        origin: { y: 0.6 }
      });

      showToast(`Order #${confirmed.id} Confirmed! 🎉`, 'success');
      return confirmed;
    } catch (err) {
      showToast(err.message || 'Confirmation failed or expired', 'error');
      if (err.order) {
        setPendingOrder(err.order);
      }
      return null;
    }
  };

  // Phase 4: Cancel Order (User clicked cancel or 30s timed out)
  const cancelPendingOrder = async (isTimeout = false) => {
    if (!pendingOrder) return;

    try {
      const reason = isTimeout ? '30-Second Timeout Expired' : 'Cancelled by Student';
      const cancelled = await apiCancelOrder(pendingOrder.id, reason);
      localStorage.removeItem('cb_pending_order_id');
      setOrders((prev) => [cancelled, ...prev.filter(o => o.id !== cancelled.id)]);
      setPendingOrder(null);
      setIsConfirmationModalOpen(false);

      showToast(
        isTimeout
          ? '30-second window expired. Order was automatically cancelled.'
          : 'Order was cancelled.',
        'info'
      );
    } catch (err) {
      localStorage.removeItem('cb_pending_order_id');
      setPendingOrder(null);
      setIsConfirmationModalOpen(false);
    }
  };

  // Phase 5: Admin Order Actions
  const advanceOrderStatus = async (orderId, nextStatus) => {
    try {
      const updated = await apiUpdateOrderStatus(orderId, nextStatus);
      setOrders((prev) => prev.map(o => o.id === orderId ? updated : o));
      showToast(`Order #${orderId} moved to ${nextStatus}`, 'success');
      return updated;
    } catch (err) {
      showToast(err.message || 'Status transition error', 'error');
      return null;
    }
  };

  const cancelOrderByAdmin = async (orderId) => {
    try {
      const cancelled = await apiCancelOrder(orderId, 'Cancelled by Administrator');
      setOrders((prev) => prev.map(o => o.id === orderId ? cancelled : o));
      showToast(`Order #${orderId} marked as Cancelled`, 'info');
    } catch (err) {
      showToast(err.message || 'Failed to cancel order', 'error');
    }
  };

  const deleteOrderByAdmin = async (orderId) => {
    try {
      await apiDeleteOrder(orderId);
      setOrders((prev) => prev.filter(o => o.id !== orderId));
      showToast(`Order #${orderId} deleted permanently`, 'info');
    } catch (err) {
      showToast(err.message || 'Failed to delete order', 'error');
    }
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

        // Orders & Real 30s Confirmation Flow
        orders,
        pendingOrder,
        isConfirmationModalOpen,
        setIsConfirmationModalOpen,
        confirmedOrderResult,
        setConfirmedOrderResult,
        startOrderConfirmation,
        confirmOrder,
        cancelPendingOrder,
        advanceOrderStatus,
        cancelOrderByAdmin,
        deleteOrderByAdmin,
        refreshCloudData,

        // Notifications
        toast,
        showToast,

        // Neon Status
        isNeonConnected
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
