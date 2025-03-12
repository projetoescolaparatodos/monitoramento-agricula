import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
        ]
      : []),
  ],
  server: {
    allowedHosts: [
      "b8edcc22-d521-4d45-87db-953b6b1d5274-00-7a5a0x16fdsj.spock.replit.dev",
      "303548ff-1da9-44e3-82ae-34ecd1b6f479-00-knd92yva2khn.janeway.replit.dev",
      "70ce0eac-1b8f-41e8-b2c8-9237dbaf5480-00-25pfeu9a8onft.worf.replit.dev",
      "18116612-0326-4ade-87da-5c8c89c7febd-00-2keq9gd9zgq51.kirk.replit.dev"
    ],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true,
  },
});
