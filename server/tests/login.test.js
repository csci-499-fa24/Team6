const request = require('supertest');
const app = require('../server'); 

// Tests
describe('Login Route', () => {
  // Test for invalid login
  it('should return 400 for invalid login', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({
        email: 'invalid@example.com',
        password: 'invalidpassword'
      });

    expect(res.statusCode).toBe(400);
    expect(res.body.message).toBe('Invalid credentials');
  });

  // Test for valid login
  it('should return a JWT token for valid login', async () => {
    const email = 'test@example.com';
    const password = 'password123';

    await request(app)
      .post('/api/register')
      .send({ email, password });

    const res = await request(app)
      .post('/api/login')
      .send({ email, password });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.message).toBe('Login successful');
  });
});
