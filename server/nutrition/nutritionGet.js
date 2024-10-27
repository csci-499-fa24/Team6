const express = require('express');
const pool = require('../db');
const router = express.Router(); // Use express Router
const jwt = require("jsonwebtoken");

// Middleware to authenticate token
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

// POST route to add or update ingredient
router.get('/', authenticateToken, async (req, res) => {
    const user_id = req.user.id;

    try {
        // Fetch user nutritional goals
        const goalsQuery = `SELECT * FROM user_nutritional_goals WHERE user_id = $1`;
        const goalsResult = await pool.query(goalsQuery, [user_id]);
        const nutritionalGoals = goalsResult.rows[0];

        const consumeQuery = 'SELECT * FROM user_intake WHERE user_id = $1';
        const consumeResult = await pool.query(consumeQuery, [user_id]);
        const totalNutrients = consumeResult.rows[0];

        res.json({
            goals: nutritionalGoals,
            consumed: totalNutrients,
        });

    } catch (error) {
        res.status(500).json({ error: "An error occurred while fetching data" });
    }
});
module.exports = router;