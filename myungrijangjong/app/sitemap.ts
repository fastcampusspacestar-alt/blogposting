import type { MetadataRoute } from "next";
import { getAllPosts, getAllTags } from "@/lib/posts";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://myungrijangjong.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  const tags = getAllTags();

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly",
    priority: post.category === "cases" ? 0.8 : 0.7,
  }));

  const tagEntries: MetadataRoute.Sitemap = tags.map(({ tag }) => ({
    url: `${BASE_URL}/tag/${encodeURIComponent(tag)}`,
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  const categories = ["theory", "analysis", "cases", "seasonal", "essays"];
  const categoryEntries: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${BASE_URL}/category/${cat}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [
    {
      url: BASE_URL,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/blog`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...categoryEntries,
    ...postEntries,
    ...tagEntries,
  ];
}

