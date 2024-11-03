const express = require('express');
const pool = require('../db'); // Database connection
const bcrypt = require('bcrypt');
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

    //Must follow email format
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }

    //Adding check for existing account with email
    try {
        const emailExists = await pool.query('SELECT user_id FROM users WHERE email = $1', [email]);
        if (emailExists.rows.length > 0 && emailExists.rows[0].user_id !== userId) {
            return res.status(409).json({ message: 'Email is already associated with another account' });
        }
    } catch (error) {
        console.error('Error checking email:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }

    try {
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
        const updateEmailQuery = 'UPDATE users SET email = $1 WHERE user_id = $2 RETURNING email';
        const updateResult = await pool.query(updateEmailQuery, [email, userId]);

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

// Endpoint to update user password
router.put('/update-password', authenticateToken, async (req, res) => {
    const { password } = req.body;
    const userId = req.user.id;

    if (!password) {
        return res.status(400).json({ message: 'Password is required' });
    }

    try {
        const currentPasswordQuery = 'SELECT password FROM users WHERE user_id = $1';
        const currentPasswordResult = await pool.query(currentPasswordQuery, [userId]);

        if (currentPasswordResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const currentHashedPassword = currentPasswordResult.rows[0].password;

        const isSamePassword = await bcrypt.compare(password, currentHashedPassword);
        if (isSamePassword) {
            return res.status(400).json({ message: 'Password cannot be the same as your last password' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

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

        const updatePasswordQuery = 'UPDATE users SET password = $1 WHERE user_id = $2 RETURNING user_id';
        const updateResult = await pool.query(updatePasswordQuery, [hashedPassword, userId]);

        console.log(`Password updated successfully for user: ${userId} (${userDetails.first_name} ${userDetails.last_name})`);

        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Endpoint to update user phone number
router.put('/update-phone', authenticateToken, async (req, res) => {
    const { phone } = req.body;
    const userId = req.user.id;

    const phonePattern = /^\d{3}-\d{3}-\d{4}$/; // Expected format: 123-456-7890
    if (!phonePattern.test(phone)) {
        return res.status(400).json({ message: 'Invalid phone number format. Use XXX-XXX-XXXX' });
    }

    //Adding check for existing account with phone number
    try {
        const phoneExists = await pool.query('SELECT user_id FROM user_profiles WHERE phone = $1', [phone]);
        if (phoneExists.rows.length > 0 && phoneExists.rows[0].user_id !== userId) {
            return res.status(409).json({ message: 'Phone number is already associated with another account' });
        }
    } catch (error) {
        console.error('Error checking phone number:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }

    try {
        const userDetailsQuery = `
            SELECT up.first_name, up.last_name, u.email, up.phone AS previous_phone 
            FROM users u
            JOIN user_profiles up ON u.user_id = up.user_id
            WHERE u.user_id = $1
        `;
        const userDetailsResult = await pool.query(userDetailsQuery, [userId]);

        if (userDetailsResult.rows.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userDetails = userDetailsResult.rows[0];
        const updatePhoneQuery = 'UPDATE user_profiles SET phone = $1 WHERE user_id = $2 RETURNING phone';
        const updateResult = await pool.query(updatePhoneQuery, [phone, userId]);

        console.log('Updated phone information:', JSON.stringify({
            user_id: userId,
            name: `${userDetails.first_name} ${userDetails.last_name}`,
            previous_phone: userDetails.previous_phone,
            new_phone: updateResult.rows[0].phone,
            email: userDetails.email
        }, null, 2));

        res.status(200).json({ message: 'Phone number updated successfully', phone: updateResult.rows[0].phone });
    } catch (error) {
        console.error('Error updating phone number:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;

