/*import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Parser from "https://esm.sh/rss-parser@3.13.0";

const parser = new Parser();

console.log("Function 'process-newspapers' starting up.");

Deno.serve(async (_req) => {
  try {
    // Admin-Client erstellen, um RLS zu umgehen
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      {
        auth: {
          persistSession: false,
        },
      }
    );

    // 1. Alle Zeitungen mit einer RSS-URL abrufen
    const { data: newspapers, error: newspapersError } = await supabase
      .from("newspaper")
      .select("id, rss")
      .not("rss", "is", null); // Nur die mit einer RSS-URL

    if (newspapersError) throw newspapersError;

    console.log(`Found ${newspapers.length} newspapers to process.`);

    // 2. Durch alle Zeitungen loopen
    for (const newspaper of newspapers) {
      try {
        console.log(`Processing feed for newspaper ID: ${newspaper.id}`);
        const feed = await parser.parseURL(newspaper.rss);

        if (!feed?.items?.length) {
          console.log(`No items found in feed for newspaper ${newspaper.id}`);
          continue; // Nächste Zeitung
        }

        // 3. Artikel für die Datenbank vorbereiten
        const articlesToInsert = feed.items.map((item) => ({
          newspaper_id: newspaper.id,
          title: item.title,
          link: item.link,
          snippet: item.contentSnippet?.slice(0, 500), // Kurzfassung
          published_at: item.isoDate ? new Date(item.isoDate) : new Date(),
        }));

        // 4. Artikel in die DB einfügen (ignoriert Duplikate dank onConflict)
        const { error: insertError } = await supabase
          .from("parsed_news")
          .upsert(articlesToInsert, {
            onConflict: "link", // Unser UNIQUE-Constraint
          });

        if (insertError) {
          console.error(
            `Error inserting articles for newspaper ${newspaper.id}:`,
            insertError.message
          );
        } else {
          console.log(
            `Successfully processed ${articlesToInsert.length} items for newspaper ${newspaper.id}`
          );
        }
      } catch (feedError) {
        console.error(
          `Failed to process feed for newspaper ${newspaper.id} at URL ${newspaper.rss}:`,
          feedError.message
        );
        // Wichtig: Wir brechen nicht ab, sondern machen mit der nächsten Zeitung weiter
        continue;
      }
    }

    return new Response(JSON.stringify({ message: "All feeds processed." }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("A critical error occurred:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
});*/