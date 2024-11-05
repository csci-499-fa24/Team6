const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../db');
const axios = require('axios');
const planAddRouter = require('../plan/planAdd');

// Mock modules
jest.mock('../db');
jest.mock('jsonwebtoken');
jest.mock('axios');
global.fetch = jest.fn();

// Create Express app for testing
const app = express();
app.use(express.json());
app.use('/api/plan', planAddRouter);

describe('Plan Add Endpoint', () => {
    const validToken = 'valid.test.token';
    const testUser = { id: 1 };
    const mockNutrients = {
        nutrients: [
            { name: "Calories", amount: 200 },
            { name: "Protein", amount: 10 },
            { name: "Carbohydrates", amount: 30 },
            { name: "Fat", amount: 8 },
            { name: "Saturated Fat", amount: 2 },
            { name: "Fiber", amount: 4 },
            { name: "Sodium", amount: 400 },
            { name: "Sugar", amount: 5 }
        ]
    };

    beforeEach(() => {
        jest.clearAllMocks();
        global.fetch = jest.fn(() => 
            Promise.resolve({
                json: () => Promise.resolve(mockNutrients)
            })
        );
        jwt.verify.mockImplementation((token, secret, callback) => {
            if (token === validToken) {
                callback(null, testUser);
            } else {
                callback(new Error('Invalid token'));
            }
        });
    });

    describe('POST /api/plan', () => {
        test('should add new recipe and create nutrition data', async () => {
            db.query
                .mockResolvedValueOnce({ rows: [] })
                .mockResolvedValueOnce({ rows: [] })
                .mockResolvedValueOnce({ rows: [] })
                .mockResolvedValueOnce({ rows: [] });

            const response = await request(app)
                .post('/api/plan')
                .set('Authorization', `Bearer ${validToken}`)
                .send({ recipeId: 123 });

            expect(response.status).toBe(201);
            expect(response.body.message).toBe('Recipe added to your history.');
            expect(db.query).toHaveBeenCalledTimes(4);
        });

        test('should update existing nutrition data', async () => {
            const existingNutrition = {
                rows: [{
                    protein: 20,
                    carbohydrates: 40,
                    total_fat: 15,
                    saturated_fat: 5,
                    fiber: 8,
                    sodium: 800,
                    sugar: 10,
                    calories: 400
                }]
            };

            db.query
                .mockResolvedValueOnce({ rows: [] })
                .mockResolvedValueOnce({ rows: [] })
                .mockResolvedValueOnce(existingNutrition)
                .mockResolvedValueOnce({ rows: [] });

            const response = await request(app)
                .post('/api/plan')
                .set('Authorization', `Bearer ${validToken}`)
                .send({ recipeId: 123 });

            expect(response.status).toBe(201);
            expect(response.body.message).toBe('Recipe added to your history.');
            expect(db.query).toHaveBeenCalledTimes(4);
        });

        test('should handle API errors', async () => {
            global.fetch.mockImplementationOnce(() => Promise.reject(new Error('API Error')));

            const response = await request(app)
                .post('/api/plan')
                .set('Authorization', `Bearer ${validToken}`)
                .send({ recipeId: 123 });

            expect(response.status).toBe(500);
            expect(response.body.message).toBe('Failed to add recipe to history.');
        });

        test('should handle database errors', async () => {
            db.query.mockRejectedValueOnce(new Error('Database error'));

            const response = await request(app)
                .post('/api/plan')
                .set('Authorization', `Bearer ${validToken}`)
                .send({ recipeId: 123 });

            expect(response.status).toBe(500);
            expect(response.body.message).toBe('Failed to add recipe to history.');
        });
    });

    describe('Authentication', () => {
        test('should reject requests without token', async () => {
            const response = await request(app)
                .post('/api/plan')
                .send({ recipeId: 123 });

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Token not found');
        });

        test('should reject invalid token', async () => {
            const response = await request(app)
                .post('/api/plan')
                .set('Authorization', 'Bearer invalid.token')
                .send({ recipeId: 123 });

            expect(response.status).toBe(403);
        });
    });
});
