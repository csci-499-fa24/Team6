const express = require('express');
const axios = require('axios');
const router = express.Router();

router.post('/shopping-list', async (req, res) => {
    const { recipeIds } = req.body;

    if (!recipeIds || !Array.isArray(recipeIds)) {
        return res.status(400).json({ error: 'Invalid recipeIds format.' });
    }

    try {
        const response = await axios.get('https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/informationBulk', {
            params: {
                ids: recipeIds.join(','),
                includeNutrition: true,
            },
            headers: {
                'X-RapidAPI-Key': process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY,
                'X-RapidAPI-Host': 'spoonacular-recipe-food-nutrition-v1.p.rapidapi.com',
            },
        });

        const processedRecipes = Object.values(response.data).map(recipe => {
            const nutrition = recipe.nutrition?.nutrients ? recipe.nutrition.nutrients.map(nutrient => ({
                name: nutrient.name,
                amount: nutrient.amount,
                unit: nutrient.unit,
            })) : [];


            const ingredients = recipe.extendedIngredients.map(ingredient => ({
                id: ingredient.id,
                name: ingredient.nameClean,
                amount: ingredient.amount,
                unit: ingredient.unit
              }));

            return {
                id: recipe.id,
                title: recipe.title,
                nutrition,
                ingredients,
            };
        });

        const allIngredients = processedRecipes.flatMap(recipe => recipe.ingredients)

        const combinedIngredients = Object.values(
            allIngredients.reduce((acc, ingredient) => {
                if (!acc[ingredient.id]) {
                    acc[ingredient.id] = { ...ingredient };
                } else {
                    acc[ingredient.id].amount += ingredient.amount;
                }
                return acc;
            }, {})
        );

        res.json({
            recipes: processedRecipes,
            combinedIngredients,
        });

    } catch (error) {
        console.error('Error fetching recipe details:', error.message);
        res.status(500).json({ error: 'Failed to fetch recipe details.' });
    }
});

router.post('/adjust-shopping-list', (req, res) => {
    const { combinedIngredients, userIngredients } = req.body;

    if (!Array.isArray(combinedIngredients) || !Array.isArray(userIngredients)) {
        return res.status(400).json({ error: 'Invalid input format.' });
    }

    try {
        const adjustedIngredients = combinedIngredients.map((combinedIngredient) => {
            const userIngredient = userIngredients.find(
                (userIngredient) => userIngredient.name === combinedIngredient.name
            );

            if (userIngredient) {
                if (userIngredient.amount >= combinedIngredient.amount) {
                    return null;
                } else {
                    return {
                        ...combinedIngredient,
                        amount: combinedIngredient.amount - userIngredient.amount
                    };
                }
            }

            return combinedIngredient;
        }).filter(Boolean);

        res.json({ adjustedIngredients });
    } catch (error) {
        console.error('Error adjusting shopping list:', error.message);
        res.status(500).json({ error: 'Failed to adjust shopping list.' });
    }
});

module.exports = router;
