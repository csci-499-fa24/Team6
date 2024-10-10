const express = require('express');
const bcrypt = require('bcrypt');
const db = require('./db'); 
const router = express.Router();

router.post('/', async (req, res) => {
    console.log('Received registration request:', JSON.stringify(req.body, null, 2));
    const { firstName, lastName, email, password, phoneNumber, ingredients, allergy, nutritionalGoals } = req.body;

    try {
        // Check if email already exists
        const checkEmailQuery = 'SELECT * FROM users WHERE email = $1';
        const emailCheck = await db.query(checkEmailQuery, [email]);
        if (emailCheck.rows.length > 0) {
            return res.status(400).json({ message: 'Email already in use' });
        }

        // Insert user
        const hashedPassword = await bcrypt.hash(password, 10);
        const insertUserQuery = 'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING user_id';
        const userResult = await db.query(insertUserQuery, [email, hashedPassword]);
        const userId = userResult.rows[0].user_id;

        // Insert user profile
        const insertProfileQuery = 'INSERT INTO user_profiles (user_id, first_name, last_name, phone, email) VALUES ($1, $2, $3, $4, $5)';
        await db.query(insertProfileQuery, [userId, firstName, lastName, phoneNumber, email]);

        // Insert ingredients
        if (ingredients && ingredients.length > 0) {
            for (let ingredient of ingredients) {
                try {
                    const { ingredient: ingredientName, quantity, units } = ingredient;
                    const findIngredientQuery = 'SELECT ingredient_id FROM ingredients WHERE name = $1';
                    const ingredientResult = await db.query(findIngredientQuery, [ingredientName]);
                    if (ingredientResult.rows.length > 0) {
                        const ingredientId = ingredientResult.rows[0].ingredient_id;
                        const insertUserIngredientQuery = 'INSERT INTO user_ingredient (user_id, ingredient_id, amount, unit) VALUES ($1, $2, $3, $4) ON CONFLICT (user_id, ingredient_id) DO UPDATE SET amount = EXCLUDED.amount, unit = EXCLUDED.unit';
                        await db.query(insertUserIngredientQuery, [userId, ingredientId, quantity, units]);
                    } else {
                        console.log(`Ingredient not found: ${ingredientName}`);
                    }
                } catch (ingredientError) {
                    console.error('Error inserting ingredient:', ingredientError);
                }
            }
        }

        // Insert allergies
        if (allergy && allergy.length > 0) {
            for (let allergen of allergy) {
                try {
                    const insertAllergenQuery = 'INSERT INTO user_allergens (user_id, allergen) VALUES ($1, $2) ON CONFLICT DO NOTHING';
                    await db.query(insertAllergenQuery, [userId, allergen]);
                } catch (allergenError) {
                    console.error('Error inserting allergen:', allergenError);
                }
            }
        }

        // Insert or update nutritional goals
        if (nutritionalGoals) {
            const { protein, carbohydrates, total_fat, saturated_fat, fiber, sodium, sugar } = nutritionalGoals;
            
            // Convert empty strings to null before inserting
            const cleanValue = (value) => (value === '' ? null : value);

            const upsertNutritionQuery = `
                INSERT INTO user_nutritional_goals 
                (user_id, protein, carbohydrates, total_fat, saturated_fat, fiber, sodium, sugar)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                ON CONFLICT (user_id) 
                DO UPDATE SET 
                    protein = EXCLUDED.protein,
                    carbohydrates = EXCLUDED.carbohydrates,
                    total_fat = EXCLUDED.total_fat,
                    saturated_fat = EXCLUDED.saturated_fat,
                    fiber = EXCLUDED.fiber,
                    sodium = EXCLUDED.sodium,
                    sugar = EXCLUDED.sugar
            `;
            await db.query(upsertNutritionQuery, [
                userId,
                cleanValue(protein),
                cleanValue(carbohydrates),
                cleanValue(total_fat),
                cleanValue(saturated_fat),
                cleanValue(fiber),
                cleanValue(sodium),
                cleanValue(sugar)
            ]);
        }

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'An error occurred during registration', error: error.message });
    }
});

module.exports = router;