const divide = require('../divide');

test('divides 6 / 3 to equal 2', () => {
  expect(divide(6, 3)).toBe(2);
});

test('throws an error when dividing by 0', () => {
  expect(() => divide(6, 0)).toThrow('Cannot divide by zero');
});
