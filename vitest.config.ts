import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		environment: "jsdom",
		include: ["tests/**/*.test.tsx"],
		exclude: ["**/node_modules/**", "**/dist/**", "**/build/**"],
		globals: true,
		setupFiles: [
			"fake-indexeddb/auto" // This is so that we can use the IndexedDB API in our tests
		]
	}
});
