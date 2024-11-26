const request = require('supertest');
const express = require('express');
const shoppingListRouter = require('../discover/shoppingList');
const axios = require('axios');
jest.mock('axios');

describe('Shopping List Routes', () => {
    let app;

    beforeAll(() => {
        app = express();
        app.use(express.json());
        app.use('/', shoppingListRouter);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /shopping-list', () => {
        it('should return 400 if recipeIds is not provided or not an array', async () => {
            const res = await request(app)
                .post('/shopping-list')
                .send({ recipeIds: 'invalid' });

            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('error', 'Invalid recipeIds format.');
        });

        it('should return processed recipes and combined ingredients', async () => {
            const mockData = [
                {
                    id: 1,
                    title: 'Recipe 1',
                    extendedIngredients: [
                        { id: 101, nameClean: 'tomato', amount: 2, unit: 'pcs' }
                    ],
                    nutrition: {
                        nutrients: [{ name: 'Protein', amount: 10, unit: 'g' }]
                    }
                }
            ];

            axios.get.mockResolvedValue({ data: mockData });

            const res = await request(app)
                .post('/shopping-list')
                .send({ recipeIds: [1] });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('recipes');
            expect(res.body).toHaveProperty('combinedIngredients');
            expect(res.body.recipes[0].title).toBe('Recipe 1');
            expect(axios.get).toHaveBeenCalledTimes(1);
        });

        it('should handle external API errors gracefully', async () => {
            axios.get.mockRejectedValue(new Error('API failed'));

            const res = await request(app)
                .post('/shopping-list')
                .send({ recipeIds: [1] });

            expect(res.statusCode).toBe(500);
            expect(res.body).toHaveProperty('error', 'Failed to fetch recipe details.');
        });
    });

    describe('POST /adjust-shopping-list', () => {
        it('should return 400 if inputs are not arrays', async () => {
            const res = await request(app)
                .post('/adjust-shopping-list')
                .send({ combinedIngredients: 'invalid', userIngredients: [] });

            expect(res.statusCode).toBe(400);
            expect(res.body).toHaveProperty('error', 'Invalid input format.');
        });

        it('should return adjusted ingredients correctly', async () => {
            const combinedIngredients = [
                { name: 'tomato', amount: 5, unit: 'pcs' }
            ];
            const userIngredients = [
                { name: 'tomato', amount: 3 }
            ];

            const res = await request(app)
                .post('/adjust-shopping-list')
                .send({ combinedIngredients, userIngredients });

            expect(res.statusCode).toBe(200);
            expect(res.body.adjustedIngredients).toEqual([
                { name: 'tomato', amount: 2, unit: 'pcs' }
            ]);
        });

        it('should return an empty array if no adjustment is needed', async () => {
            const combinedIngredients = [
                { name: 'tomato', amount: 2, unit: 'pcs' }
            ];
            const userIngredients = [
                { name: 'tomato', amount: 3 }
            ];

            const res = await request(app)
                .post('/adjust-shopping-list')
                .send({ combinedIngredients, userIngredients });

            expect(res.statusCode).toBe(200);
            expect(res.body.adjustedIngredients).toEqual([]);
        });
    });
});
