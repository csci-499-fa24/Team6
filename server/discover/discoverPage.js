const express = require('express');
const axios = require('axios');
const router = express.Router();

router.get('/random-recipes', async (req, res) => {
    const { number = 12, offset = 0, type, cuisine, diet, search, intolerances } = req.query;

    try {
        const headers = {
            'x-rapidapi-key': process.env.NEXT_PUBLIC_SPOONACULAR_API_KEY,
            'x-rapidapi-host': 'spoonacular-recipe-food-nutrition-v1.p.rapidapi.com',
        };

        // If a search query or filters are provided, use the complexSearch endpoint
        if (search || type || cuisine || diet || intolerances) {
            const searchParams = {
                number,
                offset,
                query: search || '',
                type: type || '',
                cuisine: cuisine || '',
                diet: diet || '',
                intolerances: intolerances || '', // Add intolerances parameter
                addRecipeInformation: true,
                sort: 'popularity',
            };

            const response = await axios.get(
                'https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/complexSearch',
                { params: searchParams, headers }
            );

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
                number,
                offset,
                addRecipeInformation: true,
                fillIngredients: true,
                intolerances: intolerances || '',
            };

            const response = await axios.get('https://spoonacular-recipe-food-nutrition-v1.p.rapidapi.com/recipes/random', { params, headers });

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
