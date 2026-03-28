/** @type {import('jest').Config} */
const path = require('node:path');

const repoRoot = path.resolve(__dirname, '../..');

const config = {
  rootDir: repoRoot,
  testEnvironment: 'node',
  testMatch: ['<rootDir>/tests/iac/**/*.test.ts'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: path.resolve(__dirname, 'tsconfig.json'),
      },
    ],
  },
  collectCoverage: true,
  collectCoverageFrom: [
    'src/iac/**/*.ts',
    '!src/iac/app/**',
    '!src/iac/dist/**',
  ],
  coverageProvider: 'v8',
  coverageDirectory: path.resolve(__dirname, 'coverage'),
  verbose: false,
  reporters: ['default'],
};

module.exports = config;
