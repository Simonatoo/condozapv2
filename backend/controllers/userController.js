const User = require('../models/User');
const Condominium = require('../models/Condominium');

// @route   GET /api/users/me
// @desc    Get current user data
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password').populate('condominium', 'name');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            apartment: user.apartment,
            photo: user.photo,
            badges: user.badges,
            checkedBadges: user.checkedBadges,
            telefone: user.telefone,
            smsVerified: user.smsVerified,
            points: user.points,
            condominium: user.condominium
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   PUT /api/users/me/sync-badges
// @desc    Add a batch of badges to checkedBadges array
exports.syncBadges = async (req, res) => {
    try {
        const { badgesToSync } = req.body; // Expecting an array

        if (!Array.isArray(badgesToSync)) {
            return res.status(400).json({ msg: 'badgesToSync must be an array' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        // Initialize if undefined
        if (!user.checkedBadges) {
            user.checkedBadges = [];
        }

        let updated = false;

        badgesToSync.forEach(badge => {
            if (!user.checkedBadges.includes(badge)) {
                user.checkedBadges.push(badge);
                updated = true;
            }
        });

        if (updated) {
            await user.save();
        }

        // Return the updated checked badges list
        res.json({ checkedBadges: user.checkedBadges });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// @route   GET /api/users/me/can-contact
// @desc    Check if current user is allowed to contact via whatsapp
exports.canContact = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        if (!user.smsVerified) {
            return res.status(403).json({ msg: 'Você precisa ter seu telefone verificado para contatar vendedores.' });
        }

        res.json({ canContact: true });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
