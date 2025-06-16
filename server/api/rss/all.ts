import { createClient } from "@supabase/supabase-js";
import RSS from "rss";

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event);

  const supabaseAdmin = createClient(
    config.supabaseUrl!,
    config.supabaseServiceKey!
  );

  const { data: articles, error } = await supabaseAdmin
    .from("parsed_news")
    .select("title, link, snippet, published_at, newspaper(name)")
    .order("published_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Error fetching articles for RSS feed:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Could not fetch articles.",
    });
  }

  const feed = new RSS({
    title: "Aggregierter News Feed",
    description: "Die neuesten Nachrichten von allen Quellen.",
    feed_url: "http://deine-webseite.com/api/rss/all",
    site_url: "http://deine-webseite.com",
    language: "de",
  });

  for (const article of articles || []) {
    feed.item({
      title: article.title || "Ohne Titel",
      description: article.snippet || "",
      url: article.link,
      author: article.newspaper?.name || "Unbekannte Quelle",
      date: article.published_at,
    });
  }

  const xml = feed.xml({ indent: true });

  setResponseHeader(event, "Content-Type", "application/rss+xml; charset=utf-8");
  return xml;
});