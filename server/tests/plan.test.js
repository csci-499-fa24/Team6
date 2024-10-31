// tests/plan.test.js

const request = require('supertest');
const app = require('../server');
const db = require('../db');
const jwt = require('jsonwebtoken');
const axios = require('axios');

jest.mock('../db');
jest.mock('jsonwebtoken');
jest.mock('axios');

describe('Plan Endpoints', () => {
    const validToken = 'valid.test.token';
    const testUser = { id: 1 };

    beforeEach(() => {
        jest.clearAllMocks();
        jwt.verify.mockImplementation((token, secret, callback) => {
            callback(null, testUser);
        });
    });

    describe('GET /api/plan/user-recipes', () => {
        test('should fetch user recipes successfully', async () => {
            db.query.mockResolvedValueOnce({ rows: [{ recipe_id: 123 }, { recipe_id: 456 }] });

            axios.request.mockResolvedValueOnce({
                data: [
                    { id: 123, title: 'Test Recipe', readyInMinutes: 30, servings: 4 },
                    { id: 456, title: 'Another Recipe', readyInMinutes: 20, servings: 2 }
                ]
            });

            const response = await request(app)
                .get('/api/plan/user-recipes')
                .set('Authorization', `Bearer ${validToken}`);

            expect(response.status).toBe(200);
            expect(response.body.recipes).toHaveLength(2);
        });

        test('should handle empty recipe list', async () => {
            db.query.mockResolvedValueOnce({ rows: [] });

            const response = await request(app)
                .get('/api/plan/user-recipes')
                .set('Authorization', `Bearer ${validToken}`);

            expect(response.status).toBe(200);
            expect(response.body.recipes).toHaveLength(0);
        });

        test('should handle API error', async () => {
            db.query.mockResolvedValueOnce({ rows: [{ recipe_id: 123 }] });
            axios.request.mockRejectedValueOnce(new Error('API Error'));

            const response = await request(app)
                .get('/api/plan/user-recipes')
                .set('Authorization', `Bearer ${validToken}`);

            expect(response.status).toBe(500);
        });
    });

    describe('DELETE /api/plan/remove-recipe', () => {
        test('should remove recipe successfully', async () => {
            db.query.mockResolvedValueOnce({ rowCount: 1 });

            const response = await request(app)
                .delete('/api/plan/remove-recipe')
                .set('Authorization', `Bearer ${validToken}`)
                .send({ recipeId: 123 });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Recipe removed from plan successfully.');
        });

        test('should handle non-existent recipe', async () => {
            db.query.mockResolvedValueOnce({ rowCount: 0 });

            const response = await request(app)
                .delete('/api/plan/remove-recipe')
                .set('Authorization', `Bearer ${validToken}`)
                .send({ recipeId: 999 });

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('Recipe not found in your plan.');
        });

        test('should handle database error', async () => {
            db.query.mockRejectedValueOnce(new Error('Database error'));

            const response = await request(app)
                .delete('/api/plan/remove-recipe')
                .set('Authorization', `Bearer ${validToken}`)
                .send({ recipeId: 123 });

            expect(response.status).toBe(500);
        });
    });

    describe('Authentication', () => {
        test('should reject requests without token', async () => {
            const response = await request(app)
                .get('/api/plan/user-recipes');

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Token not found');
        });

        test('should reject invalid token', async () => {
            jwt.verify.mockImplementation((token, secret, callback) => {
                callback(new Error('Invalid token'), null);
            });

            const response = await request(app)
                .get('/api/plan/user-recipes')
                .set('Authorization', 'Bearer invalid.token');

            expect(response.status).toBe(403);
        });
    });
});
