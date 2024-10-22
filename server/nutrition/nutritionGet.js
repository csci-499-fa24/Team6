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
    const apiKey = process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY;

    try {
        // Fetch user nutritional goals
        const goalsQuery = `SELECT * FROM user_nutritional_goals WHERE user_id = $1`;
        const goalsResult = await pool.query(goalsQuery, [user_id]);
        const nutritionalGoals = goalsResult.rows[0];


        // Fetch user's recipes
        const recipesQuery = `SELECT recipe_id FROM user_recipes WHERE user_id = $1`;
        const recipesResult = await pool.query(recipesQuery, [user_id]);
        const recipeIds = recipesResult.rows.map(row => row.recipe_id);

        let totalNutrients = {
            calories: 0,
            protein: 0,
            carbohydrates: 0,
            total_fat: 0,
            saturated_fat: 0,
            fiber: 0,
            sodium: 0,
            sugar: 0
        };

        // for (const recipeId of recipeIds) {
        //     const recipeData = await spoonacularApiCall(recipeId);
        //     totalNutrients.protein += recipeData.protein;
        //     totalNutrients.carbohydrates += recipeData.carbs;
        //     totalNutrients.total_fat += recipeData.fat;
        // }

        const recipeDetailsPromises = recipeIds.map(recipeId => {
            const url = `https://api.spoonacular.com/recipes/${recipeId}/nutritionWidget.json?apiKey=${apiKey}`;
            return fetch(url).then(response => response.json());
        });

        const recipeDetailsResponses = await Promise.all(recipeDetailsPromises);
        recipeDetailsResponses.forEach(response => {
            const nutrients = response.nutrients;
            nutrients.forEach(nutrient => {
                switch (nutrient.name) {
                    case "Calories":
                        totalNutrients.calories += nutrient.amount;
                        break;
                    case "Protein":
                        totalNutrients.protein += nutrient.amount;
                        break;
                    case "Carbohydrates":
                        totalNutrients.carbohydrates += nutrient.amount;
                        break;
                    case "Fat":
                        totalNutrients.total_fat += nutrient.amount;
                        break;
                    case "Saturated Fat":
                        totalNutrients.saturated_fat += nutrient.amount;
                        break;
                    case "Fiber":
                        totalNutrients.fiber += nutrient.amount;
                        break;
                    case "Sodium":
                        totalNutrients.sodium += nutrient.amount;
                        break;
                    case "Sugar":
                        totalNutrients.sugar += nutrient.amount;
                        break;
                    default:
                        break; // Ignore other nutrients
                }
            });
        });

        res.json({
            goals: nutritionalGoals,
            consumed: totalNutrients,
        });

    } catch (error) {
        res.status(500).json({ error: "An error occurred while fetching data" });
    }
});
module.exports = router;