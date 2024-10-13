// const express = require('express');
// const pool = require('../db');
// const router = express.Router();  // Use express Router

// router.get('/api/user-ingredients', async (req, res) => {
//     const user_id = 1; // Hardcoded user_id for testing

//     try {
//         const userIngredientsQuery = await pool.query(`
//             SELECT ui.ingredient_id, i.name, ui.amount, ui.unit
//             FROM user_ingredient ui
//             JOIN ingredients i ON ui.ingredient_id = i.ingredient_id
//             WHERE ui.user_id = $1
//         `, [user_id]);

//         console.log('Fetched user ingredients:', userIngredientsQuery.rows); // Log the fetched ingredients

//         if (userIngredientsQuery.rows.length > 0) {
//             res.status(200).json(userIngredientsQuery.rows);
//         } else {
//             res.status(404).json({ message: 'No ingredients found for this user!' });
//         }
//     } catch (err) {
//         console.error('Error fetching user ingredients:', err);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// });

// // GET route to fetch all ingredients
// router.get('/api/ingredients', async (req, res) => {
//     try {
//         const ingredientQuery = await pool.query(
//             'SELECT ingredient_id, name FROM ingredients' // Adjust the query based on your database structure
//         );

//         // Check if any ingredients were found
//         if (ingredientQuery.rows.length > 0) {
//             res.status(200).json(ingredientQuery.rows); // Send the list of ingredients as JSON
//         } else {
//             res.status(404).json({ message: 'No ingredients found!' });
//         }
//     } catch (err) {
//         console.error('Error fetching ingredients:', err);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// });

// router.post('/api/add-ingredient', async (req, res) => {
//     const { ingredient_name, amount, unit } = req.body; // Expecting unit in the request body
//     const user_id = 1; // Hardcoded user_id for testing
//     console.log('Request body:', req.body);
//     try {
//         const lowerCaseIngredientName = ingredient_name.toLowerCase();

//         // Check if the ingredient exists in the ingredients table (case-insensitive)
//         const ingredientQuery = await pool.query(
//             'SELECT ingredient_id FROM ingredients WHERE LOWER(name) = $1',
//             [lowerCaseIngredientName]
//         );

//         let ingredient_id;

//         if (ingredientQuery.rows.length > 0) {
//             ingredient_id = ingredientQuery.rows[0].ingredient_id;
//         } else {
//             // Insert the ingredient if it doesn't exist
//             const insertQuery = await pool.query(
//                 'INSERT INTO ingredients (name) VALUES ($1) RETURNING ingredient_id',
//                 [lowerCaseIngredientName]
//             );

//             ingredient_id = insertQuery.rows[0].ingredient_id;
//         }

//         // Check if the ingredient already exists for the user
//         const userIngredientQuery = await pool.query(
//             'SELECT * FROM user_ingredient WHERE user_id = $1 AND ingredient_id = $2',
//             [user_id, ingredient_id]
//         );
//         console.log('User ingredient query result:', userIngredientQuery.rows);

//         if (userIngredientQuery.rows.length > 0) {
//             console.log('Updating ingredient with:', {
//                 amount,
//                 unit,
//                 user_id,
//                 ingredient_id,
//             });
//             // Update both amount and unit if the ingredient exists for the user
//             await pool.query(
//                 'UPDATE user_ingredient SET amount = $1, unit = $2 WHERE user_id = $3 AND ingredient_id = $4',
//                 [amount, unit, user_id, ingredient_id]
//             );
//         } else {
//             // Insert the new ingredient for the user with amount and unit
//             await pool.query(
//                 'INSERT INTO user_ingredient (user_id, ingredient_id, amount, unit) VALUES ($1, $2, $3, $4)',
//                 [user_id, ingredient_id, amount, unit]
//             );
//         }

//         return res.status(200).json({ message: 'Ingredient added/updated successfully!' });

//     } catch (err) {
//         console.error('Error adding ingredient:', err);
//         return res.status(500).json({ message: 'Internal server error' });
//     }
// });

