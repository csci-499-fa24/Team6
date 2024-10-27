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

router.post('/', authenticateToken, async (req, res) => {
    const { recipeId } = req.body;
    const user_id = req.user.id;

    try {
        // Check if the recipe is already in the user's plan
        const checkQuery = await pool.query(
            'SELECT * FROM user_recipes WHERE user_id = $1 AND recipe_id = $2',
            [user_id, recipeId]
        );

        if (checkQuery.rows.length > 0) {
            return res.status(400).json({ message: 'Recipe is already in your plan.' });
        }

        // Insert the recipe into the user_recipes table
        const insertQuery = await pool.query(
            'INSERT INTO user_recipes (user_id, recipe_id) VALUES ($1, $2)',
            [user_id, recipeId]
        );


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

        const url = `https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/${recipeId}/nutritionWidget.json`;
        const response = await fetch(url, {
            method: 'GET',
                headers: {
                    'X-RapidAPI-Host': 'spoonacular-recipe-food-nutrition-v1.p.rapidapi.com',
                    'X-RapidAPI-Key': process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY
                }
        });

        const detail = await response.json();
        const nutrients = detail.nutrients;

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

        
        const checkIntake = await pool.query(
            'SELECT * FROM user_intake WHERE user_id = $1',
            [user_id]
        );

        if (checkIntake.rows.length < 1) {
            await pool.query(
                `INSERT INTO user_intake 
                  (user_id, protein, carbohydrates, total_fat, saturated_fat, fiber, sodium, sugar, calories) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
                [
                  user_id,
                  totalNutrients.protein,
                  totalNutrients.carbohydrates,
                  totalNutrients.total_fat,
                  totalNutrients.saturated_fat,
                  totalNutrients.fiber,
                  totalNutrients.sodium,
                  totalNutrients.sugar,
                  totalNutrients.calories
                ]
              );
        }

        else {
            const existingData = checkIntake.rows[0];
            
            const updatedNutrients = {
                protein: existingData.protein ? existingData.protein + totalNutrients.protein : totalNutrients.protein,
                carbohydrates: existingData.carbohydrates ? existingData.carbohydrates + totalNutrients.carbohydrates : totalNutrients.carbohydrates,
                total_fat: existingData.total_fat ? existingData.total_fat + totalNutrients.total_fat : totalNutrients.total_fat,
                saturated_fat: existingData.saturated_fat ? existingData.saturated_fat + totalNutrients.saturated_fat : totalNutrients.saturated_fat,
                fiber: existingData.fiber ? existingData.fiber + totalNutrients.fiber : totalNutrients.fiber,
                sodium: existingData.sodium ? existingData.sodium + totalNutrients.sodium : totalNutrients.sodium,
                sugar: existingData.sugar ? existingData.sugar + totalNutrients.sugar : totalNutrients.sugar,
                calories: existingData.calories ? existingData.calories + totalNutrients.calories : totalNutrients.calories
            };
            
            // Update the row in the database
            await pool.query(
                `UPDATE user_intake SET 
                calories = $2, 
                protein = $3, 
                carbohydrates = $4, 
                total_fat = $5, 
                saturated_fat = $6, 
                fiber = $7, 
                sodium = $8, 
                sugar = $9 
                WHERE user_id = $1`,
                [
                user_id,
                updatedNutrients.calories,
                updatedNutrients.protein,
                updatedNutrients.carbohydrates,
                updatedNutrients.total_fat,
                updatedNutrients.saturated_fat,
                updatedNutrients.fiber,
                updatedNutrients.sodium,
                updatedNutrients.sugar
                ]
            );
        }


        res.status(201).json({ message: 'Recipe added to your history.' });
    } catch (error) {
        console.error('Error adding recipe to plan:', error);
        res.status(500).json({ message: 'Failed to add recipe to history.' });
    }
});
module.exports = router;