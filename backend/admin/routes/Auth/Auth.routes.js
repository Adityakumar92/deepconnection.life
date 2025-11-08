const express = require('express');
const router = express.Router();
const {
    login
} = require('../../controllers/Auth/Auth.controller');

/**
 * @route   POST /api/admin/auth/login
 * @desc    Login backend user
 * @access  Public
 */
router.post('/login', login);

module.exports = router;

