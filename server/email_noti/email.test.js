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
