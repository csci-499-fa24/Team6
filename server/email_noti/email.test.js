const nodemailer = require('nodemailer');
const { checkAndSendEmail } = require('./email');

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
   beforeAll(() => {
       process.env.EMAIL_USER = 'test_email_user';
       process.env.EMAIL_PASS = 'test_email_pass';
   });

   it('should have EMAIL_USER and EMAIL_PASS set correctly', () => {
       expect(process.env.EMAIL_USER).toBe('test_email_user');
       expect(process.env.EMAIL_PASS).toBe('test_email_pass');
   });
});
