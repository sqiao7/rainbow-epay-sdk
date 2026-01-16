import { defineConfig } from "vite";
import { resolve } from "path";
import dts from "vite-plugin-dts";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "EasyPay",
      fileName: "index",
    },
    rollupOptions: {
      // Make sure externalize deps that shouldn't be bundled
      // into your library
      external: ["axios", "crypto", "events", "util", "stream", "buffer"],
      output: {
        globals: {
          axios: "axios",
        },
      },
    },
  },
  plugins: [dts({ rollupTypes: true })],
});
