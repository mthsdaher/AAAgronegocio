import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const rawPort = process.env.PORT ?? "5173";
const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH ?? "/";

const rootDir = path.resolve(import.meta.dirname);

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, rootDir, "");
  const apiProxyTarget =
    env.API_PROXY_TARGET || process.env.API_PROXY_TARGET || "http://127.0.0.1:3000";

  const apiProxy = {
    "/api": {
      target: apiProxyTarget,
      changeOrigin: true,
    },
  };

  return {
    base: basePath,
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(rootDir, "src"),
        "@assets": path.resolve(rootDir, "..", "attached_assets"),
      },
      dedupe: ["react", "react-dom"],
    },
    root: rootDir,
    build: {
      outDir: path.resolve(rootDir, "dist/public"),
      emptyOutDir: true,
    },
    server: {
      port,
      host: "0.0.0.0",
      allowedHosts: true,
      proxy: apiProxy,
      fs: {
        strict: true,
        // Do not use "**/.*" — it blocks node_modules/.vite (optimizer cache) and breaks dev.
        deny: [".env", ".env.*", "*.{crt,pem}", "**/.git/**"],
      },
    },
    preview: {
      port,
      host: "0.0.0.0",
      allowedHosts: true,
      proxy: apiProxy,
    },
  };
});
