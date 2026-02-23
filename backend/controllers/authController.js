const User = require('../models/User');
const Condominium = require('../models/Condominium');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.register = async (req, res) => {
    // ... existing code ...
    try {
        const { name, email, telefone, apartment, password, role, condominios } = req.body;

        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({
            name,
            email,
            telefone,
            apartment,
            password: hashedPassword,
            role,
            condominiums: condominios
        });

        await user.save();
        await user.populate('condominiums', 'name');

        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: 360000 },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, apartment: user.apartment, photo: user.photo, badges: user.badges, checkedBadges: user.checkedBadges, condominiums: user.condominiums } });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        let user = await User.findOne({ email }).populate('condominiums', 'name');
        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: 360000 },
            (err, token) => {
                if (err) throw err;
                res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, apartment: user.apartment, photo: user.photo, badges: user.badges, checkedBadges: user.checkedBadges, condominiums: user.condominiums } });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.googleLogin = async (req, res) => {
    const { token, apartment, telefone, condominios } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { email, name, picture } = payload;

        let user = await User.findOne({ email }).populate('condominiums', 'name');

        if (!user) {
            // If user doesn't exist and no apartment/telefone/condominios provided, request it
            if (!apartment || !telefone || !condominios || !condominios.length) {
                return res.status(200).json({
                    needsRegistration: true,
                    email,
                    name,
                    photo: picture,
                    msg: 'Por favor, informe seu apartamento, telefone e condomínio para concluir o cadastro.'
                });
            }

            // Register new user with apartment and telefone
            user = new User({
                name,
                email,
                apartment,
                telefone, // Use provided telefone
                condominiums: condominios, // Link to condominiums
                password: Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8), // Random dummy password
                role: 'default', // Correct role based on User model enum
                photo: picture
            });
            await user.save();
            await user.populate('condominiums', 'name');
        } else {
            // Update photo if it exists in payload
            if (picture) {
                user.photo = picture;
                await user.save();
            }
        }

        const jwtPayload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(
            jwtPayload,
            process.env.JWT_SECRET,
            { expiresIn: 360000 },
            (err, jwtToken) => {
                if (err) throw err;
                res.json({ token: jwtToken, user: { id: user.id, name: user.name, email: user.email, role: user.role, apartment: user.apartment, photo: user.photo, badges: user.badges, checkedBadges: user.checkedBadges, condominiums: user.condominiums } });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error during Google Login');
    }
};
