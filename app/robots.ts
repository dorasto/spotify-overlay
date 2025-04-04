import { MetadataRoute } from "next";

export default function Robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
                disallow: ["/connect/", "/test/"],
                crawlDelay: 10,
            },
        ],
        sitemap: "https://music-overlay.doras.to/sitemap.xml",
    };
}
