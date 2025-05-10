import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		environment: "jsdom",
		include: ["src/tests/**/*.test.ts", "src/tests/**/*.test.tsx"],
		exclude: [
			"**/node_modules/**",
			"**/dist/**",
			"**/build/**",
			"server/**",
			"renderer/**",
			"types/**"
		],
		globals: true,
		setupFiles: [
			"vitest.setup.ts",
			// This is so that we can use the IndexedDB API in our tests
			"fake-indexeddb/auto",
			// This is so that we can mock the canvas API in our tests
			"vi-canvas-mock"
		],
		coverage: {
			provider: "v8",
			reporter: ["text", "lcov", "html"],
			reportsDirectory: "coverage"
		}
	}
});
