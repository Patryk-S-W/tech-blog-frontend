module.exports = {
  preset: "jest-preset-angular",
  setupFilesAfterEnv: ["<rootDir>/apps/tech-blog/src/setupJest.ts"],
  reporters: ["default", "jest-junit"],
  moduleNameMapper: {
    "^@tech-blog/shared-ui$": "<rootDir>/libs/shared-ui/src/index.ts",
    "^@tech-blog/feature-home$": "<rootDir>/libs/feature-home/src/index.ts",
    "^@tech-blog/feature-about-me$":
      "<rootDir>/libs/feature-about-me/src/index.ts",
    "^@tech-blog/feature-ai$": "<rootDir>/libs/feature-ai/src/index.ts",
    "^@tech-blog/feature-hardware$":
      "<rootDir>/libs/feature-hardware/src/index.ts",
    "^@tech-blog/feature-projects$":
      "<rootDir>/libs/feature-projects/src/index.ts",
    "^@tech-blog/feature-recent-articles$":
      "<rootDir>/libs/feature-recent-articles/src/index.ts",
    "^@tech-blog/feature-test$": "<rootDir>/libs/feature-test/src/index.ts",
  },
};
