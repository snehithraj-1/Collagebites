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
  getRestaurantStatusesFromDb,
  updateRestaurantStatusInDb
} from './db.js';

const router = express.Router();

// Middlewares
router.use(cors());
router.use(express.json());

// 1. POST /api/orders - Create a new order (Phase 3)
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
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to create order.'
    });
  }
});

// 2. GET /api/orders/:id - Get complete order details including order items (Phase 4 & 6)
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

// 3. PATCH /api/orders/:id/confirm - Confirm an order within 30s (Phase 4)
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

// 4. PATCH /api/orders/:id/cancel - Cancel an order (Phase 4)
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

// 5. PATCH /api/orders/:id/status - Update order status (Phase 5 State Machine)
router.patch('/orders/:id/status', async (req, res) => {
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
      message: `Order status transitioned to ${status}.`,
      order: result.order
    });
  } catch (error) {
    console.error('[API PATCH /orders/:id/status] Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to update order status.'
    });
  }
});

// 6. GET /api/orders/student/:studentId - Get student's order history
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

// 7. GET /api/orders - Get all orders (Admin)
router.get('/orders', async (req, res) => {
  try {
    const orders = await getAllOrdersFromDb();
    return res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('[API GET /orders] Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch orders.'
    });
  }
});

// 8. DELETE /api/orders/:id - Permanently delete order (Admin)
router.delete('/orders/:id', async (req, res) => {
  try {
    await deleteOrderFromDb(req.params.id);
    return res.json({
      success: true,
      message: `Order #${req.params.id} permanently deleted.`
    });
  } catch (error) {
    console.error('[API DELETE /orders/:id] Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete order.'
    });
  }
});

// 9. GET /api/system/status - Get system and restaurant statuses
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

// 10. PATCH /api/system/settings - Update master ordering toggle
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

// 11. PATCH /api/restaurants/:id/status - Update individual restaurant status
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

export default router;
