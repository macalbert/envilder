/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  preset: 'ts-jest',
  testEnvironment: "node",
  moduleFileExtensions: ['ts', 'js'],
  transform: {
    "^.+.tsx?$": ["ts-jest",{}],
  },
  testMatch: ['**/test/**/*.test.ts']
};