const jwt = require('jsonwebtoken');
const pool = require('../db');
const express = require("express");
const router = express.Router();

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
}

router.post('/', authenticateToken, async (req, res) => {
    const { ingredientId, amount, unit } = req.body;
    const user_id = req.user.id;
    try {
        await pool.query(
            'UPDATE user_ingredient SET amount = $1, unit = $2 WHERE user_id = $3 AND ingredient_id = $4',
            [amount, unit, user_id, ingredientId]
        );
        return res.status(200).json({ message: 'Ingredient updated successfully!' });
    } catch (err) {
        console.error('Error adding or updating ingredient:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
module.exports = router;