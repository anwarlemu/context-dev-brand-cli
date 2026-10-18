import type { MetadataRoute } from "next";
import { registryUrl } from "@www/lib/registry";
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/", disallow: "/preview/" }, sitemap: `${registryUrl}/sitemap.xml` };
}
