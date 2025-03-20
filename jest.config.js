const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./", // Path to your Next.js project root
});

const customJestConfig = {
  testEnvironment: "jest-environment-jsdom", // Simulates a browser environment
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
};

module.exports = createJestConfig(customJestConfig);