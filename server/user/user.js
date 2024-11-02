const express = require('express');
const pool = require('../db'); // Database connection
const jwt = require('jsonwebtoken');
const router = express.Router();

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token not found' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }

        req.user = decoded;
        next();
    });
};

// Endpoint to get user profile data
router.get('/profile', authenticateToken, async (req, res) => {
    const userId = req.user.id;

    try {
        const result = await pool.query(`
            SELECT u.email, up.first_name, up.last_name, up.phone
            FROM users u
            JOIN user_profiles up ON u.user_id = up.user_id
            WHERE u.user_id = $1
        `, [userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Endpoint to update user email
router.put('/update-email', authenticateToken, async (req, res) => {
    const { email } = req.body;
    const userId = req.user.id; // Extract user ID from authenticated token

    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    try {
        // Fetch the current user details to confirm identity
        const userDetailsQuery = `
            SELECT up.first_name, up.last_name, u.email AS previous_email, up.phone 
            FROM users u
            JOIN user_profiles up ON u.user_id = up.user_id
            WHERE u.user_id = $1
        `;
        const userDetailsResult = await pool.query(userDetailsQuery, [userId]);

        if (userDetailsResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userDetails = userDetailsResult.rows[0];

        // Proceed with updating the email
        const updateEmailQuery = 'UPDATE users SET email = $1 WHERE user_id = $2 RETURNING email';
        const updateResult = await pool.query(updateEmailQuery, [email, userId]);

        // Log the updated user information, including identifiable details
        console.log('Updated email information:', JSON.stringify({
            user_id: userId,
            name: `${userDetails.first_name} ${userDetails.last_name}`,
            previous_email: userDetails.previous_email,
            new_email: updateResult.rows[0].email,
            phone: userDetails.phone
        }, null, 2));

        res.status(200).json({ message: 'Email updated successfully', email: updateResult.rows[0].email });
    } catch (error) {
        console.error('Error updating email:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
