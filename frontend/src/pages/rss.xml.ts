import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { getPosts } from "@/utils/posts";
import { getSettings } from "@/utils/settings";

export const GET: APIRoute = async ({ site }) => {
  const settings = await getSettings();
  const posts = await getPosts();

  return rss({
    title: settings.name,
    description: settings.description,
    site: site!,
    items: posts.map((el) => ({
      title: el.title,
      description: el.excerpt,
      pubDate: el.publishedAt,
      link: `/post/${el.slug}/`,
    })),
    customData: "<language>pl-pl</language>",
  });
};
