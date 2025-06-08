import { defineConfig } from "vite";

export default defineConfig({
  server: {
    port: 3000,
    proxy: {
      "/gradio": {
        target: "https://641ecc998f9d533423.gradio.live",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/gradio/, ""),
        configure: (proxy, _options) => {
          proxy.on("proxyReq", (proxyReq, req, res) => {
            // Remove problematic headers
            proxyReq.removeHeader("origin");
            proxyReq.removeHeader("referer");

            // If there's a content-length header, preserve it
            if (req.headers["content-length"]) {
              proxyReq.setHeader(
                "content-length",
                req.headers["content-length"]
              );
            }

            // Ensure proper content-type for file uploads
            if (req.headers["content-type"]?.includes("multipart/form-data")) {
              proxyReq.setHeader("content-type", req.headers["content-type"]);
            }
          });

          // Handle binary responses
          proxy.on("proxyRes", (proxyRes, req, res) => {
            if (
              proxyRes.headers["content-type"]?.includes("application/json")
            ) {
              let body = "";
              proxyRes.on("data", (chunk) => (body += chunk));
              proxyRes.on("end", () => {
                try {
                  const parsed = JSON.parse(body);
                  console.log("Proxy response:", parsed);
                } catch (e) {
                  console.error("Failed to parse proxy response:", body);
                }
              });
            }
          });
        },
        // Handle websocket connections
        ws: true,
        // Ensure proper handling of binary data
        selfHandleResponse: false,
        // Configure proxy timeout for large uploads
        timeout: 600000,
      },
    },
  },
});
