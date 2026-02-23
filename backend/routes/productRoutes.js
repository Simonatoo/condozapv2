const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const upload = require('../config/cloudinary');
const auth = require('../middleware/auth');

// @route   GET api/products
// @desc    Get all products
// @access  Public
router.get('/', productController.getProducts);

// @route   GET api/products/stats/condominium
// @desc    Get aggregated stats for the condominium dashboard
// @access  Public
router.get('/stats/condominium', productController.getCondominiumStats);

// @route   GET api/products/:id
// @desc    Get product by ID
// @access  Public
router.get('/:id', productController.getProductById);

// @route   POST api/products
// @desc    Create a product
// @access  Private
router.post('/', auth, (req, res, next) => {
    upload.array('images', 5)(req, res, (err) => {
        if (err) {
            console.error("Multer/Cloudinary Error:", err);
            return res.status(400).json({ msg: 'Image upload failed', error: err.message, stack: err.stack });
        }
        next();
    });
}, productController.createProduct);

// @route   PUT api/products/:id
// @desc    Update a product
// @access  Private
router.put('/:id', auth, (req, res, next) => {
    upload.array('images', 5)(req, res, (err) => {
        if (err) {
            console.error("Multer/Cloudinary Error:", err);
            return res.status(400).json({ msg: 'Image upload failed', error: err.message, stack: err.stack });
        }
        next();
    });
}, productController.updateProduct);

// @route   DELETE api/products/:id
// @desc    Delete a product
// @access  Private
router.delete('/:id', auth, productController.deleteProduct);

module.exports = router;
