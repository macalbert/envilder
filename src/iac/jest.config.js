/** @type {import('jest').Config} */
const config = {
	testEnvironment: "node",
	roots: ["<rootDir>/test"],
	testMatch: ["**/*.test.ts"],
	transform: {
		"^.+\\.ts?$": ["ts-jest"],
	},
	collectCoverage: true,
	coverageDirectory: "coverage",
	verbose: false,
	reporters: [
		"default",
	],
};

// eslint-disable-next-line no-undef
module.exports = config;
