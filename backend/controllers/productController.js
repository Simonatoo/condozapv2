const Product = require('../models/Product');

exports.createProduct = async (req, res) => {
    try {
        const { name, description, value, status, user_id } = req.body;

        let images = [];
        if (req.files && req.files.length > 0) {
            images = req.files.map(file => file.path);
        }

        const newProduct = new Product({
            name,
            description,
            value,
            status,
            user_id,
            images
        });

        const product = await newProduct.save();
        res.json(product);
    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
};

exports.getProducts = async (req, res) => {
    try {
        const { user_id, status } = req.query;
        let filter = {};
        if (user_id) filter.user_id = user_id;
        if (status) filter.status = status;

        const products = await Product.find(filter)
            .sort({ createdAt: -1 })
            .populate('user_id', 'name apartment telefone');
        res.json(products);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ msg: 'Product not found' });
        }
        res.json(product);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Product not found' });
        }
        res.status(500).send('Server Error');
    }
};

exports.updateProduct = async (req, res) => {
    try {
        const { name, description, value, status } = req.body;

        let product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ msg: 'Product not found' });
        }

        // Check user? For now assuming logic is handled elsewhere or simplified

        product.name = name || product.name;
        product.description = description || product.description;
        product.value = value || product.value;
        product.status = status || product.status;

        // Handle images:
        // 1. Start with keptImages (or empty if none provided/all removed)
        let finalImages = [];
        if (req.body.keptImages) {
            finalImages = Array.isArray(req.body.keptImages) ? req.body.keptImages : [req.body.keptImages];
        }

        // 2. Append new images
        if (req.files && req.files.length > 0) {
            const newImages = req.files.map(file => file.path);
            finalImages = [...finalImages, ...newImages];
        }

        product.images = finalImages;

        await product.save();
        res.json(product);
    } catch (err) {
        console.error("Error in updateProduct:", err);
        res.status(500).json({ msg: 'Server Error', error: err.message, stack: err.stack });
    }
};

const cloudinary = require('cloudinary').v2;

exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ msg: 'Product not found' });
        }

        // Delete images from Cloudinary
        if (product.images && product.images.length > 0) {
            const deletePromises = product.images.map(imageUrl => {
                // Extract public_id from URL
                // Example: https://res.cloudinary.com/.../upload/v1234567890/products/filename.jpg
                // We want: products/filename
                const parts = imageUrl.split('/');
                const filenameWithExtension = parts[parts.length - 1]; // filename.jpg
                const folder = parts[parts.length - 2]; // products
                const filename = filenameWithExtension.split('.')[0];
                const publicId = `${folder}/${filename}`;

                return cloudinary.uploader.destroy(publicId);
            });
            await Promise.all(deletePromises);
        }

        await product.deleteOne();
        res.json({ msg: 'Product removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
