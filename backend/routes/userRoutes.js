const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

// @route   GET api/users/me
// @desc    Get user by token
// @access  Private
router.get('/me', auth, userController.getMe);

// @route   PUT api/users/me/sync-badges
// @desc    Sync validated badges into checkedBadges array
// @access  Private
router.put('/me/sync-badges', auth, userController.syncBadges);

// @route   GET api/users/me/can-contact
// @desc    Check if user is allowed to contact
// @access  Private
router.get('/me/can-contact', auth, userController.canContact);

module.exports = router;
