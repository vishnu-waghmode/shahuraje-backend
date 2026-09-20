const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.post('/add', productController.createProduct);
router.get('/', productController.getProducts);

router.put('/:id', productController.updateProduct); // Edit साठी
router.delete('/:id', productController.deleteProduct); // Delete साठी

module.exports = router;