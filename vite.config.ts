import { defineConfig } from "vite";
import { resolve } from "path";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "EasyPay",
      fileName: "index",
      formats: ["es", "cjs", "umd"],
    },
    rollupOptions: {
      external: ["axios"],
      output: {
        globals: {
          axios: "axios",
        },
      },
    },
  },
  plugins: [dts({ rollupTypes: true })],
});
