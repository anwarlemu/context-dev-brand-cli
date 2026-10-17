import path from "node:path";
import type { NextConfig } from "next";

// The library lives in ../../registry; the docs render it straight from source.
const root = path.join(import.meta.dirname, "../..");

const config: NextConfig = {
  turbopack: { root },
  outputFileTracingRoot: root,
};

export default config;
