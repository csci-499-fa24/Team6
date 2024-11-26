const express = require('express');
const pool = require('../db');
const router = express.Router();
const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Token not found' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err || !decoded?.id) {
            return res.status(403).json({ message: 'Invalid token' });
        }

        req.user = decoded;
        next();
    });
};

router.post('/', authenticateToken, async (req, res) => {
    const user_id = req.user.id;
    const { macros } = req.body;

    try {
        // Fetch the current intake values
        const fetchQuery = `
            SELECT protein, carbohydrates, total_fat, saturated_fat, fiber, sodium, sugar, calories 
            FROM user_intake
            WHERE user_id = $1
        `;
        const fetchResult = await pool.query(fetchQuery, [user_id]);

        if (fetchResult.rows.length === 0) {
            return res.status(404).json({ message: 'No existing intake data found for user' });
        }

        const currentIntake = fetchResult.rows[0];

        // Add the incoming macros to the existing values
        const updatedIntake = {
            protein: (currentIntake.protein || 0) + (parseFloat(macros.protein) || 0),
            carbohydrates: (currentIntake.carbohydrates || 0) + (parseFloat(macros.carbohydrates) || 0),
            total_fat: (currentIntake.total_fat || 0) + (parseFloat(macros.total_fat) || 0),
            saturated_fat: (currentIntake.saturated_fat || 0) + (parseFloat(macros.saturated_fat) || 0),
            fiber: (currentIntake.fiber || 0) + (parseFloat(macros.fiber) || 0),
            sodium: (currentIntake.sodium || 0) + (parseFloat(macros.sodium) || 0),
            sugar: (currentIntake.sugar || 0) + (parseFloat(macros.sugar) || 0),
            calories: (currentIntake.calories || 0) + (parseFloat(macros.calories) || 0),
        };

        // Update the intake table
        const updateQuery = `
            UPDATE user_intake 
            SET 
                protein = $1, 
                carbohydrates = $2, 
                total_fat = $3, 
                saturated_fat = $4, 
                fiber = $5, 
                sodium = $6, 
                sugar = $7,
                calories = $8
            WHERE user_id = $9
        `;
        await pool.query(updateQuery, [
            updatedIntake.protein,
            updatedIntake.carbohydrates,
            updatedIntake.total_fat,
            updatedIntake.saturated_fat,
            updatedIntake.fiber,
            updatedIntake.sodium,
            updatedIntake.sugar,
            updatedIntake.calories,
            user_id
        ]);

        res.json({ message: "Macros added successfully", updatedConsumed: updatedIntake });
    } catch (error) {
        console.error("Error updating intake macros:", error);
        res.status(500).json({ error: "An error occurred while updating macros" });
    }
});

module.exports = router;