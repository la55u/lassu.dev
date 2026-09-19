import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import wasm from "vite-plugin-wasm";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), wasm()],
  resolve: {
    alias: {
      // Use the non-compat Rapier build so the WASM ships as a separate
      // streamed asset instead of base64-inlined JS.
      // See src/utils/rapier3d-compat.ts for the API shim.
      "@dimforge/rapier3d-compat": fileURLToPath(
        new URL("./src/utils/rapier3d-compat.ts", import.meta.url),
      ),
    },
  },
  optimizeDeps: {
    exclude: ["@dimforge/rapier3d"],
  },
  server: {
    port: 3000,
  },
});
