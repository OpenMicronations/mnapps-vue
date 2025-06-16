import { z } from "zod";
import type { Database } from "~/types/supabase";
import { useNewspaper } from "~/composables/useNewspaper";

// Types from DB Schema
export type NewsList = Database["public"]["Tables"]["newspaper_list"]["Row"];
export type NewsListInsert =
  Database["public"]["Tables"]["newspaper_list"]["Insert"];
export type NewsListUpdate =
  Database["public"]["Tables"]["newspaper_list"]["Update"];

// Custom type for forms and lists, using the correct columns
export type NewsListEdit = Pick<
  NewsList,
  "id" | "name" | "newspapers" | "filter_authors" | "filter_categories"
>;
export type NewsListPlus = Pick<
  NewsList,
  | "id"
  | "name"
  | "newspapers"
  | "author"
  | "filter_authors"
  | "filter_categories"
>;

// Zod Schemas for Validation, using the correct columns
export const newsListBaseSchema = z.object({
  name: z.string().min(3, "Listenname muss mindestens 3 Zeichen lang sein."),
  newspapers: z
    .array(z.number())
    .min(1, "Die Liste muss mindestens eine Zeitung enthalten."),
  filter_authors: z.array(z.string()).optional(),
  filter_categories: z.array(z.string()).optional(),
});

export const newsListCreateSchema = newsListBaseSchema;
export const newsListEditSchema = newsListBaseSchema;

export type NewsListCreateInput = z.output<typeof newsListCreateSchema>;
export type NewsListEditInput = z.output<typeof newsListEditSchema>;

