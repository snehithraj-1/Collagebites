import express from 'express';
import cors from 'cors';
import {
  createOrderInDb,
  getOrderByIdFromDb,
  confirmOrderInDb,
  cancelOrderInDb,
  updateOrderStatusInDb,
  getStudentOrdersFromDb,
  getAllOrdersFromDb,
  deleteOrderFromDb,
  getSystemSettingsFromDb,
  updateSystemSettingInDb,
  getOverallOrderingSettingFromDb,
  setOverallOrderingSettingInDb,
  getRestaurantStatusesFromDb,
  updateRestaurantStatusInDb,
  getAllDeliveryPartnersFromDb,
  getDeliveryPartnerByIdFromDb,
  assignDeliveryPartnerToOrderInDb,
  getOrdersForDeliveryPartnerFromDb,
  updateDeliveryOrderStatusInDb,
  recordDeliveryLocationInDb,
  getLatestDeliveryLocationFromDb
} from './db.js';

const router = express.Router();

// Middlewares
router.use(cors());
router.use(express.json());

// Optional Admin Authentication / Authorization Hook
const adminAuthMiddleware = (req, res, next) => {
  // Can inspect req.headers['authorization'] or admin session token here.
  // Kept permissive for prototype with demo key, structured for production auth.
  next();
};

// ==========================================
// 1. STUDENT ORDER ENDPOINTS
// ==========================================

// POST /api/orders - Create a new order (Phase 3)
router.post('/orders', async (req, res) => {
  try {
    const {
      studentName,
      studentPhone,
      studentId,
      restaurantId,
      restaurantName,
      deliveryLocation,
      instructions,
      items
    } = req.body;

    if (!studentName || !studentPhone || !restaurantId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required order details: studentName, studentPhone, restaurantId, and items are required.'
      });
    }

    const order = await createOrderInDb({
      studentName,
      studentPhone,
      studentId,
      restaurantId,
      restaurantName,
      deliveryLocation,
      instructions,
      items
    });

    return res.status(201).json({
      success: true,
      message: 'Order created in PENDING_CONFIRMATION state with 30-second window.',
      order
    });
  } catch (error) {
    console.error('[API POST /orders] Error:', error);
    const isAvailabilityError = error.message.includes('unavailable') || error.message.includes('closed');
    return res.status(isAvailabilityError ? 403 : 500).json({
      success: false,
      error: error.message || 'Failed to create order.'
    });
  }
});

// GET /api/orders/:id - Get complete order details including order items (Phase 4 & 6)
router.get('/orders/:id', async (req, res) => {
  try {
    const order = await getOrderByIdFromDb(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        error: `Order #${req.params.id} not found.`
      });
    }

    return res.json({
      success: true,
      order
    });
  } catch (error) {
    console.error('[API GET /orders/:id] Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch order details.'
    });
  }
});

// PATCH /api/orders/:id/confirm - Confirm an order within 30s (Phase 4)
router.patch('/orders/:id/confirm', async (req, res) => {
  try {
    const result = await confirmOrderInDb(req.params.id);
    if (result.error) {
      return res.status(result.code || 400).json({
        success: false,
        error: result.error,
        order: result.order
      });
    }

    return res.json({
      success: true,
      message: 'Order confirmed successfully.',
      order: result.order
    });
  } catch (error) {
    console.error('[API PATCH /orders/:id/confirm] Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to confirm order.'
    });
  }
});

// PATCH /api/orders/:id/cancel - Student cancel order (Phase 4)
router.patch('/orders/:id/cancel', async (req, res) => {
  try {
    const reason = req.body.reason || 'Cancelled by Student';
    const result = await cancelOrderInDb(req.params.id, reason);

    if (result.error) {
      return res.status(result.code || 400).json({
        success: false,
        error: result.error,
        order: result.order
      });
    }

    return res.json({
      success: true,
      message: 'Order cancelled.',
      order: result.order
    });
  } catch (error) {
    console.error('[API PATCH /orders/:id/cancel] Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to cancel order.'
    });
  }
});

// GET /api/orders/student/:studentId - Get student's order history
router.get('/orders/student/:studentId', async (req, res) => {
  try {
    const orders = await getStudentOrdersFromDb(req.params.studentId);
    return res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('[API GET /orders/student/:studentId] Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch student orders.'
    });
  }
});

// ==========================================
// 2. REAL ADMIN DASHBOARD & ORDER MANAGEMENT APIS
// ==========================================

// PART 1: GET /api/admin/orders (and alias /api/orders)
const handleGetAdminOrders = async (req, res) => {
  try {
    const orders = await getAllOrdersFromDb();
    return res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('[API GET /admin/orders] Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch admin orders.'
    });
  }
};
router.get('/admin/orders', adminAuthMiddleware, handleGetAdminOrders);
router.get('/orders', handleGetAdminOrders); // Backwards compatibility alias

