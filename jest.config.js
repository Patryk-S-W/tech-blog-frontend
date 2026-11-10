module.exports = {
  preset: "jest-preset-angular",
  setupFilesAfterEnv: ["<rootDir>/src/setupJest.ts"],
  transformIgnorePatterns: [
    'node_modules/(?!(marked/|.*\\.mjs$|@angular/common/locales/.*\\.js$))',
  ],
  reporters: ["default", "jest-junit"],
};
