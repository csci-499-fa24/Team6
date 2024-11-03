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
            `SELECT amount FROM user_ingredient 
             WHERE user_id = $1 AND ingredient_id = $2`,
            [user_id, ingredient_id]
        );

        if (userIngredientResult.rows.length > 0) {
            const currentAmount = userIngredientResult.rows[0].amount;
            const newAmount = currentAmount - ingredient.amount;

            if (newAmount > 0) {
                // Update the row with the new amount
                // await pool.query(
                //     `UPDATE user_ingredient SET amount = $1 
                //      WHERE user_id = $2 AND ingredient_id = $3 AND unit = $4`,
                //     [newAmount, user_id, ingredient_id, ingredient.unit]
                // );
                await pool.query(
                    `UPDATE user_ingredient SET amount = $1 
                     WHERE user_id = $2 AND ingredient_id = $3`,
                    [newAmount, user_id, ingredient_id]
                );
            } else {
                // Delete the row if the new amount is zero or less
                // await pool.query(
                //     `DELETE FROM user_ingredient 
                //      WHERE user_id = $1 AND ingredient_id = $2 AND unit = $3`,
                //     [user_id, ingredient_id, ingredient.unit]
                // );
                await pool.query(
                    `DELETE FROM user_ingredient 
                     WHERE user_id = $1 AND ingredient_id = $2`,
                    [user_id, ingredient_id]
                );
            }
        }
    }

});
module.exports = router;