// PART 2: PATCH /api/admin/orders/:id/status (and alias /api/orders/:id/status)
const handleUpdateOrderStatus = async (req, res) => {
  try {
    const { status, reason } = req.body;
    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status is required.'
      });
    }

    const result = await updateOrderStatusInDb(req.params.id, status, reason);
    if (result.error) {
      return res.status(result.code || 400).json({
        success: false,
        error: result.error,
        order: result.order
      });
    }

    return res.json({
      success: true,
      message: `Order #${req.params.id} updated to ${status}.`,
      order: result.order
    });
  } catch (error) {
    console.error('[API PATCH /admin/orders/:id/status] Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to update order status.'
    });
  }
};
router.patch('/admin/orders/:id/status', adminAuthMiddleware, handleUpdateOrderStatus);
router.patch('/orders/:id/status', handleUpdateOrderStatus);

// PART 3: PATCH /api/admin/orders/:id/cancel
const handleAdminCancelOrder = async (req, res) => {
  try {
    const reason = req.body.reason || 'Cancelled by Administrator';
    const result = await cancelOrderInDb(req.params.id, reason);

    if (result.error) {
      return res.status(result.code || 400).json({
        success: false,
        error: result.error,
        order: result.order
      });
    }

    return res.json({
      success: true,
      message: `Order #${req.params.id} has been cancelled by Administrator.`,
      order: result.order
    });
  } catch (error) {
    console.error('[API PATCH /admin/orders/:id/cancel] Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to cancel order.'
    });
  }
};
router.patch('/admin/orders/:id/cancel', adminAuthMiddleware, handleAdminCancelOrder);

// PART 4: DELETE /api/admin/orders/:id (and alias /api/orders/:id)
const handleDeleteOrder = async (req, res) => {
  try {
    await deleteOrderFromDb(req.params.id);
    return res.json({
      success: true,
      message: `Order #${req.params.id} and associated order items permanently deleted.`
    });
  } catch (error) {
    console.error('[API DELETE /admin/orders/:id] Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete order.'
    });
  }
};
router.delete('/admin/orders/:id', adminAuthMiddleware, handleDeleteOrder);
router.delete('/orders/:id', handleDeleteOrder);

// PART 5: OVERALL ORDERING ON/OFF
// GET /api/admin/settings/ordering
router.get('/admin/settings/ordering', async (req, res) => {
  try {
    const overallOrdering = await getOverallOrderingSettingFromDb();
    return res.json({
      success: true,
      overallOrdering
    });
  } catch (error) {
    console.error('[API GET /admin/settings/ordering] Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch overall ordering setting.'
    });
  }
});

// PATCH /api/admin/settings/ordering
router.patch('/admin/settings/ordering', adminAuthMiddleware, async (req, res) => {
  try {
    const { overallOrdering } = req.body;
    const isEnabled = Boolean(overallOrdering);
    await setOverallOrderingSettingInDb(isEnabled);
    return res.json({
      success: true,
      overallOrdering: isEnabled,
      message: `Master campus ordering is now ${isEnabled ? 'ACTIVE' : 'PAUSED'}.`
    });
  } catch (error) {
    console.error('[API PATCH /admin/settings/ordering] Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to update overall ordering setting.'
    });
  }
});

// PART 6: RESTAURANT OPEN/CLOSED STATUS
// GET /api/admin/restaurants/status
router.get('/admin/restaurants/status', async (req, res) => {
  try {
    const statuses = await getRestaurantStatusesFromDb();
    return res.json({
      success: true,
      restaurantStatuses: statuses
    });
  } catch (error) {
    console.error('[API GET /admin/restaurants/status] Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch restaurant statuses.'
    });
  }
});

// PATCH /api/admin/restaurants/:restaurantId/status
router.patch('/admin/restaurants/:restaurantId/status', adminAuthMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['OPEN', 'CLOSED'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Status must be OPEN or CLOSED.'
      });
    }

    await updateRestaurantStatusInDb(req.params.restaurantId, status);
    return res.json({
      success: true,
      restaurantId: req.params.restaurantId,
      status,
      message: `${req.params.restaurantId} status set to ${status}.`
    });
  } catch (error) {
    console.error('[API PATCH /admin/restaurants/:restaurantId/status] Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to update restaurant status.'
    });
  }
});

// ==========================================
// 3. SYSTEM STATUS & BACKWARDS COMPATIBILITY
// ==========================================

// GET /api/system/status
router.get('/system/status', async (req, res) => {
  try {
    const settings = await getSystemSettingsFromDb();
    const restaurantStatuses = await getRestaurantStatusesFromDb();
    return res.json({
      success: true,
      overallOrdering: settings.overall_ordering !== false,
      restaurantStatuses
    });
  } catch (error) {
    console.error('[API GET /system/status] Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch system status.'
    });
  }
});

// PATCH /api/system/settings
router.patch('/system/settings', async (req, res) => {
  try {
    const { overallOrdering } = req.body;
    await updateSystemSettingInDb('overall_ordering', overallOrdering ? 'true' : 'false');
    return res.json({
      success: true,
      overallOrdering: Boolean(overallOrdering)
    });
  } catch (error) {
    console.error('[API PATCH /system/settings] Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to update system setting.'
    });
  }
});

