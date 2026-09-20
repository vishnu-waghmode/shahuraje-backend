const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// Routes जोडणे
router.post('/add', orderController.createOrder); 
router.get('/', orderController.getAllOrders); 
router.get('/user/:userId', orderController.getUserOrders); 

module.exports = router;