// tests/discover.test.js

const request = require('supertest');
const app = require('../server');
const axios = require('axios');

// Mock axios
jest.mock('axios');

describe('Discover Endpoints', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Mock recipe data
    const mockRecipe = {
        id: 1,
        title: 'Test Recipe',
        image: 'test.jpg',
        readyInMinutes: 30,
        servings: 4,
        extendedIngredients: [
            { id: 1, name: 'ingredient1' },
            { id: 2, name: 'ingredient2' }
        ]
    };

    describe('GET /api/discover/random-recipes', () => {
        test('should fetch random recipes successfully', async () => {
            axios.get.mockResolvedValue({
                status: 200,
                data: {
                    recipes: [mockRecipe, mockRecipe] // Array of recipes for random endpoint
                }
            });

            const response = await request(app)
                .get('/api/discover/random-recipes');

            expect(response.status).toBe(200);
            expect(response.body.recipes).toBeInstanceOf(Array);
        });

        test('should fetch filtered recipes with search query', async () => {
            axios.get.mockResolvedValue({
                status: 200,
                data: {
                    results: [mockRecipe] // Array of results for search endpoint
                }
            });

            const response = await request(app)
                .get('/api/discover/random-recipes')
                .query({ search: 'pasta' });

            expect(response.status).toBe(200);
            expect(response.body.recipes).toBeInstanceOf(Array);
        });

        test('should handle cuisine filter', async () => {
            axios.get.mockResolvedValue({
                status: 200,
                data: {
                    results: [mockRecipe]
                }
            });

            const response = await request(app)
                .get('/api/discover/random-recipes')
                .query({ cuisine: 'italian' });

            expect(response.status).toBe(200);
            expect(response.body.recipes).toBeInstanceOf(Array);
        });

        test('should handle multiple filters', async () => {
            axios.get.mockResolvedValue({
                status: 200,
                data: {
                    results: [mockRecipe]
                }
            });

            const response = await request(app)
                .get('/api/discover/random-recipes')
                .query({
                    cuisine: 'italian',
                    diet: 'vegetarian',
                    type: 'main course'
                });

            expect(response.status).toBe(200);
            expect(response.body.recipes).toBeInstanceOf(Array);
        });

        test('should handle pagination parameters for random recipes', async () => {
            axios.get.mockResolvedValue({
                status: 200,
                data: {
                    recipes: Array(6).fill(mockRecipe) // Create array of 6 recipes
                }
            });

            const response = await request(app)
                .get('/api/discover/random-recipes')
                .query({ number: 6, offset: 12 });

            expect(response.status).toBe(200);
            expect(response.body.recipes).toBeInstanceOf(Array);
        });

        test('should handle pagination parameters for search', async () => {
            axios.get.mockResolvedValue({
                status: 200,
                data: {
                    results: Array(6).fill(mockRecipe) // Create array of 6 recipes
                }
            });

            const response = await request(app)
                .get('/api/discover/random-recipes')
                .query({ number: 6, offset: 12, search: 'pasta' });

            expect(response.status).toBe(200);
            expect(response.body.recipes).toBeInstanceOf(Array);
        });

        test('should handle API error response', async () => {
            axios.get.mockRejectedValue(new Error('API Error'));

            const response = await request(app)
                .get('/api/discover/random-recipes');

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('message', 'Internal server error');
        });

        test('should handle empty results', async () => {
            axios.get.mockResolvedValue({
                status: 200,
                data: {
                    results: [] // Empty results for search
                }
            });

            const response = await request(app)
                .get('/api/discover/random-recipes')
                .query({ search: 'nonexistentrecipe' });

            expect(response.status).toBe(200);
            expect(response.body.recipes).toHaveLength(0);
        });

        test('should handle empty random recipes', async () => {
            axios.get.mockResolvedValue({
                status: 200,
                data: {
                    recipes: [] // Empty recipes for random endpoint
                }
            });

            const response = await request(app)
                .get('/api/discover/random-recipes');

            expect(response.status).toBe(200);
            expect(response.body.recipes).toHaveLength(0);
        });
    });
});