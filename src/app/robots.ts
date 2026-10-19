import type { MetadataRoute } from "next";
import { siteUrl, siteIndexable } from "@/lib/site";
export default function robots(): MetadataRoute.Robots { return { rules: { userAgent:"*", ...(siteIndexable ? { allow:"/" } : { disallow:"/" }) }, ...(siteUrl && siteIndexable ? { sitemap:new URL("/sitemap.xml",siteUrl).href, host:siteUrl.origin } : {}) }; }
