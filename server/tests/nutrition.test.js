// tests/nutrition.test.js

const request = require('supertest');
const app = require('../server');
const db = require('../db');
const jwt = require('jsonwebtoken');

jest.mock('../db');
jest.mock('jsonwebtoken');

describe('Nutrition Endpoints', () => {
    const validToken = 'valid.test.token';
    const testUser = { id: 1 };
    const mockNutritionalData = {
        protein: '50',
        carbohydrates: '200',
        total_fat: '70',
        saturated_fat: '20',
        fiber: '25',
        sodium: '2300',
        sugar: '30',
        calories: '2000'
    };

    beforeEach(() => {
        jest.clearAllMocks();
        jwt.verify.mockImplementation((token, secret, callback) => {
            callback(null, testUser);
        });
    });

    describe('GET /api/nutrition-get', () => {
        test('should fetch nutritional data successfully', async () => {
            db.query
                .mockResolvedValueOnce({ rows: [mockNutritionalData] })
                .mockResolvedValueOnce({ rows: [{ ...mockNutritionalData, protein: '45' }] });

            const response = await request(app)
                .get('/api/nutrition-get')
                .set('Authorization', `Bearer ${validToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('goals');
            expect(response.body).toHaveProperty('consumed');
        });

        test('should handle no data found', async () => {
            db.query
                .mockResolvedValueOnce({ rows: [] })
                .mockResolvedValueOnce({ rows: [] });

            const response = await request(app)
                .get('/api/nutrition-get')
                .set('Authorization', `Bearer ${validToken}`);

            expect(response.status).toBe(200);
            expect(response.body.goals).toBeUndefined();
        });

        test('should handle database error', async () => {
            db.query.mockRejectedValueOnce(new Error('Database error'));

            const response = await request(app)
                .get('/api/nutrition-get')
                .set('Authorization', `Bearer ${validToken}`);

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error');
        });

        test('should reject request without token', async () => {
            const response = await request(app)
                .get('/api/nutrition-get');

            expect(response.status).toBe(401);
        });
    });

    describe('POST /api/nutrition-update', () => {
        test('should update nutritional goals successfully', async () => {
            db.query.mockResolvedValueOnce({ rows: [] });

            const response = await request(app)
                .post('/api/nutrition-update')
                .set('Authorization', `Bearer ${validToken}`)
                .send({
                    goals: mockNutritionalData
                });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Goals updated successfully');
        });

        test('should handle empty values', async () => {
            const emptyData = {
                goals: {
                    ...mockNutritionalData,
                    protein: '',
                    fiber: ''
                }
            };

            db.query.mockResolvedValueOnce({ rows: [] });

            const response = await request(app)
                .post('/api/nutrition-update')
                .set('Authorization', `Bearer ${validToken}`)
                .send(emptyData);

            expect(response.status).toBe(200);
        });

        test('should handle database error', async () => {
            db.query.mockRejectedValueOnce(new Error('Database error'));

            const response = await request(app)
                .post('/api/nutrition-update')
                .set('Authorization', `Bearer ${validToken}`)
                .send({
                    goals: mockNutritionalData
                });

            expect(response.status).toBe(500);
            expect(response.body).toHaveProperty('error');
        });

        test('should handle invalid token', async () => {
            jwt.verify.mockImplementation((token, secret, callback) => {
                callback(new Error('Invalid token'), null);
            });

            const response = await request(app)
                .post('/api/nutrition-update')
                .set('Authorization', `Bearer invalid.token`)
                .send({
                    goals: mockNutritionalData
                });

            expect(response.status).toBe(403);
        });

        test('should handle missing goals data', async () => {
            const response = await request(app)
                .post('/api/nutrition-update')
                .set('Authorization', `Bearer ${validToken}`)
                .send({});

            expect(response.status).toBe(500);
        });
    });
});