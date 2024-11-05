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
    try {
        const { ingredients } = req.body;
        const user_id = req.user.id;

        for (const ingredient of ingredients) {
            // Retrieve the ingredient_id for the current ingredient name
            const ingredientResult = await pool.query(
                `SELECT ingredient_id FROM ingredients WHERE name = $1`,
                [ingredient.name]
            );

            if (ingredientResult.rows.length === 0) {
                // Ingredient not found, skip to the next one
                continue;
            }

            const ingredient_id = ingredientResult.rows[0].ingredient_id;

        // Check if the user has this ingredient with the matching unit
        // const userIngredientResult = await pool.query(
        //     `SELECT amount FROM user_ingredient 
        //      WHERE user_id = $1 AND ingredient_id = $2 AND unit = $3`,
        //     [user_id, ingredient_id, ingredient.unit]
        // );
        const userIngredientResult = await pool.query(
            `SELECT amount, unit FROM user_ingredient 
             WHERE user_id = $1 AND ingredient_id = $2`,
            [user_id, ingredient_id]
        );

        if (userIngredientResult.rows.length > 0) {
            const currentAmount = userIngredientResult.rows[0].amount;
            let newAmount = currentAmount - ingredient.amount;
            if (userIngredientResult.rows[0].unit != ingredient.unit) {
                const url = `https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/convert?ingredientName=${ingredient.name}&sourceUnit=${ingredient.unit}&targetUnit=${userIngredientResult.rows[0].unit}&sourceAmount=${ingredient.amount}`;

                try {
                    const response = await fetch(url, {
                        method: 'GET',
                        headers: {
                            'X-RapidAPI-Host': 'spoonacular-recipe-food-nutrition-v1.p.rapidapi.com',
                            'X-RapidAPI-Key': process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY
                        }
                    });
                    const result = await response.json();
                    const match = result.answer.match(/(\d+(\.\d+)?)/g);
                    newAmount = currentAmount - match[1];
                } catch (error) {
                    console.error(error);
                }
            }

          
          

                if (newAmount > 0) {
                    // Update the row with the new amount
                    await pool.query(
                        `UPDATE user_ingredient SET amount = $1 
                         WHERE user_id = $2 AND ingredient_id = $3`,
                        [newAmount, user_id, ingredient_id]
                    );
                } else {
                    // Delete the row if the new amount is zero or less
                    await pool.query(
                        `DELETE FROM user_ingredient 
                         WHERE user_id = $1 AND ingredient_id = $2`,
                        [user_id, ingredient_id]
                    );
                }
            }
        }

        return res.status(200).json({ message: 'Ingredients updated successfully' });
    } catch (error) {
        console.error('Error in autoRemove:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;