import { createClient } from "@supabase/supabase-js";
import RSS from "rss";

export default defineEventHandler(async (event) => {
  // 1. Load runtime config and get the list ID from the URL
  const config = useRuntimeConfig(event);
  const listId = getRouterParam(event, "id");

  if (!listId) {
    throw createError({
      statusCode: 400,
      statusMessage: "List ID is required",
    });
  }

  // 2. Create the Supabase admin client
  const supabaseAdmin = createClient(
    config.supabaseUrl!,
    config.supabaseServiceKey!,
  );

  // 3. Fetch the list, now including the filter columns
  const { data: listData, error: listError } = await supabaseAdmin
    .from("newspaper_list")
    .select("name, newspapers, filter_authors, filter_categories") // <-- ADDED FILTERS
    .eq("id", listId)
    .single();

  if (listError || !listData) {
    console.error(`Error fetching list ${listId}:`, listError);
    throw createError({
      statusCode: 404,
      statusMessage: "Newspaper list not found",
    });
  }

  // Define a type for the articles to ensure type safety
  type FetchedArticle = {
    title: string | null;
    link: string | null;
    snippet: string | null;
    published_at: string | null;
    author: string | null;
    content_html: string | null;
    image_url: string | null;
    categories: string[] | null;
    newspaper: { name: string | null } | null;
  };

  let articles: FetchedArticle[] = [];

  if (listData.newspapers && listData.newspapers.length > 0) {
    // 4. Build the query for articles step-by-step
    let query = supabaseAdmin
      .from("parsed_news")
      .select(
        "title, link, snippet, published_at, author, content_html, image_url, categories, newspaper(name)",
      )
      .in("newspaper_id", listData.newspapers);

    // --- APPLY FILTERS CONDITIONALLY ---

    // Apply author filter if it exists and is not empty
    if (listData.filter_authors && listData.filter_authors.length > 0) {
      query = query.in("author", listData.filter_authors);
    }

    // Apply category filter if it exists and is not empty
    // .contains() checks if the `categories` array column contains AT LEAST ONE of the specified values.
    if (
      listData.filter_categories &&
      listData.filter_categories.length > 0
    ) {
      query = query.contains("categories", listData.filter_categories);
    }

    // Finally, add ordering and limit, then execute the query
    const { data: fetchedArticles, error: articlesError } = await query
      .order("published_at", { ascending: false })
      .limit(50);

    if (articlesError) {
      console.error("Error fetching articles for list:", articlesError);
      throw createError({
        statusCode: 500,
        statusMessage: "Could not fetch articles for the list",
      });
    }
    articles = fetchedArticles || [];
  }

  // 5. Create the RSS feed (no changes needed here)
  const feed = new RSS({
    title: `RSS Feed: ${listData.name}`,
    description: `Die neuesten Nachrichten für die Liste "${listData.name}".`,
    feed_url: `https://your-website.com/api/rss/list/${listId}`,
    site_url: "https://your-website.com",
    language: "de",
  });

  // 6. Add the fetched articles to the feed (no changes needed here)
  for (const article of articles) {
    const feedItem: any = {
      title: article.title || "Ohne Titel",
      description: article.content_html || article.snippet || "",
      url: article.link,
      author: article.author || article.newspaper?.name || "Unbekannte Quelle",
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