// // PUT route to modify ingredient amount in user_ingredient table
// router.put('/api/modify-ingredient', async (req, res) => {
//     const { ingredient_name, amount } = req.body; // Expecting ingredient_name and new amount from request body
//     const user_id = 1; // Hardcoded user_id for testing

//     try {
//         // Fetch ingredient_id from ingredients table based on ingredient_name
//         const ingredientQuery = await pool.query(
//             'SELECT ingredient_id FROM ingredients WHERE name = $1',
//             [ingredient_name]
//         );

//         if (ingredientQuery.rows.length === 0) {
//             return res.status(404).json({ message: 'Ingredient not found!' });
//         }

//         const ingredient_id = ingredientQuery.rows[0].ingredient_id;

//         // Check if the ingredient is already in the user_ingredient table for this user
//         const userIngredientQuery = await pool.query(
//             'SELECT * FROM user_ingredient WHERE user_id = $1 AND ingredient_id = $2',
//             [user_id, ingredient_id]
//         );

//         if (userIngredientQuery.rows.length === 0) {
//             return res.status(404).json({ message: 'Ingredient not found in user profile!' });
//         }

//         if (amount > 0) {
//             // Update the amount if it's greater than 0
//             await pool.query(
//                 'UPDATE user_ingredient SET amount = $1 WHERE user_id = $2 AND ingredient_id = $3',
//                 [amount, user_id, ingredient_id]
//             );
//             res.status(200).json({ message: 'Ingredient amount updated successfully!' });
//         } else {
//             // If amount is 0, remove the entry from user_ingredient table
//             await pool.query(
//                 'DELETE FROM user_ingredient WHERE user_id = $1 AND ingredient_id = $2',
//                 [user_id, ingredient_id]
//             );
//             res.status(200).json({ message: 'Ingredient removed successfully!' });
//         }
//     } catch (err) {
//         console.error('Error modifying ingredient amount:', err);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// });

// // PUT route to modify ingredient amount in user_ingredient table
// router.put('/api/modify-ingredient', async (req, res) => {
//     const { ingredient_name, amount } = req.body; // Expecting ingredient_name and new amount from request body
//     const user_id = 1; // Hardcoded user_id for testing

//     try {
//         // Fetch ingredient_id from ingredients table based on ingredient_name
//         const ingredientQuery = await pool.query(
//             'SELECT ingredient_id FROM ingredients WHERE name = $1',
//             [ingredient_name]
//         );

//         if (ingredientQuery.rows.length === 0) {
//             return res.status(404).json({ message: 'Ingredient not found!' });
//         }

//         const ingredient_id = ingredientQuery.rows[0].ingredient_id;

//         // Check if the ingredient is already in the user_ingredient table for this user
//         const userIngredientQuery = await pool.query(
//             'SELECT * FROM user_ingredient WHERE user_id = $1 AND ingredient_id = $2',
//             [user_id, ingredient_id]
//         );

//         if (userIngredientQuery.rows.length === 0) {
//             return res.status(404).json({ message: 'Ingredient not found in user profile!' });
//         }

//         if (amount > 0) {
//             // Update the amount if it's greater than 0
//             await pool.query(
//                 'UPDATE user_ingredient SET amount = $1 WHERE user_id = $2 AND ingredient_id = $3',
//                 [amount, user_id, ingredient_id]
//             );
//             res.status(200).json({ message: 'Ingredient amount updated successfully!' });
//         } else {
//             // If amount is 0, remove the entry from user_ingredient table
//             await pool.query(
//                 'DELETE FROM user_ingredient WHERE user_id = $1 AND ingredient_id = $2',
//                 [user_id, ingredient_id]
//             );
//             res.status(200).json({ message: 'Ingredient removed successfully!' });
//         }
//     } catch (err) {
//         console.error('Error modifying ingredient amount:', err);
//         res.status(500).json({ message: 'Internal server error' });
//     }
// });

// module.exports = router;

const express = require('express');
const pool = require('../db');
const router = express.Router(); // Use express Router
const jwt = require("jsonwebtoken");

