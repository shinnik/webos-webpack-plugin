import { defineConfig } from "vite";
import { resolve } from "path";
import dts from "vite-plugin-dts";

export default defineConfig({
    build: {
        copyPublicDir: false,
        lib: {
            entry: resolve(__dirname, "lib/index.ts"),
            name: "webos-webpack-plugin",
            formats: ["cjs", "es"],
        },
    },
    plugins: [dts({ rollupTypes: true, include: ["lib"] })],
});
