const nodemailer = require('nodemailer');
const { checkAndSendEmail } = require('./email');
const db = require('../db');

// Mock nodemailer transporter
jest.mock('nodemailer');

const mockSendMail = jest.fn((mailOptions, callback) => {
    callback(null, { response: 'Email sent: OK' });
});

const mockVerify = jest.fn((callback) => {
    callback(null, true);
});

nodemailer.createTransport.mockReturnValue({
    sendMail: mockSendMail,
    verify: mockVerify,
});

describe('Email environment variables', () => {
   it('should have EMAIL_USER and EMAIL_PASS set correctly', () => {
       expect(process.env.EMAIL_USER).toBe('pantrypal.notifications@gmail.com');
       expect(process.env.EMAIL_PASS).toBe('oljpzstklsqknfjz');
   });
});

describe('checkAndSendEmail function', () => {
   beforeAll(() => {
       db.query = jest.fn().mockResolvedValue({
           rows: [
               { name: 'test', email: 'test@example.com', ingredient_name: 'Sugar', amount: 20 },
               { name: 'test1', email: 'test1@example.com', ingredient_name: 'Flour', amount: 15 },
           ],
       });
   });

   it('should send an email if ingredients are low', async () => {
       await checkAndSendEmail();

       expect(mockVerify).toHaveBeenCalled();
       expect(mockSendMail).toHaveBeenCalledWith(
           expect.objectContaining({
               from: process.env.EMAIL_USER,
               to: 'andy@example.com',
               subject: 'Low Ingredient Alert',
           }),
           expect.any(Function)
       );
   });
});
