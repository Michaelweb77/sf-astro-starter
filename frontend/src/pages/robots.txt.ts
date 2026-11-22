import type { APIRoute } from "astro";
import { isPreview } from "@/utils/sanity";

export const GET: APIRoute = ({ site }) => {
  // Wdrozenie podgladowe (wersje robocze) nie moze trafic do wyszukiwarek
  const body = isPreview
    ? ["User-agent: *", "Disallow: /"]
    : [
        "User-agent: *",
        "Allow: /",
        "",
        `Sitemap: ${new URL("sitemap-index.xml", site).href}`,
      ];

  return new Response(body.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
