const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.register = async (req, res) => {
    // ... existing code ...
    try {
        const { name, email, telefone, apartment, password, role } = req.body;

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
            role
        });

        await user.save();

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
                res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, apartment: user.apartment, photo: user.photo, badges: user.badges, checkedBadges: user.checkedBadges } });
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

        let user = await User.findOne({ email });
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
                res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, apartment: user.apartment, photo: user.photo, badges: user.badges, checkedBadges: user.checkedBadges } });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

exports.googleLogin = async (req, res) => {
    const { token, apartment, telefone } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { email, name, picture } = payload;

        let user = await User.findOne({ email });

        if (!user) {
            // If user doesn't exist and no apartment/telefone provided, request it
            if (!apartment || !telefone) {
                return res.status(200).json({
                    needsRegistration: true,
                    email,
                    name,
                    photo: picture,
                    msg: 'Por favor, informe seu apartamento e telefone para concluir o cadastro.'
                });
            }

            // Register new user with apartment and telefone
            user = new User({
                name,
                email,
                apartment,
                telefone, // Use provided telefone
                password: Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8), // Random dummy password
                role: 'default', // Correct role based on User model enum
                photo: picture
            });
            await user.save();
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
                res.json({ token: jwtToken, user: { id: user.id, name: user.name, email: user.email, role: user.role, apartment: user.apartment, photo: user.photo, badges: user.badges, checkedBadges: user.checkedBadges } });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error during Google Login');
    }
};
