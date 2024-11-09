const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const pool = require('../db');
const favoritesRouter = require('../favoriteBackend/favorites');

// Mock the database pool
jest.mock('../db', () => ({
    query: jest.fn()
}));

// Mock axios
jest.mock('axios');

// Mock jsonwebtoken
jest.mock('jsonwebtoken');

const app = express();
app.use(express.json());
app.use('/favorites', favoritesRouter);

describe('Favorites Router', () => {
    const validToken = 'validToken';
    const userId = 1;
    const recipeId = 123456;

    beforeEach(() => {
        jest.clearAllMocks();
        // Default JWT verification mock
        jwt.verify = jest.fn((token, secret, callback) => {
            if (token === validToken) {
                callback(null, { id: userId });
            } else {
                callback(new Error('Invalid token'));
            }
        });
    });

    describe('POST /favorites', () => {
        test('should add recipe to favorites', async () => {
            // Mock recipe not already in favorites
            pool.query
                .mockResolvedValueOnce({ rows: [] })  // Check existing
                .mockResolvedValueOnce({ rows: [{ id: 1 }] });  // Insert

            const response = await request(app)
                .post('/favorites')
                .set('Authorization', `Bearer ${validToken}`)
                .send({ recipeId });

            expect(response.status).toBe(201);
            expect(response.body.message).toBe('Recipe added to your favorites.');
        });

        test('should prevent duplicate favorites', async () => {
            // Mock recipe already in favorites
            pool.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });

            const response = await request(app)
                .post('/favorites')
                .set('Authorization', `Bearer ${validToken}`)
                .send({ recipeId });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Recipe already in favorites.');
        });

        test('should handle database errors', async () => {
            pool.query.mockRejectedValueOnce(new Error('Database error'));

            const response = await request(app)
                .post('/favorites')
                .set('Authorization', `Bearer ${validToken}`)
                .send({ recipeId });

            expect(response.status).toBe(500);
            expect(response.body.message).toBe('Failed to add recipe to favorites.');
        });
    });

    describe('DELETE /favorites', () => {
        test('should remove recipe from favorites', async () => {
            // Mock recipe exists in favorites
            pool.query
                .mockResolvedValueOnce({ rows: [{ id: 1 }] })  // Check existing
                .mockResolvedValueOnce({ rows: [{ id: 1 }] });  // Delete

            const response = await request(app)
                .delete('/favorites')
                .set('Authorization', `Bearer ${validToken}`)
                .send({ recipeId });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Recipe removed from your favorites.');
        });

        test('should handle non-existent favorite', async () => {
            // Mock recipe not in favorites
            pool.query.mockResolvedValueOnce({ rows: [] });

            const response = await request(app)
                .delete('/favorites')
                .set('Authorization', `Bearer ${validToken}`)
                .send({ recipeId });

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Recipe not found in favorites.');
        });

        test('should handle database errors on delete', async () => {
            pool.query.mockRejectedValueOnce(new Error('Database error'));

            const response = await request(app)
                .delete('/favorites')
                .set('Authorization', `Bearer ${validToken}`)
                .send({ recipeId });

            expect(response.status).toBe(500);
            expect(response.body.message).toBe('Failed to remove recipe from favorites.');
        });
    });

    // describe('GET /favorites', () => {
    //     const mockRecipeDetails = {
    //         id: recipeId,
    //         title: 'Test Recipe',
    //         instructions: 'Test Instructions'
    //     };

    //     test('should get all favorite recipes', async () => {
    //         // Mock database response for favorites
    //         pool.query.mockResolvedValueOnce({
    //             rows: [{ recipe_id: recipeId }]
    //         });

    //         // Mock API response
    //         axios.get.mockResolvedValueOnce({ data: mockRecipeDetails });

    //         const response = await request(app)
    //             .get('/favorites')
    //             .set('Authorization', `Bearer ${validToken}`);

    //         expect(response.status).toBe(200);
    //         expect(response.body.recipes).toHaveLength(1);
    //         expect(response.body.recipes[0]).toEqual(mockRecipeDetails);
    //     });

    //     test('should handle empty favorites list', async () => {
    //         // Mock empty favorites list
    //         pool.query.mockResolvedValueOnce({ rows: [] });

    //         const response = await request(app)
    //             .get('/favorites')
    //             .set('Authorization', `Bearer ${validToken}`);

    //         expect(response.status).toBe(200);
    //         expect(response.body.recipes).toHaveLength(0);
    //         expect(response.body.message).toBe('No favorite recipes found for this user.');
    //     });

    //     test('should handle API errors', async () => {
    //         pool.query.mockResolvedValueOnce({
    //             rows: [{ recipe_id: recipeId }]
    //         });

    //         axios.get.mockRejectedValueOnce(new Error('API error'));

    //         const response = await request(app)
    //             .get('/favorites')
    //             .set('Authorization', `Bearer ${validToken}`);

    //         expect(response.status).toBe(500);
    //         expect(response.body.message).toBe('Failed to retrieve favorite recipes.');
    //     });
    // });

    // describe('Authentication', () => {
    //     test('should require authentication token', async () => {
    //         const response = await request(app)
    //             .get('/favorites');

    //         expect(response.status).toBe(401);
    //         expect(response.body.message).toBe('Token not found');
    //     });

    //     test('should reject invalid token', async () => {
    //         const response = await request(app)
    //             .get('/favorites')
    //             .set('Authorization', 'Bearer invalidToken');

    //         expect(response.status).toBe(403);
    //         expect(response.body.message).toBe('Invalid token');
    //     });
    // });
    describe('GET /favorites', () => {
        const mockRecipeDetails = {
            id: recipeId,
            title: 'Test Recipe',
            instructions: 'Test Instructions'
        };

        test('should get all favorite recipes', async () => {
            // Mock database response for favorites
            pool.query.mockResolvedValueOnce({
                rows: [{ recipe_id: recipeId }]
            });

            // Mock API response to return an array of recipes
            axios.get.mockResolvedValueOnce({ data: [mockRecipeDetails] });

            const response = await request(app)
                .get('/favorites')
                .set('Authorization', `Bearer ${validToken}`);

            expect(response.status).toBe(200);
            expect(response.body.recipes).toHaveLength(1);
            expect(response.body.recipes[0]).toEqual(mockRecipeDetails);
        });

        test('should handle empty favorites list', async () => {
            // Mock empty favorites list
            pool.query.mockResolvedValueOnce({ rows: [] });

            const response = await request(app)
                .get('/favorites')
                .set('Authorization', `Bearer ${validToken}`);

            expect(response.status).toBe(200);
            expect(response.body.recipes).toHaveLength(0);
            expect(response.body.message).toBe('No favorite recipes found for this user.');
        });

        test('should handle API errors', async () => {
            // Mock database response for favorites
            pool.query.mockResolvedValueOnce({
                rows: [{ recipe_id: recipeId }]
            });

            // Mock API error response
            axios.get.mockRejectedValueOnce(new Error('API error'));

            const response = await request(app)
                .get('/favorites')
                .set('Authorization', `Bearer ${validToken}`);

            expect(response.status).toBe(500);
            expect(response.body.message).toBe('Failed to retrieve favorite recipes.');
        });
    });

    describe('Authentication', () => {
        test('should require authentication token', async () => {
            const response = await request(app)
                .get('/favorites');

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Token not found');
        });

        test('should reject invalid token', async () => {
            const response = await request(app)
                .get('/favorites')
                .set('Authorization', 'Bearer invalidToken');

            expect(response.status).toBe(403);
            expect(response.body.message).toBe('Invalid token');
        });
    });
});
