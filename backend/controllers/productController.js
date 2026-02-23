const Product = require('../models/Product');
const User = require('../models/User');

exports.createProduct = async (req, res) => {
    try {
        const { name, description, value, status, user_id } = req.body;

        let images = [];
        if (req.files && req.files.length > 0) {
            images = req.files.map(file => file.path);
        }

        let userCondominiums = [];
        if (user_id) {
            const tempUser = await User.findById(user_id).select('condominiums');
            if (tempUser && tempUser.condominiums) {
                userCondominiums = tempUser.condominiums;
            }
        }

        const newProduct = new Product({
            name,
            description,
            value,
            status,
            user_id,
            condominiums: userCondominiums,
            category: req.body.category,
            images
        });

        const product = await newProduct.save();

        let awardedBadges = [];
        if (user_id) {
            const user = await User.findById(user_id);

            if (user) {
                // Conta no banco de dados quantos produtos o usuário já tem
                const productCount = await Product.countDocuments({ user_id: user_id });

                if (!user.badges.includes('open-doors')) {
                    user.badges.push('open-doors');
                    user.points += 50;
                    awardedBadges.push('open-doors');
                }

                // Exemplo: se já for o 10º produto (levando em conta que o product atual acabou de ser salvo e contabilizado no count)
                if (!user.badges.includes('local-commerce') && productCount >= 10) {
                    user.badges.push('local-commerce');
                    user.points += 50;
                    awardedBadges.push('local-commerce');
                }

                await user.save();
            }
        }

        res.json({ product, awardedBadges });
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

        // Fetch user from DB using the authenticated req.user to securely apply filtering
        // Temporarily removing condo filter so everyone sees everything
        /*
        if (req.user && req.user.id) {
            const currentUser = await User.findById(req.user.id).select('condominiums');
            if (currentUser && currentUser.condominiums && currentUser.condominiums.length > 0) {
                // Filter products that belong to any of the user's condominiums
                filter.condominiums = { $in: currentUser.condominiums };
            } else {
                // If user has no condos linked, return nothing.
                return res.json([]);
            }
        } else {
            return res.status(401).json({ msg: 'Not authorized' });
        }
        */

        let query = Product.find(filter).sort({ createdAt: -1 });

        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit) || 20;

        if (page) {
            const skip = (page - 1) * limit;
            query = query.skip(skip).limit(limit);
        }

        // Ensure we don't return sensitive data like phone numbers
        const products = await query.populate('user_id', 'name photo badges smsVerified')
            .populate('condominiums', 'name')
            .select('-__v -updatedAt');
        res.json(products);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

exports.getProductById = async (req, res) => {
    try {
        // Remove sensitive fields from the default populate
        const product = await Product.findById(req.params.id)
            .populate('user_id', 'name photo badges smsVerified')
            .populate('condominiums', 'name')
            .select('-__v -updatedAt');
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

        let awardedBadges = [];

        // Check if the product was just marked as sold
        if (status === 'sold' && product.user_id) {
            const user = await User.findById(product.user_id);
            if (user && !user.badges.includes('hand-shake')) {
                user.badges.push('hand-shake');
                user.points += 25;
                awardedBadges.push('hand-shake');
                await user.save();
            }
        }

        if (shouldUpdateImages) {
            product.images = finalImages;
        }

        product.status = status || product.status;
        await product.save();

        res.json({ product, awardedBadges });
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

exports.getCondominiumStats = async (req, res) => {
    try {
        const stats = await Product.aggregate([
            {
                $facet: {
                    activeTotal: [
                        { $match: { status: 'enabled' } },
                        { $group: { _id: null, total: { $sum: "$value" } } }
                    ],
                    soldTotal: [
                        { $match: { status: 'sold' } },
                        { $group: { _id: null, total: { $sum: "$value" } } }
                    ],
                    categoriesRanking: [
                        { $match: { status: { $in: ['enabled', 'sold'] } } },
                        { $group: { _id: "$category", count: { $sum: 1 } } },
                        { $sort: { count: -1 } },
                        { $limit: 3 },
                        { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'categoryInfo' } },
                        { $unwind: { path: "$categoryInfo", preserveNullAndEmptyArrays: true } },
                        { $project: { _id: 1, count: 1, name: "$categoryInfo.name" } }
                    ]
                }
            }
        ]);

        const result = {
            activeTotal: stats[0].activeTotal[0]?.total || 0,
            soldTotal: stats[0].soldTotal[0]?.total || 0,
            categoriesRanking: stats[0].categoriesRanking || []
        };

        res.json(result);
    } catch (err) {
        console.error("Error in getCondominiumStats:", err);
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
};

// @route   GET /api/products/:id/contact
// @desc    Get the seller's phone number securely 
exports.getProductContact = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate('user_id', 'telefone smsVerified');
        if (!product) {
            return res.status(404).json({ msg: 'Product not found' });
        }

        const currentUser = await User.findById(req.user.id);
        if (!currentUser) {
            return res.status(404).json({ msg: 'User not found' });
        }

        if (!currentUser.smsVerified) {
            return res.status(403).json({ msg: 'Você precisa ter seu telefone verificado para contatar vendedores.' });
        }

        if (!product.user_id || !product.user_id.telefone) {
            return res.status(404).json({ msg: 'Telefone do vendedor não disponível.' });
        }

        res.json({ telefone: product.user_id.telefone });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Product not found' });
        }
        res.status(500).send('Server Error');
    }
};
