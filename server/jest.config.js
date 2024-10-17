require('dotenv').config({ path: './.env.test' });

module.exports = {
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageReporters: ['lcov', 'text', 'html'],
    testTimeout: 10000,
    testEnvironment: 'node',
    verbose: true,
  };