// Middleware to authenticate token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extract token from Bearer scheme

    if (!token) {
        console.log("No token found in request headers.");
        return res.status(401).json({ message: 'Token not found' });
    }

    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.log("Error verifying token:", err);
            return res.status(403).json({ message: 'Invalid token' });
        }

        // Log the decoded token for debugging
        console.log("Decoded token:", decoded);

        // Ensure the user_id is available in the decoded token
        if (!decoded || !decoded.id) {
            console.log("No user_id found in token payload.");
            return res.status(403).json({ message: 'Invalid token payload' });
        }

        req.user = decoded; // Assign decoded token to req.user
        console.log("Authenticated user:", req.user);
        next();
    });
};

// POST route to add or update ingredient
router.post('/', authenticateToken, async (req, res) => {
    const { ingredient_name, amount, unit } = req.body; // Expecting unit in the request body
    const user_id = req.user.id; // Get user_id from token
    console.log("USER ID from token:", user_id);

    console.log('Request body:', req.body);

    try {
        const lowerCaseIngredientName = ingredient_name.toLowerCase();

        // Check if the ingredient exists in the ingredients table (case-insensitive)
        const ingredientQuery = await pool.query(
            'SELECT ingredient_id FROM ingredients WHERE LOWER(name) = $1',
            [lowerCaseIngredientName]
        );

        console.log("Ingredient query result:", ingredientQuery.rows);

        let ingredient_id;

        if (ingredientQuery.rows.length > 0) {
            ingredient_id = ingredientQuery.rows[0].ingredient_id;
            console.log("Ingredient found in the database, ID:", ingredient_id);
        } else {
            // Insert the ingredient if it doesn't exist
            console.log("Ingredient not found, inserting new ingredient.");
            const insertQuery = await pool.query(
                'INSERT INTO ingredients (name) VALUES ($1) RETURNING ingredient_id',
                [lowerCaseIngredientName]
            );

            ingredient_id = insertQuery.rows[0].ingredient_id;
            console.log("New ingredient inserted, ID:", ingredient_id);
        }

        // Check if the ingredient already exists for the user
        const userIngredientQuery = await pool.query(
            'SELECT * FROM user_ingredient WHERE user_id = $1 AND ingredient_id = $2',
            [user_id, ingredient_id]
        );

        console.log("User ingredient query result:", userIngredientQuery.rows);

        if (userIngredientQuery.rows.length > 0) {
            if (amount > 0) {
                // If the amount is greater than 0, update the existing entry
                console.log('Updating ingredient with:', {
                    amount,
                    unit,
                    user_id,
                    ingredient_id,
                });
                await pool.query(
                    'UPDATE user_ingredient SET amount = $1, unit = $2 WHERE user_id = $3 AND ingredient_id = $4',
                    [amount, unit, user_id, ingredient_id]
                );
                console.log("Ingredient updated successfully!");
                return res.status(200).json({ message: 'Ingredient updated successfully!' });
            } else {
                // If the amount is 0, delete the entry from the user_ingredient table
                console.log('Deleting ingredient with:', { user_id, ingredient_id });
                await pool.query(
                    'DELETE FROM user_ingredient WHERE user_id = $1 AND ingredient_id = $2',
                    [user_id, ingredient_id]
                );
                console.log("Ingredient deleted successfully!");
                return res.status(200).json({ message: 'Ingredient deleted successfully!' });
            }
        } else {
            // If the ingredient doesn't exist and amount > 0, add it to the user_ingredient table
            if (amount > 0) {
                console.log("Inserting new ingredient for user:", { user_id, ingredient_id, amount, unit });
                await pool.query(
                    'INSERT INTO user_ingredient (user_id, ingredient_id, amount, unit) VALUES ($1, $2, $3, $4)',
                    [user_id, ingredient_id, amount, unit]
                );
                console.log("Ingredient added successfully!");
                return res.status(200).json({ message: 'Ingredient added successfully!' });
            } else {
                // If the amount is 0 and the ingredient doesn't exist, return a 400 error
                console.log("Cannot add ingredient with amount 0.");
                return res.status(400).json({ message: 'Cannot add ingredient with amount 0!' });
            }
        }

    } catch (err) {
        console.error('Error adding or updating ingredient:', err);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
