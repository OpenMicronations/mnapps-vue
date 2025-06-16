import type { Database } from "./supabase";

// Type for an article with the newspaper name joined
export type ArticleWithNewspaper =
  Database["public"]["Tables"]["parsed_news"]["Row"] & {
    newspaper: {
      name: string | null;
    } | null;
  };