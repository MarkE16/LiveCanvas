import react from "@vitejs/plugin-react";
import ssr from "vite-plugin-ssr/plugin";
import { UserConfig } from "vite";

const config: UserConfig = {
	plugins: [react(), ssr()],
	build: {
		outDir: "dist"
	}
};

export default config;
