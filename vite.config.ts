import react from "@vitejs/plugin-react";
import ssr from "vite-plugin-ssr/plugin";
import { defineConfig } from "vite";
import { resolve } from "path";

const root = resolve(__dirname, "./src");

export default defineConfig({
	plugins: [react(), ssr()],
	build: {
		outDir: "dist"
	},
	server: {
		cors: true
	},
	resolve: {
		alias: {
			"@": root
		}
	}
});
