const request = require('supertest');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Mock modules
jest.mock('../db');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');

// Mock the entire nodemailer module
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    verify: jest.fn().mockImplementation(cb => cb(null, true)),
    sendMail: jest.fn().mockResolvedValue({ messageId: 'mocked-message-id' })
  })
}));

// Mock the entire email module
jest.mock('../email', () => ({
  transporter: {
    verify: jest.fn().mockImplementation(cb => cb(null, true)),
    sendMail: jest.fn().mockResolvedValue({ messageId: 'mocked-message-id' })
  },
  sendWelcomeEmail: jest.fn().mockResolvedValue(true)
}));

// Import mocked modules
const db = require('../db');

// Import the app after mocking dependencies
const app = require('../server');

describe('Auth Routes', () => {
  let originalLog;
  
  beforeAll(() => {
    originalLog = console.log;
    console.log = jest.fn();
  });

  afterAll(() => {
    console.log = originalLog;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/register', () => {
    it('should register a user successfully', async () => {
      db.query.mockResolvedValueOnce({ rows: [] }); // Email doesn't exist
      db.query.mockResolvedValueOnce({ rows: [{ user_id: 1 }] }); // User inserted
      bcrypt.hash.mockResolvedValue('hashedpassword');

      const response = await request(app)
        .post('/api/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          password: 'password123',
          phoneNumber: '123456789',
          ingredients: [],
          allergy: [],
          nutritionalGoals: {}
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('User registered successfully');
    });

    it('should return error if email already exists', async () => {
      db.query.mockResolvedValueOnce({ rows: [{ user_id: 1 }] }); // Email exists

      const response = await request(app)
        .post('/api/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          password: 'password123',
          phoneNumber: '123456789',
          ingredients: [],
          allergy: [],
          nutritionalGoals: {}
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Email already in use');
    });
  });

  describe('POST /api/login', () => {
    it('should login a user with correct credentials', async () => {
      db.query.mockResolvedValueOnce({
        rows: [{ user_id: 1, email: 'john.doe@example.com', password: 'hashedpassword' }]
      });
      bcrypt.compare.mockResolvedValueOnce(true);
      jwt.sign.mockReturnValue('mocked_token');

      const response = await request(app)
        .post('/api/login')
        .send({
          email: 'john.doe@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.token).toBe('mocked_token');
    });

    it('should return error for invalid credentials', async () => {
      db.query.mockResolvedValueOnce({
        rows: [{ user_id: 1, email: 'john.doe@example.com', password: 'hashedpassword' }]
      });
      bcrypt.compare.mockResolvedValueOnce(false);

      const response = await request(app)
        .post('/api/login')
        .send({
          email: 'john.doe@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Invalid email or password');
    });
  });
});