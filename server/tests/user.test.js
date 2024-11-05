const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../db');
const { send2FACodeEmail, sendUnsubscribeConfirmationEmail } = require('../email_noti/2fa');
const userRouter = require('../user/user');


// Mock dependencies
jest.mock('../db');
jest.mock('jsonwebtoken');
jest.mock('bcrypt');
jest.mock('../email_noti/2fa');

const app = express();
app.use(express.json());
app.use('/api/user', userRouter);

describe('User Endpoints', () => {
    const validToken = 'valid.test.token';
    const testUser = { id: 1 };

    beforeEach(() => {
        jest.clearAllMocks();
        jwt.verify.mockImplementation((token, secret, callback) => {
            if (token === validToken) {
                callback(null, testUser);
            } else {
                callback(new Error('Invalid token'));
            }
        });
    });

    describe('GET /api/user/profile', () => {
        test('should return user profile data', async () => {
            db.query.mockResolvedValueOnce({ rows: [{ email: 'test@example.com', first_name: 'John', last_name: 'Doe' }] });

            const response = await request(app)
                .get('/api/user/profile')
                .set('Authorization', `Bearer ${validToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toEqual({ email: 'test@example.com', first_name: 'John', last_name: 'Doe' });
        });

        test('should handle user not found', async () => {
            db.query.mockResolvedValueOnce({ rows: [] });

            const response = await request(app)
                .get('/api/user/profile')
                .set('Authorization', `Bearer ${validToken}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('User not found');
        });
    });

    describe('PUT /api/user/update-email', () => {
        test('should update email successfully', async () => {
            // Mock for checking existing email (no email conflict)
            db.query.mockResolvedValueOnce({ rows: [] });

            // Mock for getting user details before updating
            db.query.mockResolvedValueOnce({ rows: [{ first_name: 'John', last_name: 'Doe', previous_email: 'old@example.com', phone: '123-456-7890' }] });

            // Mock for updating email
            db.query.mockResolvedValueOnce({ rows: [{ email: 'new@example.com' }] });

            const response = await request(app)
                .put('/api/user/update-email')
                .set('Authorization', `Bearer ${validToken}`)
                .send({ email: 'new@example.com' });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Email updated successfully');
            expect(response.body.email).toBe('new@example.com');
        });

        test('should handle email already associated with another account', async () => {
            // Mock for checking existing email (email conflict)
            db.query.mockResolvedValueOnce({ rows: [{ user_id: 2 }] });

            const response = await request(app)
                .put('/api/user/update-email')
                .set('Authorization', `Bearer ${validToken}`)
                .send({ email: 'existing@example.com' });

            expect(response.status).toBe(409);
            expect(response.body.message).toBe('Email is already associated with another account');
        });
    });

    describe('PUT /api/user/update-password', () => {
        test('should update password successfully', async () => {
            db.query.mockResolvedValueOnce({ rows: [{ password: 'hashedOldPassword' }] });
            bcrypt.compare.mockResolvedValueOnce(false); // Passwords are different
            bcrypt.hash.mockResolvedValueOnce('hashedNewPassword');
            db.query.mockResolvedValueOnce({ rows: [{ user_id: 1 }] });

            const response = await request(app)
                .put('/api/user/update-password')
                .set('Authorization', `Bearer ${validToken}`)
                .send({ password: 'newPassword123' });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Password updated successfully');
        });

        test('should reject password same as old password', async () => {
            db.query.mockResolvedValueOnce({ rows: [{ password: 'hashedOldPassword' }] });
            bcrypt.compare.mockResolvedValueOnce(true); // Passwords are the same

            const response = await request(app)
                .put('/api/user/update-password')
                .set('Authorization', `Bearer ${validToken}`)
                .send({ password: 'oldPassword' });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Password cannot be the same as your last password');
        });
    });

    describe('PUT /api/user/update-phone', () => {
        test('should update phone successfully', async () => {
            // Mock for checking existing phone (no phone conflict)
            db.query.mockResolvedValueOnce({ rows: [] });

            // Mock for getting user details before updating
            db.query.mockResolvedValueOnce({ rows: [{ first_name: 'John', last_name: 'Doe', email: 'test@example.com', previous_phone: '098-765-4321' }] });

            // Mock for updating phone
            db.query.mockResolvedValueOnce({ rows: [{ phone: '123-456-7890' }] });

            const response = await request(app)
                .put('/api/user/update-phone')
                .set('Authorization', `Bearer ${validToken}`)
                .send({ phone: '123-456-7890' });

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Phone number updated successfully');
            expect(response.body.phone).toBe('123-456-7890');
        });

        test('should handle phone number already associated with another account', async () => {
            // Mock for checking existing phone (phone conflict)
            db.query.mockResolvedValueOnce({ rows: [{ user_id: 2 }] });

            const response = await request(app)
                .put('/api/user/update-phone')
                .set('Authorization', `Bearer ${validToken}`)
                .send({ phone: '123-456-7890' });

            expect(response.status).toBe(409);
            expect(response.body.message).toBe('Phone number is already associated with another account');
        });
    });

    describe('POST /api/user/send-2fa-code', () => {
        test('should send 2FA code successfully', async () => {
            db.query.mockResolvedValueOnce({ rows: [{ email: 'test@example.com' }] });
            send2FACodeEmail.mockResolvedValueOnce();

            const response = await request(app)
                .post('/api/user/send-2fa-code')
                .set('Authorization', `Bearer ${validToken}`);

            expect(response.status).toBe(200);
            expect(response.body.message).toBe('2FA code sent');
        });

        test('should handle user not found for 2FA code', async () => {
            db.query.mockResolvedValueOnce({ rows: [] });

            const response = await request(app)
                .post('/api/user/send-2fa-code')
                .set('Authorization', `Bearer ${validToken}`);

            expect(response.status).toBe(404);
            expect(response.body.message).toBe('User not found');
        });
    });

    describe('Authentication', () => {
        test('should reject requests without token', async () => {
            const response = await request(app)
                .get('/api/user/profile');

            expect(response.status).toBe(401);
            expect(response.body.message).toBe('Token not found');
        });

        test('should reject invalid token', async () => {
            const response = await request(app)
                .get('/api/user/profile')
                .set('Authorization', 'Bearer invalid.token');

            expect(response.status).toBe(403);
            expect(response.body.message).toBe('Invalid token');
        });
    });
});
