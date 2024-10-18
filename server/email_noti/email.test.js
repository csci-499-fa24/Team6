const nodemailer = require('nodemailer');
const db = require('../db');
const { checkAndSendEmail, createTransporter } = require('./email');

jest.mock('nodemailer');
jest.mock('../db');

describe('Email service', () => {
  let mockSendMail;
  let mockVerify;

  beforeAll(() => {
    process.env.EMAIL_USER = 'test_email_user';
    process.env.EMAIL_PASS = 'test_email_pass';
  });

  beforeEach(() => {
    jest.clearAllMocks();

    mockSendMail = jest.fn().mockResolvedValue({ response: 'Email sent: OK' });
    mockVerify = jest.fn().mockResolvedValue(true);

    const mockTransporter = {
      sendMail: mockSendMail,
      verify: mockVerify,
    };

    nodemailer.createTransport.mockReturnValue(mockTransporter);
  });

  it('should verify the email transporter and send an email if low ingredients are found', async () => {
    // Mock database query to return ingredients with amounts less than 5
    db.query.mockResolvedValue({
        rows: [
            {
                first_name: 'John',
                last_name: 'Doe',
                email: 'john.doe@example.com',
                ingredient_name: 'Tomatoes',
                amount: 3,
            },
            {
                first_name: 'John',
                last_name: 'Doe',
                email: 'john.doe@example.com',
                ingredient_name: 'Onions',
                amount: 2,
            },
        ],
    });

    await createTransporter();
    await checkAndSendEmail();

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(mockVerify).toHaveBeenCalled();
    expect(mockSendMail).toHaveBeenCalledTimes(1); // Expecting one call for the single user

    // Check the first call's parameters
    expect(mockSendMail).toHaveBeenCalledWith(expect.objectContaining({
        from: process.env.EMAIL_USER,
        to: 'john.doe@example.com',
        subject: 'Low Ingredient Alert',
        text: expect.stringContaining('Hi John Doe'),
        text: expect.stringContaining('You are low on:'),
        text: expect.stringContaining('Tomatoes'),
        text: expect.stringContaining('Onions'),
    }));
});

  // New dummy test case
  it('should pass a dummy test', () => {
    expect(true).toBe(true);
  });
});
