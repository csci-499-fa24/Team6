const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const autoRemoveRoute = require('../discover/autoRemove');

// Mock the database pool
jest.mock('../db', () => ({
    query: jest.fn().mockResolvedValue({ rows: [] })
}));

// Mock jsonwebtoken
jest.mock('jsonwebtoken');

const app = express();
app.use(express.json());
app.use('/autoRemove', autoRemoveRoute);

describe('POST /autoRemove', () => {
    const validToken = 'validToken';
    const userId = 1;
    const ingredients = [{ name: 'Tomato', amount: 2 }];

    beforeEach(() => {
        jest.clearAllMocks();
        jwt.verify = jest.fn((token, secret, callback) => {
            if (token === validToken) {
                callback(null, { id: userId });
            } else {
                callback(new Error('Invalid token'));
            }
        });
    });

    test('should return 401 if token is missing', async () => {
        const response = await request(app)
            .post('/autoRemove')
            .send({ ingredients });

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Token not found');
    });

    test('should return 403 if token is invalid', async () => {
        const response = await request(app)
            .post('/autoRemove')
            .set('Authorization', 'Bearer invalidToken')
            .send({ ingredients });

        expect(response.status).toBe(403);
        expect(response.body.message).toBe('Invalid token');
    });

    test('should update ingredient amount successfully', async () => {
        // Mock database responses
        pool.query
            .mockResolvedValueOnce({ rows: [{ ingredient_id: 1 }] })
            .mockResolvedValueOnce({ rows: [{ amount: 5 }] })
            .mockResolvedValueOnce({ rows: [] });

        const response = await request(app)
            .post('/autoRemove')
            .set('Authorization', `Bearer ${validToken}`)
            .send({ ingredients });

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Ingredients updated successfully');
        expect(pool.query).toHaveBeenCalledTimes(3);
    });

    test('should delete ingredient when amount becomes zero', async () => {
        pool.query
            .mockResolvedValueOnce({ rows: [{ ingredient_id: 1 }] })
            .mockResolvedValueOnce({ rows: [{ amount: 2 }] })
            .mockResolvedValueOnce({ rows: [] });

        const response = await request(app)
            .post('/autoRemove')
            .set('Authorization', `Bearer ${validToken}`)
            .send({ ingredients: [{ name: 'Tomato', amount: 2 }] });

        expect(response.status).toBe(200);
        expect(pool.query).toHaveBeenCalledTimes(3);
        expect(pool.query.mock.calls[2][0]).toContain('DELETE FROM user_ingredient');
    });

    test('should skip non-existent ingredients', async () => {
        pool.query.mockResolvedValueOnce({ rows: [] });

        const response = await request(app)
            .post('/autoRemove')
            .set('Authorization', `Bearer ${validToken}`)
            .send({ ingredients });

        expect(response.status).toBe(200);
        expect(pool.query).toHaveBeenCalledTimes(1);
    });

    test('should handle database errors gracefully', async () => {
        pool.query.mockRejectedValueOnce(new Error('Database error'));

        const response = await request(app)
            .post('/autoRemove')
            .set('Authorization', `Bearer ${validToken}`)
            .send({ ingredients });

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Internal server error');
    });
});