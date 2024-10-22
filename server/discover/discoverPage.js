const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/random-recipes', async (req, res) => {
    const { number = 12, offset = 0, type, cuisine, diet, search } = req.query;

    try {
        const apiKey = process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY;

        // If a search query or filters are provided, use the complexSearch endpoint
        if (search || type || cuisine || diet) {
            const searchParams = {
                apiKey,
                number,
                offset,
                query: search || '', 
                type: type || '', 
                cuisine: cuisine || '', 
                diet: diet || '', 
                addRecipeInformation: true,
                sort: 'popularity', 
            };

            const response = await axios.get('https://api.spoonacular.com/recipes/complexSearch', { params: searchParams });

            if (response.status === 200) {
                const formattedRecipes = response.data.results.map(recipe => ({
                    id: recipe.id,
                    title: recipe.title,
                    image: recipe.image,
                    readyInMinutes: recipe.readyInMinutes,
                    servings: recipe.servings,
                    totalIngredients: recipe.extendedIngredients?.length || 0,
                }));

                res.json({ recipes: formattedRecipes });
            } else {
                res.status(response.status).json({ message: 'Failed to fetch recipes with the provided search query.' });
            }

        } else {
            // If no search query or filters, fetch random recipes 
            const params = {
                apiKey,
                number,
                offset,
                addRecipeInformation: true,
                fillIngredients: true,
            };

            const response = await axios.get('https://api.spoonacular.com/recipes/random', { params });

            if (response.status === 200) {
                const formattedRecipes = response.data.recipes.map(recipe => ({
                    id: recipe.id,
                    title: recipe.title,
                    image: recipe.image,
                    readyInMinutes: recipe.readyInMinutes,
                    servings: recipe.servings,
                    totalIngredients: recipe.extendedIngredients?.length || 0,
                }));

                res.json({ recipes: formattedRecipes });
            } else {
                res.status(response.status).json({ message: 'Failed to fetch random recipes.' });
            }
        }
    } catch (error) {
        console.error('Error fetching recipes:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;