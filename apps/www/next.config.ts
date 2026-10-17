import path from "node:path";
import type { NextConfig } from "next";

// The library lives in ../../registry; the docs render it straight from source.
const root = path.join(import.meta.dirname, "../..");

const config: NextConfig = {
  turbopack: { root },
  outputFileTracingRoot: root,
  // The repo has its own agent instructions; dev must not write AGENTS.md and CLAUDE.md here.
  agentRules: false,
  // Sandboxed examples have an opaque origin. Only public font and image assets need cross-origin reads.
  async headers() {
    return ["/_next/static/media/:path*", "/dot-shader/:path*"].map((source) => ({
      source,
      headers: [{ key: "Access-Control-Allow-Origin", value: "*" }],
    }));
  },
};

export default config;
