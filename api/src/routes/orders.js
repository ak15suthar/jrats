const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { auth, adminAuth } = require('../middleware/auth');

// User routes
router.post('/', auth, orderController.createOrder);
router.get('/', auth, orderController.getUserOrders);
router.get('/:id', auth, orderController.getOrder);

// Admin routes
router.get('/admin/all', auth, adminAuth, orderController.getAllOrders);
router.put('/:id/status', auth, adminAuth, orderController.updateOrderStatus);

module.exports = router;