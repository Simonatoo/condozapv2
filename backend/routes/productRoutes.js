const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// @route   GET api/products
// @desc    Get all products
// @access  Public
router.get('/', productController.getProducts);

// @route   GET api/products/:id
// @desc    Get product by ID
// @access  Public
router.get('/:id', productController.getProductById);

// @route   POST api/products
// @desc    Create a product
// @access  Private (TODO: middleware)
router.post('/', productController.createProduct);

// @route   PUT api/products/:id
// @desc    Update a product
// @access  Private
router.put('/:id', productController.updateProduct);

// @route   DELETE api/products/:id
// @desc    Delete a product
// @access  Private
router.delete('/:id', productController.deleteProduct);

module.exports = router;
