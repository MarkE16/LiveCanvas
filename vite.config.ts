import react from "@vitejs/plugin-react";
import ssr from "vite-plugin-ssr/plugin";
import { defineConfig } from "vite";
import { resolve } from "path";

const root = resolve(__dirname, "./src");
const components = resolve(root, "./components");
const assets = resolve(root, "./assets");
const types = resolve(root, "./types");
const state = resolve(root, "./state");

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
			src: root,
			"@components": components,
			"@assets": assets,
			"@types": types,
			"@state": state
		}
	}
});
