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

    try {
        // Fetch user nutritional goals
        const goalsQuery = `SELECT * FROM user_nutritional_goals WHERE user_id = $1`;
        const goalsResult = await db.query(goalsQuery, [user_id]);
        const nutritionalGoals = goalsResult.rows[0];

        // Fetch user's recipes
        const recipesQuery = `SELECT recipe_id FROM user_recipes WHERE user_id = $1`;
        const recipesResult = await db.query(recipesQuery, [user_id]);
        const recipeIds = recipesResult.rows.map(row => row.recipe_id);

        let totalNutrients = {
            protein: 0,
            carbohydrates: 0,
            total_fat: 0,
            saturated_fat: 0,
            fiber: 0,
            sodium: 0,
            sugar: 0
        };

        // Call Spoonacular API for each recipe to sum nutrients
        for (const recipeId of recipeIds) {
            const recipeData = await spoonacularApiCall(recipeId);
            totalNutrients.protein += recipeData.protein;
            totalNutrients.carbohydrates += recipeData.carbs;
            totalNutrients.total_fat += recipeData.fat;
            // Sum other nutrients
        }

        // Send response to frontend
        res.json({
            goals: nutritionalGoals,
            consumed: totalNutrients,
        });

    } catch (error) {
        res.status(500).json({ error: "An error occurred while fetching data" });
    }
});
module.exports = router;