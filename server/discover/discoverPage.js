const express = require('express');
const axios = require('axios');
const router = express.Router();

// Route to fetch random recipes 
router.get('/random-recipes', async (req, res) => {
    const { number = 10, offset = 0, type, cuisine, diet } = req.query;

    try {
        const apiKey = process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY;
        const params = {
            apiKey,
            number,
            offset,
            addRecipeInformation: true,
            fillIngredients: true
        };

        // Add optional filters if they exist
        if (type) params.type = type;
        if (cuisine) params.cuisine = cuisine;
        if (diet) params.diet = diet;

        const response = await axios.get('https://api.spoonacular.com/recipes/random', { params });

        if (response.status === 200) {
            const formattedRecipes = response.data.recipes.map(recipe => ({
                id: recipe.id,
                title: recipe.title,
                image: recipe.image,
                readyInMinutes: recipe.readyInMinutes,
                servings: recipe.servings,
                totalIngredients: recipe.extendedIngredients?.length || 0,
                extendedIngredients: recipe.extendedIngredients || []
            }));

            res.json({ recipes: formattedRecipes });
        } else {
            res.status(response.status).json({ message: 'Failed to fetch recipes' });
        }
    } catch (error) {
        console.error('Error fetching random recipes:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Get single recipe details 
router.get('/:id', async (req, res) => {
    try {
        const apiKey = process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY;
        const response = await axios.get(`https://api.spoonacular.com/recipes/${req.params.id}/information`, {
            params: {
                apiKey,
                includeNutrition: false
            }
        });
        
        if (response.status === 200) {
            const recipe = {
                id: response.data.id,
                title: response.data.title,
                image: response.data.image,
                readyInMinutes: response.data.readyInMinutes,
                servings: response.data.servings,
                totalIngredients: response.data.extendedIngredients?.length || 0,
                extendedIngredients: response.data.extendedIngredients || [],
                instructions: response.data.instructions,
                sourceName: response.data.sourceName,
                sourceUrl: response.data.sourceUrl
            };

            res.json(recipe);
        } else {
            res.status(response.status).json({ message: 'Failed to fetch recipe details' });
        }
    } catch (error) {
        console.error('Error fetching recipe details:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;