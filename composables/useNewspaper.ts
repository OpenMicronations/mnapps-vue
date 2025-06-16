import { z } from "zod";
import type { Database } from "~/types/supabase";
import { useCountry } from "~/composables/useCountry"; // Wichtig

// Types
export type Newspaper = Database["public"]["Tables"]["newspaper"]["Row"];
export type NewspaperInsert =
  Database["public"]["Tables"]["newspaper"]["Insert"];
export type NewspaperUpdate =
  Database["public"]["Tables"]["newspaper"]["Update"];
export type NewspaperEdit = Pick<
  Newspaper,
  "id" | "name" | "url" | "rss" | "country" | "description"
>;
export type NewspaperPlus = Pick<
  Newspaper,
  "id" | "name" | "url" | "rss" | "country" | "description" | "author"
>;

// Zod Schemas
export const newspaperBaseSchema = z.object({
  name: z.string().min(3, "Name muss mindestens 3 Zeichen lang sein."),
  url: z.string().url("Muss eine gültige URL sein.").optional().or(z.literal("")),
  rss: z.string().url("RSS-Feed-URL muss eine gültige URL sein."),
  country: z.number({
    required_error: "Bitte wähle ein Land aus.",
    invalid_type_error: "Bitte wähle ein Land aus.",
  }),
  description: z.string().optional(),
});

export const newspaperCreateSchema = newspaperBaseSchema;
export const newspaperEditSchema = newspaperBaseSchema;

export type NewspaperCreateInput = z.output<typeof newspaperCreateSchema>;
export type NewspaperEditInput = z.output<typeof newspaperEditSchema>;

export const useNewspaper = () => {
  // Standard-Composables
  const supabase = useSupabaseClient<Database>();
  const user = useSupabaseUser();
  const toast = useToast();
  const router = useRouter();

  // --- KERNÄNDERUNG: useCountry konsumieren ---
  // Wir holen uns die reaktiven Daten direkt aus dem Country-Composable.
  // Das ist effizient, da die Daten dank useAsyncData nur einmal geladen werden.
  const {
    countriesForSelect,
    pendingSelect: pendingCountries, // Umbenannt für Klarheit
  } = useCountry();

  // Get single newspaper by ID
  const getNewspaper = async (id: number): Promise<NewspaperPlus> => {
    const { data, error } = await supabase
      .from("newspaper")
      .select("id, name, url, rss, country, description, author")
      .eq("id", id)
      .single();

    if (error) {
      throw createError({
        statusCode: 404,
        statusMessage: "Zeitung nicht gefunden",
      });
    }
    return data;
  };

  // Get all newspapers
  const getNewspapers = async (): Promise<NewspaperPlus[]> => {
    const { data, error } = await supabase
      .from("newspaper")
      .select("id, name, url, rss, country, description, author")
      .order("name");

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: "Fehler beim Laden der Zeitungen",
      });
    }
    return data || [];
  };

  // Get user's newspapers
  const getMyNewspapers = async (): Promise<NewspaperEdit[]> => {
    if (!user.value?.id) return [];

    const { data, error } = await supabase
      .from("newspaper")
      .select("id, name, url, rss, country, description")
      .eq("author", user.value.id)
      .order("name");

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: "Fehler beim Laden der Zeitungen",
      });
    }
    return data || [];
  };

  const getNewspaperOfCountry = async (id: number): Promise<NewspaperEdit[]> => {

    const { data, error } = await supabase
      .from("newspaper")
      .select("id, name, url, rss, country, description")
      .eq("country", id)
      .order("name");

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: "Fehler beim Laden der Zeitungen",
      });
    }
    return data || [];
  }

  // Create newspaper
  const createNewspaper = async (
    newspaperData: NewspaperCreateInput,
  ): Promise<{ success: boolean; newspaperId?: number }> => {
    try {
      const { data, error } = await supabase
        .from("newspaper")
        .insert(newspaperData as NewspaperInsert)
        .select("id")
        .single();

      if (error) throw error;

      toast.add({
        title: "Erstellt!",
        description: `Zeitung "${newspaperData.name}" wurde hinzugefügt.`,
        icon: "i-heroicons-check-circle",
        color: "success",
      });
      return { success: true, newspaperId: data.id };
    } catch (error: any) {
      toast.add({
        title: "Fehler",
        description: `Konnte Zeitung nicht erstellen: ${error.message}`,
        icon: "i-heroicons-x-circle",
        color: "error",
      });
      return { success: false };
    }
  };

  // Update newspaper
  const updateNewspaper = async (
    id: number,
    newspaperData: NewspaperEditInput,
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from("newspaper")
        .update(newspaperData as NewspaperUpdate)
        .eq("id", id);

      if (error) throw error;

      toast.add({
        title: "Gespeichert!",
        description: "Zeitung wurde erfolgreich aktualisiert.",
        icon: "i-heroicons-check-circle",
        color: "success",
      });
      return true;
    } catch (error: any) {
      toast.add({
        title: "Fehler",
        description: `Konnte nicht speichern: ${error.message}`,
        icon: "i-heroicons-x-circle",
        color: "error",
      });
      return false;
    }
  };

  // Delete newspaper
  const deleteNewspaper = async (id: number): Promise<boolean> => {
    try {
      const { error } = await supabase.from("newspaper").delete().eq("id", id);
      if (error) throw error;
      toast.add({
        title: "Gelöscht!",
        description: "Zeitung wurde erfolgreich gelöscht.",
        icon: "i-heroicons-check-circle",
        color: "success",
      });
      return true;
    } catch (error: any) {
      toast.add({
        title: "Fehler",
        description: `Konnte nicht löschen: ${error.message}`,
        icon: "i-heroicons-x-circle",
        color: "error",
      });
      return false;
    }
  };

  // Validate newspaper ID from route
  const validateNewspaperId = (routeId: string | string[]): number => {
    const id = Number(routeId);
    if (isNaN(id)) {
      throw createError({
        statusCode: 404,
        statusMessage: "Zeitung nicht gefunden",
      });
    }
    return id;
  };

  // Create form state
  const createFormState = () =>
    reactive({
      name: undefined as string | undefined,
      url: undefined as string | undefined,
      rss: undefined as string | undefined,
      country: undefined as number | undefined,
      description: undefined as string | undefined,
    });

  // Populate form state from newspaper data
  const populateFormState = (
    state: ReturnType<typeof createFormState>,
    newspaper: NewspaperEdit,
  ) => {
    state.name = newspaper.name ?? undefined;
    state.url = newspaper.url ?? undefined;
    state.rss = newspaper.rss ?? undefined;
    state.country = newspaper.country ?? undefined;
    state.description = newspaper.description ?? undefined;
  };

  // Navigation helpers
  const navigateToNewspaperEdit = (newspaperId: number) => {
    router.push(`/newspapers/${newspaperId}`);
  };

  const navigateToNewspaperList = () => {
    router.push("/newspapers");
  };

  return {
    // Schemas
    newspaperCreateSchema,
    newspaperEditSchema,
    // CRUD
    getNewspaper,
    getNewspapers,
    getNewspaperOfCountry,
    getMyNewspapers,
    createNewspaper,
    updateNewspaper,
    deleteNewspaper,
    // Form & Validation
    validateNewspaperId,
    createFormState,
    populateFormState,
    // Navigation
    navigateToNewspaperEdit,
    navigateToNewspaperList,
    // --- BEREITGESTELLT VON useCountry ---
    countriesForSelect,
    pendingCountries,
  };
};