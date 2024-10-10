const request = require('supertest');
const app = require('../server'); 
const db = require('../db'); 
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer'); // Add Nodemailer import

// Mocking the database queries and external libraries
jest.mock('../db');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('nodemailer'); // Mock Nodemailer

describe('Auth Routes', () => {
  
  beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks before each test

    // Mock Nodemailer createTransport and sendMail
    nodemailer.createTransport.mockReturnValue({
      sendMail: jest.fn().mockResolvedValue(true), // Simulate email being sent successfully
    });
  });

  describe('POST /api/register', () => {
    it('should register a user successfully', async () => {
      // Mock the db query for email check
      db.query.mockResolvedValueOnce({ rows: [] }); // Email does not exist

      // Mock the db query for inserting a user
      db.query.mockResolvedValueOnce({
        rows: [{ user_id: 1 }] 
      });

      // Mock the bcrypt hash function
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

      // Ensure the mock sendMail was called during registration
      expect(nodemailer.createTransport().sendMail).toHaveBeenCalled();
    });

    it('should return error if email already exists', async () => {
      // Mock the db query for email check
      db.query.mockResolvedValueOnce({
        rows: [{ user_id: 1 }] 
      });

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

      // Ensure sendMail wasn't called since registration failed
      expect(nodemailer.createTransport().sendMail).not.toHaveBeenCalled();
    });
  });

  describe('POST /api/login', () => {
    it('should login a user with correct credentials', async () => {
      // Mock the db query for email check
      db.query.mockResolvedValueOnce({
        rows: [{ user_id: 1, email: 'john.doe@example.com', password: 'hashedpassword' }]
      });

      // Mock bcrypt compare function
      bcrypt.compare.mockResolvedValueOnce(true);

      // Mock jwt sign function
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
      // Mock the db query for email check
      db.query.mockResolvedValueOnce({
        rows: [{ user_id: 1, email: 'john.doe@example.com', password: 'hashedpassword' }]
      });

      // Mock bcrypt compare function to return false (invalid password)
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
