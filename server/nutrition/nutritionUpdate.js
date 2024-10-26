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
router.post('/', authenticateToken, async (req, res) => {
    const user_id = req.user.id;
    const { goals } = req.body;

    try {
        const updateQuery = `
        UPDATE user_nutritional_goals 
        SET 
            protein = $1, 
            carbohydrates = $2, 
            total_fat = $3, 
            saturated_fat = $4, 
            fiber = $5, 
            sodium = $6, 
            sugar = $7,
            calories = $8,
        WHERE user_id = $9
    `;
    await pool.query(updateQuery, [
        goals.protein === '' ? null : goals.protein, // if empty string, set to null
        goals.carbohydrates === '' ? null : goals.carbohydrates,
        goals.total_fat === '' ? null : goals.total_fat,
        goals.saturated_fat === '' ? null : goals.saturated_fat,
        goals.fiber === '' ? null : goals.fiber,
        goals.sodium === '' ? null : goals.sodium,
        goals.sugar === '' ? null : goals.sugar,
        goals.calories == '' ? null: goals.calories,
        user_id
    ]);


        res.json({ message: "Goals updated successfully" });
    } catch (error) {
        res.status(500).json({ error: "An error occurred while updating goals" });
    }
});
module.exports = router;