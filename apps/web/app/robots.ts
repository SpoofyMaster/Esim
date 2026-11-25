import type { MetadataRoute } from "next";
import { SITE, INDEXABLE } from "@/lib/server-catalog";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: INDEXABLE ? [{ userAgent: "*", allow: "/", disallow: ["/checkout", "/order/", "/account", "/login", "/register", "/admin"] }] : [{ userAgent: "*", disallow: "/" }],
    sitemap: `${SITE}/sitemap.xml`,
  };
}
