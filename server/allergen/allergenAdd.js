const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../db'); // Assuming you have a db.js file for database connections
const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extract token from Bearer scheme

    if (!token) {
        return res.status(401).json({ message: 'Token not found' });
    }

    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }

        // Ensure the user_id is available in the decoded token
        if (!decoded || !decoded.id) {
            return res.status(403).json({ message: 'Invalid token payload' });
        }

        req.user = decoded; // Assign decoded token to req.user
        next();
    });
};

// Route to add allergen
router.post('/', authenticateToken, async (req, res) => {
    const { allergy } = req.body;
    const userId = req.user.id; // Assuming the token contains the user's ID
    console.log(allergy);
    try {
        // Add allergen to the database
        await db.query('INSERT INTO user_allergens (user_id, allergen) VALUES ($1, $2)', [userId, allergy]);
        res.json({ success: true });
    } catch (error) {
        console.error('Error adding allergen:', error);
        res.status(500).json({ success: false, message: 'Database error' });
    }
});

module.exports = router;
