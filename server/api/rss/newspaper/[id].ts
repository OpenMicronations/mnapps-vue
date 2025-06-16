import { createClient } from "@supabase/supabase-js";
import RSS from "rss";

export default defineEventHandler(async (event) => {
  // 1. Get the newspaper ID from the URL
  const newspaperIdParam = getRouterParam(event, "id");
  const newspaperId = parseInt(newspaperIdParam!, 10);

  if (isNaN(newspaperId)) {
    throw createError({ statusCode: 400, statusMessage: "Invalid ID" });
  }

  // 2. Create the Supabase admin client
  const config = useRuntimeConfig(event);
  const supabaseAdmin = createClient(
    config.supabaseUrl!,
    config.supabaseServiceKey!,
  );

  // 3. Fetch the newspaper details, including filter columns
  const { data: newspaperData, error: newspaperError } = await supabaseAdmin
    .from("newspaper") // Assuming your table is named 'newspapers'
    .select("name")
    .eq("id", newspaperId)
    .single();

  if (newspaperError || !newspaperData) {
    console.error(`Error fetching newspaper ${newspaperId}:`, newspaperError);
    throw createError({
      statusCode: 404,
      statusMessage: "Newspaper not found",
    });
  }

  // 4. Build the query for articles step-by-step
  let query = supabaseAdmin
    .from("parsed_news")
    .select(
      "title, link, snippet, published_at, author, content_html, image_url, categories",
    )
    .eq("newspaper_id", newspaperId);

  // Finally, add ordering and limit, then execute the query
  const { data: articles, error: articlesError } = await query
    .order("published_at", { ascending: false })
    .limit(50);

  if (articlesError) {
    console.error("Error fetching articles for newspaper:", articlesError);
    throw createError({
      statusCode: 500,
      statusMessage: "Could not fetch articles for the newspaper",
    });
  }

  // 5. Create the RSS feed
  const feed = new RSS({
    title: `RSS Feed: ${newspaperData.name}`,
    description: `Die neuesten Nachrichten von "${newspaperData.name}".`,
    feed_url: `https://your-website.com/api/rss/newspaper/${newspaperId}`,
    site_url: "https://your-website.com",
    language: "de",
  });

  // 6. Add the fetched articles to the feed
  for (const article of articles || []) {
    const feedItem: any = {
      title: article.title || "Ohne Titel",
      description: article.content_html || article.snippet || "",
      url: article.link,
      author: article.author || newspaperData.name || "Unbekannte Quelle",
      date: article.published_at,
      categories: article.categories || [],
    };

    if (article.image_url) {
      feedItem.enclosure = { url: article.image_url };
    }

    feed.item(feedItem);
  }

  // 7. Send the XML response
  const xml = feed.xml({ indent: true });
  setResponseHeader(event, "Content-Type", "application/rss+xml; charset=utf-8");
  return xml;
});