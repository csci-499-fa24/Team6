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
            type,    
            cuisine, 
            diet     
        };

        const response = await axios.get('https://api.spoonacular.com/recipes/random', { params });

        if (response.status === 200) {
            res.json(response.data);
        } else {
            res.status(response.status).json({ message: 'Failed to fetch recipes' });
        }
    } catch (error) {
        console.error('Error fetching random recipes:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
