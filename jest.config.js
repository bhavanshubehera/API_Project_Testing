module.exports = {
  // Set the testing environment to Node.js
  testEnvironment: 'node',

  // Setup file to run before each test file for DB connection, etc.
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

  // Match test files in `tests` folder ending with `.test.js` or `.spec.js`
  testMatch: [
    '<rootDir>/tests/**/*.(test|spec).js'
  ],

  // Coverage collection from app source files, not tests or node_modules
  collectCoverageFrom: [
    'server.js',
    'models/**/*.js',
    'routes/**/*.js',
    '!node_modules/**',
    '!tests/**'
  ],

  // Where to output coverage reports
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],

  // Minimum thresholds for coverage
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70
    }
  },

  // Ignore MongoDB memory server debug logs if used
  // (Optional: Only include if you use `mongodb-memory-server`)
  globals: {
    __DEV__: true
  },

  // Transform settings if you ever add TypeScript or JSX (optional, safe to skip for now)
  // transform: {
  //   '^.+\\.jsx?$': 'babel-jest',
  // },

  // Optional: Show which files were not covered
  verbose: true,
};
