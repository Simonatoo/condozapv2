const Product = require('../models/Product');

exports.createProduct = async (req, res) => {
    try {
        const { name, description, value, status, user_id } = req.body;

        const newProduct = new Product({
            name,
            description,
            value,
            status,
            user_id
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

        await product.save();
        res.json(product);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ msg: 'Product not found' });
        }

        await product.deleteOne(); // or findByIdAndDelete
        res.json({ msg: 'Product removed' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
