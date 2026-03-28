/** @type {import('jest').Config} */
const path = require('node:path');

const config = {
	testEnvironment: "node",
	testMatch: ["**/*.test.ts"],
	transform: {
		"^.+\\.ts$": [
			"ts-jest",
			{
				tsconfig: path.resolve(__dirname, "tsconfig.json"),
			},
		],
	},
	collectCoverage: true,
	coverageProvider: "v8",
	coverageDirectory: "coverage",
	verbose: false,
	reporters: [
		"default",
	],
};

module.exports = config;