// PATCH /api/restaurants/:id/status
router.patch('/restaurants/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['OPEN', 'CLOSED'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Status must be OPEN or CLOSED.'
      });
    }

    await updateRestaurantStatusInDb(req.params.id, status);
    return res.json({
      success: true,
      restaurantId: req.params.id,
      status
    });
  } catch (error) {
    console.error('[API PATCH /restaurants/:id/status] Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to update restaurant status.'
    });
  }
});

// ==========================================
// 4. DELIVERY PARTNER & LIVE LOCATION ENDPOINTS
// ==========================================

// GET /api/delivery/partners - List all available delivery partners
router.get('/delivery/partners', async (req, res) => {
  try {
    const partners = await getAllDeliveryPartnersFromDb();
    return res.json({
      success: true,
      partners
    });
  } catch (error) {
    console.error('[API GET /delivery/partners] Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch delivery partners.'
    });
  }
});

// PATCH /api/admin/orders/:id/assign-delivery - Assign partner when order is READY (Part 3)
router.patch('/admin/orders/:id/assign-delivery', adminAuthMiddleware, async (req, res) => {
  try {
    const { deliveryPartnerId } = req.body;
    if (!deliveryPartnerId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required deliveryPartnerId in request body.'
      });
    }

    const result = await assignDeliveryPartnerToOrderInDb(req.params.id, deliveryPartnerId);
    if (result.error) {
      return res.status(result.code || 400).json({
        success: false,
        error: result.error
      });
    }

    return res.json({
      success: true,
      message: `Assigned delivery partner ${result.partner.name} to order #${req.params.id}`,
      order: result.order,
      partner: result.partner
    });
  } catch (error) {
    console.error('[API PATCH /admin/orders/:id/assign-delivery] Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to assign delivery partner.'
    });
  }
});

// GET /api/delivery/orders - Get orders assigned to a partner (Part 4)
router.get('/delivery/orders', async (req, res) => {
  try {
    const partnerId = req.query.partnerId || req.headers['x-delivery-partner-id'];
    if (!partnerId) {
      return res.status(400).json({
        success: false,
        error: 'Missing partnerId parameter or x-delivery-partner-id header.'
      });
    }

    const allAssigned = await getOrdersForDeliveryPartnerFromDb(partnerId);
    const activeOrders = allAssigned.filter(o => ['READY', 'PICKED_UP', 'OUT_FOR_DELIVERY'].includes(o.status));
    const completedOrders = allAssigned.filter(o => o.status === 'DELIVERED');

    return res.json({
      success: true,
      partnerId,
      orders: allAssigned,
      activeOrders,
      completedOrders
    });
  } catch (error) {
    console.error('[API GET /delivery/orders] Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch delivery orders.'
    });
  }
});

// PATCH /api/delivery/orders/:id/status - Update order status by delivery partner (Part 4)
router.patch('/delivery/orders/:id/status', async (req, res) => {
  try {
    const { status, partnerId } = req.body;
    if (!status || !partnerId) {
      return res.status(400).json({
        success: false,
        error: 'Missing status or partnerId in request body.'
      });
    }

    const result = await updateDeliveryOrderStatusInDb(req.params.id, status, partnerId);
    if (result.error) {
      return res.status(result.code || 400).json({
        success: false,
        error: result.error
      });
    }

    return res.json({
      success: true,
      message: `Delivery status updated to ${status}`,
      order: result.order
    });
  } catch (error) {
    console.error('[API PATCH /delivery/orders/:id/status] Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to update delivery status.'
    });
  }
});

// POST /api/delivery/location - Record GPS location ping (Part 5)
router.post('/delivery/location', async (req, res) => {
  try {
    const { orderId, deliveryPartnerId, latitude, longitude, accuracy } = req.body;
    if (!orderId || !deliveryPartnerId || latitude === undefined || longitude === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required location fields: orderId, deliveryPartnerId, latitude, and longitude.'
      });
    }

    const result = await recordDeliveryLocationInDb({
      orderId,
      deliveryPartnerId,
      latitude,
      longitude,
      accuracy
    });

    if (result.error) {
      return res.status(result.code || 400).json({
        success: false,
        error: result.error
      });
    }

    return res.json({
      success: true,
      location: result.location
    });
  } catch (error) {
    console.error('[API POST /delivery/location] Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to record delivery location.'
    });
  }
});

// GET /api/orders/:id/live-location - Student live delivery location polling (Part 6 & 8)
router.get('/orders/:id/live-location', async (req, res) => {
  try {
    const result = await getLatestDeliveryLocationFromDb(req.params.id);
    if (result.error) {
      return res.status(result.code || 404).json({
        success: false,
        error: result.error
      });
    }

    // Privacy & Security: Only exposes coordinates when active, null once DELIVERED
    return res.json({
      success: true,
      orderId: req.params.id,
      active: result.active,
      status: result.status,
      location: result.location,
      partner: result.partner
    });
  } catch (error) {
    console.error('[API GET /orders/:id/live-location] Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch live location.'
    });
  }
});

export default router;
