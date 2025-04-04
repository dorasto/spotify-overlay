import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
    const url = process.env.ROOT_DOMAIN || "";
    const now = new Date();
    return [
        {
            url: url,
            lastModified: now,
            changeFrequency: "monthly",
            priority: 1,
        },
    ];
}
