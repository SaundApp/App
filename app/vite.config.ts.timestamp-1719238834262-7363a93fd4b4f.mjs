// vite.config.ts
import { TanStackRouterVite } from "file:///C:/Users/torre/Documents/Projects/saund/node_modules/.pnpm/@tanstack+router-vite-plugin@1.39.1_vite@5.3.1_@types+node@20.14.5_terser@5.31.1_/node_modules/@tanstack/router-vite-plugin/dist/esm/index.js";
import react from "file:///C:/Users/torre/Documents/Projects/saund/node_modules/.pnpm/@vitejs+plugin-react@4.3.1_vite@5.3.1_@types+node@20.14.5_terser@5.31.1_/node_modules/@vitejs/plugin-react/dist/index.mjs";
import path from "path";
import { defineConfig } from "file:///C:/Users/torre/Documents/Projects/saund/node_modules/.pnpm/vite@5.3.1_@types+node@20.14.5_terser@5.31.1/node_modules/vite/dist/node/index.js";
import Unfonts from "file:///C:/Users/torre/Documents/Projects/saund/node_modules/.pnpm/unplugin-fonts@1.1.1_vite@5.3.1_@types+node@20.14.5_terser@5.31.1_/node_modules/unplugin-fonts/dist/vite.mjs";
var __vite_injected_original_dirname = "C:\\Users\\torre\\Documents\\Projects\\saund\\app";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    TanStackRouterVite(),
    Unfonts({
      custom: {
        families: [
          {
            name: "Geist",
            src: "./node_modules/geist/dist/fonts/geist-*/*.woff2"
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFx0b3JyZVxcXFxEb2N1bWVudHNcXFxcUHJvamVjdHNcXFxcc2F1bmRcXFxcYXBwXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFx0b3JyZVxcXFxEb2N1bWVudHNcXFxcUHJvamVjdHNcXFxcc2F1bmRcXFxcYXBwXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy90b3JyZS9Eb2N1bWVudHMvUHJvamVjdHMvc2F1bmQvYXBwL3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgVGFuU3RhY2tSb3V0ZXJWaXRlIH0gZnJvbSBcIkB0YW5zdGFjay9yb3V0ZXItdml0ZS1wbHVnaW5cIjtcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3RcIjtcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IFVuZm9udHMgZnJvbSBcInVucGx1Z2luLWZvbnRzL3ZpdGVcIjtcblxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtcbiAgICByZWFjdCgpLFxuICAgIFRhblN0YWNrUm91dGVyVml0ZSgpLFxuICAgIFVuZm9udHMoe1xuICAgICAgY3VzdG9tOiB7XG4gICAgICAgIGZhbWlsaWVzOiBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgbmFtZTogXCJHZWlzdFwiLFxuICAgICAgICAgICAgc3JjOiBcIi4vbm9kZV9tb2R1bGVzL2dlaXN0L2Rpc3QvZm9udHMvZ2Vpc3QtKi8qLndvZmYyXCIsXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgIH0sXG4gICAgfSksXG4gIF0sXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIiksXG4gICAgfSxcbiAgfSxcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFpVSxTQUFTLDBCQUEwQjtBQUNwVyxPQUFPLFdBQVc7QUFDbEIsT0FBTyxVQUFVO0FBQ2pCLFNBQVMsb0JBQW9CO0FBQzdCLE9BQU8sYUFBYTtBQUpwQixJQUFNLG1DQUFtQztBQU96QyxJQUFPLHNCQUFRLGFBQWE7QUFBQSxFQUMxQixTQUFTO0FBQUEsSUFDUCxNQUFNO0FBQUEsSUFDTixtQkFBbUI7QUFBQSxJQUNuQixRQUFRO0FBQUEsTUFDTixRQUFRO0FBQUEsUUFDTixVQUFVO0FBQUEsVUFDUjtBQUFBLFlBQ0UsTUFBTTtBQUFBLFlBQ04sS0FBSztBQUFBLFVBQ1A7QUFBQSxRQUNGO0FBQUEsTUFDRjtBQUFBLElBQ0YsQ0FBQztBQUFBLEVBQ0g7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxJQUN0QztBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
