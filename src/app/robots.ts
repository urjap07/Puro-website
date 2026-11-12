import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

/** robots.txt: index the storefront, keep the bag and the API out of search. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/cart"] }],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
