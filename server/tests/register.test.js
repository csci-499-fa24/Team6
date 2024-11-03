// tests/register.test.js

const request = require('supertest');
const app = require('../server');
const db = require('../db');
const bcrypt = require('bcrypt');

jest.mock('../db');
jest.mock('bcrypt');

describe('Registration Endpoint', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        bcrypt.hash.mockResolvedValue('hashedPassword123');
    });

    const validRegistrationData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'password123',
        phoneNumber: '1234567890',
        ingredients: [
            {
                ingredient: 'Salt',
                quantity: 500,
                units: 'g'
            }
        ],
        allergy: ['peanuts', 'dairy'],
        nutritionalGoals: {
            protein: '50',
            carbohydrates: '200',
            total_fat: '70',
            saturated_fat: '20',
            fiber: '25',
            sodium: '2300',
            sugar: '30',
            calories: '2000'
        }
    };

    test('should register a new user successfully with all data', async () => {
        db.query
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [{ user_id: 1 }] })
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [{ ingredient_id: 1 }] })
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [] });

        const response = await request(app)
            .post('/api/register')
            .send(validRegistrationData);

        expect(response.status).toBe(201);
        expect(response.body.message).toBe('User registered successfully');
        expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    });

    test('should reject registration with existing email', async () => {
        db.query.mockResolvedValueOnce({ rows: [{ email: 'john@example.com' }] });

        const response = await request(app)
            .post('/api/register')
            .send(validRegistrationData);

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Email already in use');
    });

    test('should register user without optional data', async () => {
        const basicData = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            password: 'password123',
            phoneNumber: '1234567890'
        };

        db.query
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [{ user_id: 1 }] })
            .mockResolvedValueOnce({ rows: [] });

        const response = await request(app)
            .post('/api/register')
            .send(basicData);

        expect(response.status).toBe(201);
        expect(response.body.message).toBe('User registered successfully');
    });

    test('should handle database error during user insertion', async () => {
        db.query
            .mockResolvedValueOnce({ rows: [] })
            .mockRejectedValueOnce(new Error('Database error'));

        const response = await request(app)
            .post('/api/register')
            .send(validRegistrationData);

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('message');
    });

    test('should handle ingredient insertion failures', async () => {
        db.query
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [{ user_id: 1 }] })
            .mockResolvedValueOnce({ rows: [] })
            .mockRejectedValueOnce(new Error('Ingredient error'));

        const response = await request(app)
            .post('/api/register')
            .send(validRegistrationData);

        expect(response.status).toBe(201);
        expect(response.body.message).toBe('User registered successfully');
    });

    test('should handle nutritional goals with empty values', async () => {
        const dataWithEmptyNutrition = {
            ...validRegistrationData,
            nutritionalGoals: {
                protein: '',
                carbohydrates: '200',
                total_fat: '',
                saturated_fat: '20',
                fiber: '',
                sodium: '',
                sugar: '30',
                calories: '2000'
            }
        };

        db.query
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [{ user_id: 1 }] })
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [{ ingredient_id: 1 }] })
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce({ rows: [] });

        const response = await request(app)
            .post('/api/register')
            .send(dataWithEmptyNutrition);

        expect(response.status).toBe(201);
        expect(response.body.message).toBe('User registered successfully');
    });

    test('should handle bcrypt hashing failure', async () => {
        bcrypt.hash.mockRejectedValueOnce(new Error('Hashing failed'));

        const response = await request(app)
            .post('/api/register')
            .send(validRegistrationData);

        expect(response.status).toBe(500);
        expect(response.body).toHaveProperty('message');
    });

    test('should handle missing required fields', async () => {
        const invalidData = {
            firstName: 'John',
            email: 'john@example.com'
        };

        const response = await request(app)
            .post('/api/register')
            .send(invalidData);

        expect(response.status).toBe(500);
    });
});