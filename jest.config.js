module.exports = {
  preset: "jest-preset-angular",
  setupFilesAfterEnv: ["<rootDir>/apps/tech-blog/src/setupJest.ts"],
  reporters: ["default", "jest-junit"],
};
