import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		environment: "jsdom",
		include: ["tests/frontend/**/*.test.tsx"],
		exclude: ["**/node_modules/**", "**/dist/**", "**/build/**"],
		globals: true,
	},
});
