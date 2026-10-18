import type { MetadataRoute } from "next";
import { items, registryUrl } from "@www/lib/registry";
export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/agents", "/cli", "/theme", "/components", ...items.map(item => `/components/${item.name}`)].map(path => ({ url: `${registryUrl}${path}` }));
}
