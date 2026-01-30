import nextJest from "next/jest.js";

const createJestConfig = nextJest({ dir: "./" });

/** @type {import('jest').Config} */
const config = {
  testEnvironment: "node",
  collectCoverageFrom: [
    "lib/**/*.ts",
    "!lib/**/*.d.ts",
    "!lib/**/index.ts",
    "!lib/**/types.ts",
    "!lib/ai/**",
    "!lib/knowledge/**",
    "!lib/darshanPrompt.ts",
    "!lib/configStore.ts",
    "!lib/otpStore.ts",
    "!lib/oracleOffline.ts",
    "!lib/email.ts",
    "!lib/userProfile.ts",
    "!lib/timepulse.ts",
  ],
  coverageThreshold: {
    global: {
      lines: 90,
      branches: 85,
      functions: 90,
      statements: 90,
    },
  },
  testMatch: ["**/__tests__/**/*.test.ts", "**/__tests__/**/*.test.tsx"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
};

export default createJestConfig(config);
