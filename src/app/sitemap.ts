import type { MetadataRoute } from "next";
import { siteUrl, siteIndexable } from "@/lib/site";
export default function sitemap(): MetadataRoute.Sitemap { return siteUrl && siteIndexable ? [{ url:siteUrl.href, changeFrequency:"monthly", priority:1 }] : []; }
