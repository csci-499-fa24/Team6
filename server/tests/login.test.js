// tests/login.test.js

const request = require('supertest');
const app = require('../server');
const db = require('../db');
const bcrypt = require('bcrypt');

// Set JWT secret for tests
process.env.JWT_SECRET = 'test_secret';

// Mock modules
jest.mock('../db');
jest.mock('bcrypt');

describe('Login Endpoint', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should successfully login with valid credentials', async () => {
        // Mock database response
        db.query.mockResolvedValue({
            rows: [{
                user_id: 1,
                email: 'test@example.com',
                password: 'hashedPassword'
            }]
        });

        // Mock password comparison to return true
        bcrypt.compare.mockResolvedValue(true);

        const response = await request(app)
            .post('/api/login')
            .send({
                email: 'test@example.com',
                password: 'testpass123'
            });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('token');
    });

    test('should fail with invalid email', async () => {
        // Mock empty database response
        db.query.mockResolvedValue({ rows: [] });

        const response = await request(app)
            .post('/api/login')
            .send({
                email: 'wrong@example.com',
                password: 'testpass123'
            });

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Invalid email or password');
    });
});
