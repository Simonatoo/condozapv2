const Condominium = require('../models/Condominium');

// @route   GET /api/condominiums
// @desc    Get all condominiums
// @access  Public
exports.getCondominiums = async (req, res) => {
    try {
        const condominios = await Condominium.find().sort({ name: 1 });
        res.json(condominios);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
