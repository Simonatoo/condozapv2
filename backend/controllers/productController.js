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
            category: req.body.category,
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
        const { user_id, status, category } = req.query;
        let filter = {};
        if (user_id) filter.user_id = user_id;
        if (status) filter.status = status;
        if (category) filter.category = category;

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
        const { name, description, value, status, category } = req.body;

        let product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ msg: 'Product not found' });
        }

        // Check user? For now assuming logic is handled elsewhere or simplified

        product.name = name || product.name;
        product.description = description || product.description;
        product.value = value || product.value;
        product.status = status || product.status;
        product.category = category || product.category;

        // Handle images:
        // Only update images if files are uploaded or keptImages is provided.
        // If neither is present, we assume the user wants to keep existing images as is (unless they explicitly sent empty keptImages array, which we can't easily distinguish from 'undefined' in some contents, but let's assume undefined means 'no change').

        // However, the previous logic was:
        // let finalImages = [];
        // if (req.body.keptImages) ...
        // if (req.files) ...
        // product.images = finalImages; 

        // This overwrites product.images with empty array if nothing is sent.
        // We want to support partial updates where we don't send images at all.

        let shouldUpdateImages = false;
        let finalImages = [];

        if (req.body.keptImages !== undefined) {
            shouldUpdateImages = true;
            finalImages = Array.isArray(req.body.keptImages) ? req.body.keptImages : [req.body.keptImages];
        }

        if (req.files && req.files.length > 0) {
            shouldUpdateImages = true;
            const newImages = req.files.map(file => file.path);
            // If keptImages was undefined but we have new files, do we keep old ones? 
            // Usually, if I upload new files without specifying keptImages, it might mean "add to existing" or "replace all".
            // But standard HTML forms don't send existing files. 
            // Let's stick to the previous contract: "keptImages" defines what to keep.
            // But if I *only* want to update status, I don't send files nor keptImages.

            // If keptImages is undefined, let's assume we want to keep ALL existing images + new ones? 
            // Or should we stick to "undefined keptImages means empty"? 
            // The issue is the status update didn't send keptImages.

            // If I send new files but NOT keptImages, I probably want to replace everything or add to it.
            // But safely, if I send files, shouldUpdateImages is true.
            // If I don't send keptImages, finalImages starts empty. So it replaces everything with new files.

            // If I send NOTHING (no files, no keptImages) -> shouldUpdateImages remains false.
            finalImages = [...finalImages, ...newImages];
        }

        if (shouldUpdateImages) {
            product.images = finalImages;
        }

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
