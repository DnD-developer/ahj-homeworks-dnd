/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
	collectCoverage: true,
	preset: "ts-jest",
	testEnvironment: "node",
	transform: {
		"\\.js$": "babel-jest"
	}
}
