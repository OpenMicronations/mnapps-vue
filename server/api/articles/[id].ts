import { createClient } from "@supabase/supabase-js";

export default defineEventHandler(async (event) => {
  // 1. Lade die sichere Runtime-Konfiguration
  const config = useRuntimeConfig(event);

  // 2. Hole die ID aus der URL (z.B. die '123' aus '/api/articles/123')
  const id = getRouterParam(event, "id");

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: "Article ID is required",
    });
  }

  // 3. Erstelle den Admin-Client
  const supabaseAdmin = createClient(
    config.supabaseUrl!,
    config.supabaseServiceKey!
  );

  // 4. Frage exakt einen Artikel ab und hole den Namen der Zeitung mit
  const { data: article, error } = await supabaseAdmin
    .from("parsed_news")
    .select("*, newspaper(name)") // '*' holt alle Spalten
    .eq("id", id)
    .single(); // .single() erwartet genau ein Ergebnis (oder null)

  // 5. Behandle Fehler, z.B. wenn der Artikel nicht gefunden wurde
  if (error) {
    console.error(`Error fetching article ${id}:`, error);
    throw createError({
      statusCode: 404,
      statusMessage: "Article not found",
    });
  }

  // 6. Gib den gefundenen Artikel zurück
  return article;
});