// tests/allergen.test.js

const request = require('supertest');
const app = require('../server');
const db = require('../db');
const jwt = require('jsonwebtoken');

// Mock the database and jwt
jest.mock('../db');
jest.mock('jsonwebtoken');

describe('Allergen Endpoints', () => {
    // Test user data
    const testUser = {
        id: 1,
        email: 'test@example.com'
    };

    // Test token
    const validToken = 'valid.test.token';

    beforeEach(() => {
        jest.clearAllMocks();
        // Mock JWT verify for all tests
        jwt.verify.mockImplementation((token, secret, callback) => {
            callback(null, testUser);
        });
    });

    // GET /api/allergies Tests
    describe('GET /api/allergies', () => {
        test('should get user allergens successfully', async () => {
            // Mock database response
            db.query.mockResolvedValue({
                rows: [
                    { allergen: 'peanuts' },
                    { allergen: 'shellfish' }
                ]
            });

            const response = await request(app)
                .get('/api/allergies')
                .set('Authorization', `Bearer ${validToken}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.allergies).toHaveLength(2);
            expect(db.query).toHaveBeenCalledWith(
                expect.any(String),
                [testUser.id]
            );
        });

        test('should handle JSON formatted allergens', async () => {
            db.query.mockResolvedValue({
                rows: [
                    { allergen: '{"allergen":"peanuts"}' },
                    { allergen: '{"allergen":"shellfish"}' }
                ]
            });

            const response = await request(app)
                .get('/api/allergies')
                .set('Authorization', `Bearer ${validToken}`);

            expect(response.status).toBe(200);
            expect(response.body.allergies).toContain('peanuts');
            expect(response.body.allergies).toContain('shellfish');
        });

        test('should handle database error', async () => {
            db.query.mockRejectedValue(new Error('Database error'));

            const response = await request(app)
                .get('/api/allergies')
                .set('Authorization', `Bearer ${validToken}`);

            expect(response.status).toBe(500);
            expect(response.body.success).toBe(false);
        });

        test('should fail without token', async () => {
            const response = await request(app)
                .get('/api/allergies');

            expect(response.status).toBe(401);
        });
    });

    // POST /api/allergies/add Tests
    describe('POST /api/allergies/add', () => {
        test('should add allergen successfully', async () => {
            db.query.mockResolvedValue({});

            const response = await request(app)
                .post('/api/allergies/add')
                .set('Authorization', `Bearer ${validToken}`)
                .send({ allergy: 'peanuts' });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(db.query).toHaveBeenCalledWith(
                expect.any(String),
                [testUser.id, 'peanuts']
            );
        });

        test('should handle database error when adding', async () => {
            db.query.mockRejectedValue(new Error('Database error'));

            const response = await request(app)
                .post('/api/allergies/add')
                .set('Authorization', `Bearer ${validToken}`)
                .send({ allergy: 'peanuts' });

            expect(response.status).toBe(500);
            expect(response.body.success).toBe(false);
        });

        test('should fail without token', async () => {
            const response = await request(app)
                .post('/api/allergies/add')
                .send({ allergy: 'peanuts' });

            expect(response.status).toBe(401);
        });
    });

    // DELETE /api/allergies/remove Tests
    describe('DELETE /api/allergies/remove', () => {
        test('should remove allergen successfully', async () => {
            db.query.mockResolvedValue({});

            const response = await request(app)
                .delete('/api/allergies/remove')
                .set('Authorization', `Bearer ${validToken}`)
                .send({ allergy: 'peanuts' });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(db.query).toHaveBeenCalledWith(
                expect.any(String),
                [testUser.id, 'peanuts', '{"allergen":"peanuts"}']
            );
        });

        test('should handle database error when removing', async () => {
            db.query.mockRejectedValue(new Error('Database error'));

            const response = await request(app)
                .delete('/api/allergies/remove')
                .set('Authorization', `Bearer ${validToken}`)
                .send({ allergy: 'peanuts' });

            expect(response.status).toBe(500);
            expect(response.body.success).toBe(false);
        });

        test('should fail without token', async () => {
            const response = await request(app)
                .delete('/api/allergies/remove')
                .send({ allergy: 'peanuts' });

            expect(response.status).toBe(401);
        });
    });

    // Authentication Tests
    describe('Authentication Middleware', () => {
        test('should reject invalid token', async () => {
            jwt.verify.mockImplementation((token, secret, callback) => {
                callback(new Error('Invalid token'), null);
            });

            const response = await request(app)
                .get('/api/allergies')
                .set('Authorization', `Bearer invalid.token`);

            expect(response.status).toBe(403);
        });

        test('should reject token with missing user id', async () => {
            jwt.verify.mockImplementation((token, secret, callback) => {
                callback(null, { email: 'test@example.com' }); // Missing id
            });

            const response = await request(app)
                .get('/api/allergies')
                .set('Authorization', `Bearer ${validToken}`);

            expect(response.status).toBe(403);
        });
    });
});