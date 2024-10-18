const nodemailer = require('nodemailer');
const db = require('./db');
const { checkAndSendEmail, createTransporter } = require('./email');

jest.mock('nodemailer');
jest.mock('./db');

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
    db.query.mockResolvedValue({
      rows: [
        {
          name: 'John Doe',
          email: 'john.doe@example.com',
          ingredient_name: 'Tomatoes',
          amount: 10,
        },
        {
          name: 'John Doe',
          email: 'john.doe@example.com',
          ingredient_name: 'Onions',
          amount: 5,
        },
      ],
    });

    await createTransporter();
    await checkAndSendEmail();

    // Add a small delay to allow for asynchronous operations to complete
    await new Promise(resolve => setTimeout(resolve, 100));

    expect(mockVerify).toHaveBeenCalled();
    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        from: process.env.EMAIL_USER,
        to: 'john.doe@example.com',
        subject: 'Low Ingredient Alert',
        text: expect.stringContaining('Tomatoes'),
      })
    );
    expect(mockSendMail).toHaveBeenCalledTimes(1);
  });

  it('should not send an email if no low ingredients are found', async () => {
    db.query.mockResolvedValue({ rows: [] });

    await createTransporter();
    await checkAndSendEmail();

    await new Promise(resolve => setTimeout(resolve, 100));

    expect(mockVerify).toHaveBeenCalled();
    expect(mockSendMail).not.toHaveBeenCalled();
  });

  // New dummy test case
  it('should pass a dummy test', () => {
    expect(true).toBe(true);
  });
});