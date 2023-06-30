/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */

module.exports ={
    "rootDir": "./",
    "modulePaths": [
        "<rootDir>"
    ],
    clearMocks: true,
    coverageProvider: "v8",
    testEnvironment: "jest-environment-node",
};