export const useNewsList = () => {
  const supabase = useSupabaseClient<Database>();
  const user = useSupabaseUser();
  const toast = useToast();
  const router = useRouter();
  const { getNewspapers } = useNewspaper();

  // --- DATA FETCHING (Corrected to use the right columns) ---

  const getNewsList = async (id: string): Promise<NewsListPlus> => {
    const { data, error } = await supabase
      .from("newspaper_list")
      .select(
        "id, name, newspapers, author, filter_authors, filter_categories",
      )
      .eq("id", id)
      .single();

    if (error) {
      throw createError({
        statusCode: 404,
        statusMessage: "Liste nicht gefunden",
      });
    }
    return data;
  };

  const getMyNewsLists = async (): Promise<NewsListPlus[]> => {
    if (!user.value?.id) return [];
    const { data, error } = await supabase
      .from("newspaper_list")
      .select(
        "id, name, newspapers, author, filter_authors, filter_categories",
      )
      .eq("author", user.value.id)
      .order("created_at", { ascending: false });
    if (error) return [];
    return data;
  };

  const getNewsLists = async (): Promise<NewsListPlus[]> => {
    const { data, error } = await supabase
      .from("newspaper_list")
      .select(
        "id, name, newspapers, author, filter_authors, filter_categories",
      )
      .order("created_at", { ascending: false });
    if (error) return [];
    return data;
  };

  // --- Fetching data for filter selection (This part was always correct) ---

  const { data: selectableAuthors, pending: pendingAuthors } = useAsyncData(
    "all-distinct-authors",
    async () => {
      const { data, error } = await supabase.rpc("get_distinct_authors");
      if (error) return [];
      return data.map((a) => a.author_name);
    },
  );

  const { data: selectableCategories, pending: pendingCategories } =
    useAsyncData("all-distinct-categories", async () => {
      const { data, error } = await supabase.rpc("get_distinct_categories");
      if (error) return [];
      return data.map((c) => c.category_name);
    });

  const { data: selectableNewspapers, pending: pendingNewspapers } =
    useAsyncData("all-newspapers-for-select", async () => {
      const newspapers = await getNewspapers();
      return newspapers.map((n) => ({
        label: n.name,
        value: n.id,
      }));
    });

  // --- CUD Operations (Corrected) ---

  const createNewsList = async (
    listData: NewsListCreateInput,
  ): Promise<{ success: boolean; listId?: string }> => {
    try {
      const { data, error } = await supabase
        .from("newspaper_list")
        .insert(listData as NewsListInsert)
        .select("id")
        .single();
      if (error) throw error;
      toast.add({
        title: "Liste erstellt!",
        icon: "i-heroicons-check-circle",
      });
      return { success: true, listId: data.id };
    } catch (error: any) {
      toast.add({
        title: "Fehler",
        description: error.message,
        color: "error", // FIX: 'red' is not a valid color
      });
      return { success: false };
    }
  };

  const updateNewsList = async (
    id: string,
    listData: NewsListEditInput,
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("newspaper_list")
        .update(listData as NewsListUpdate)
        .eq("id", id);
      if (error) throw error;
      toast.add({
        title: "Gespeichert!",
        icon: "i-heroicons-check-circle",
      });
      return true;
    } catch (error: any) {
      toast.add({
        title: "Fehler",
        description: error.message,
        color: "error", // FIX: 'red' is not a valid color
      });
      return false;
    }
  };

  // This function updates ONLY the author filter for a specific list.
  const editAuthorFilter = async (
    listId: string,
    authors: string[],
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("newspaper_list")
        .update({ filter_authors: authors }) // Update only the authors column
        .eq("id", listId);

      if (error) throw error;

      toast.add({
        title: "Autorenfilter gespeichert!",
        icon: "i-heroicons-check-circle",
      });
      return true;
    } catch (error: any) {
      toast.add({
        title: "Fehler",
        description: `Autorenfilter konnte nicht gespeichert werden: ${error.message}`,
        icon: "i-heroicons-x-circle",
        color: "error", // FIX: 'red' is not a valid color
      });
      return false;
    }
  };

  // This function updates ONLY the category filter for a specific list.
  const editCategoryFilter = async (
    listId: string,
    categories: string[],
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("newspaper_list")
        .update({ filter_categories: categories }) // Update only the categories column
        .eq("id", listId);

      if (error) throw error;

      toast.add({
        title: "Kategorienfilter gespeichert!",
        icon: "i-heroicons-check-circle",
      });
      return true;
    } catch (error: any) {
      toast.add({
        title: "Fehler",
        description: `Kategorienfilter konnte nicht gespeichert werden: ${error.message}`,
        icon: "i-heroicons-x-circle",
        color: "error", // FIX: 'red' is not a valid color
      });
      return false;
    }
  };

  // --- Form & Route Helpers (Corrected) ---

  const validateNewsListId = (routeId: string | string[]): string => {
    const id = Array.isArray(routeId) ? routeId[0] : routeId;
    if (!id) {
      throw createError({
        statusCode: 404,
        statusMessage: "Listen-ID fehlt",
      });
    }
    return id;
  };

  // FIX: This function now creates the state object with all required properties.
  const createFormState = () =>
    reactive({
      name: undefined as string | undefined,
      newspapers: [] as number[],
      filter_authors: [] as string[],
      filter_categories: [] as string[],
    });

  // FIX: This function now populates all properties of the state object.
  const populateFormState = (
    state: ReturnType<typeof createFormState>,
    list: NewsListEdit,
  ) => {
    state.name = list.name ?? undefined;
    state.newspapers = list.newspapers ?? [];
    state.filter_authors = list.filter_authors ?? [];
    state.filter_categories = list.filter_categories ?? [];
  };

  // Navigation helpers
  const navigateToNewsListEdit = (listId: string) => {
    router.push(`/rss-feeds/${listId}`);
  };

  const navigateToNewsList = () => {
    router.push("/rss-feeds");
  };

  return {
    // Schemas
    newsListCreateSchema,
    newsListEditSchema,
    // CRUD
    getNewsList,
    getMyNewsLists,
    getNewsLists,
    createNewsList,
    updateNewsList,
    editAuthorFilter, // <-- EXPORTED
    editCategoryFilter, // <-- EXPORTED
    // Data for UI
    selectableNewspapers,
    pendingNewspapers,
    selectableAuthors,
    pendingAuthors,
    selectableCategories,
    pendingCategories,
    // Helpers
    validateNewsListId,
    createFormState,
    populateFormState,
    navigateToNewsListEdit,
    navigateToNewsList,
  };
};