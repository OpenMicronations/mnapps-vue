import { z } from "zod";
import type { Database } from "~/types/supabase";

// Types
export type Country = Database["public"]["Tables"]["country"]["Row"];
export type CountryInsert = Database["public"]["Tables"]["country"]["Insert"];
export type CountryUpdate = Database["public"]["Tables"]["country"]["Update"];
export type CountryEdit = Pick<Country, "id" | "name" | "full_name" | "short" >;
export type CountryPlus = Pick<Country, "id" | "name" | "full_name" | "short" | "author" >;

interface CountrySelect {
  id: number;
  name: string;
}

// Schemas
export const countryCreateSchema = z.object({
  name: z.string().min(3, "Name muss mindestens 3 Zeichen lang sein."),
  full_name: z
    .string()
    .min(3, "Ganzer Name muss mindestens 3 Zeichen lang sein."),
  short: z
    .string()
    .min(2, "Abkürzung muss mindestens 2 Zeichen lang sein.")
    .max(3, "Abkürzung darf maximal 3 Zeichen lang sein.")
    .regex(/^[A-Za-z]+$/, "Abkürzung darf nur Buchstaben enthalten."),
});

export const countryEditSchema = z.object({
  full_name: z
    .string()
    .min(3, "Ganzer Name muss mindestens 3 Zeichen lang sein."),
  short: z
    .string()
    .min(2, "Abkürzung muss mindestens 2 Zeichen lang sein.")
    .max(3, "Abkürzung darf maximal 3 Zeichen lang sein.")
    .regex(/^[A-Za-z]+$/, "Abkürzung darf nur Buchstaben enthalten."),
});

export type CountryCreateInput = z.output<typeof countryCreateSchema>;
export type CountryEditInput = z.output<typeof countryEditSchema>;

export const useCountry = () => {
  const supabase = useSupabaseClient<Database>();
  const toast = useToast();
  const router = useRouter();

  // --- START: Added for reactive select menu data ---
  const getCountriesForSelect = async (): Promise<CountrySelect[]> => {
    const { data, error } = await supabase
      .from("country")
      .select("id, name")
      .order("name");

    if (error) {
      // Log error instead of throwing, as useAsyncData will handle it
      console.error("Fehler beim Laden der Länder für Select:", error);
      return [];
    }

    return data || [];
  };

  const {
    data: countriesForSelect,
    pending: pendingSelect,
    error: errorSelect,
  } = useAsyncData<CountrySelect[]>(
    "countries-for-select",
    () => getCountriesForSelect(),
    {
      default: () => [],
    }
  );
  // --- END: Added for reactive select menu data ---

  // Get single country by ID
  const getCountry = async (id: number): Promise<CountryPlus> => {
    // ... (rest of the function is unchanged)
    const { data, error } = await supabase
      .from("country")
      .select("id, name, full_name, short, author")
      .eq("id", id)
      .single();

    if (error) {
      throw createError({
        statusCode: 404,
        statusMessage: "Land nicht gefunden",
      });
    }

    return data;
  };

  // Get all countries
  const getCountries = async (): Promise<CountryPlus[]> => {
    // ... (rest of the function is unchanged)
    const { data, error } = await supabase
      .from("country")
      .select("id, name, full_name, short, author")
      .order("name");

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: "Fehler beim Laden der Länder",
      });
    }

    return data || [];
  };

  // Get user's countries
  const getMyCountries = async (): Promise<CountryEdit[]> => {
    // ... (rest of the function is unchanged)
    const user = useSupabaseUser();

    if (!user.value?.id) return [];

    const { data, error } = await supabase
      .from("country")
      .select("id, name, full_name, short")
      .eq("author", user.value.id)
      .order("name");

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: "Fehler beim Laden der Länder",
      });
    }

    return data || [];
  };

  // Create country
  const createCountry = async (
    countryData: CountryCreateInput
  ): Promise<{ success: boolean; countryId?: number }> => {
    // ... (rest of the function is unchanged)
    try {
      const insertData: CountryInsert = countryData;
      const { error: insertError } = await supabase
        .from("country")
        .insert(insertData);

      if (insertError) throw insertError;

      // Get the created country's ID
      const { data: country, error: queryError } = await supabase
        .from("country")
        .select("id")
        .eq("name", insertData.name ?? "")
        .single();

      if (queryError) throw queryError;

      toast.add({
        title: "Erstellt!",
        description: "Das Land wurde erfolgreich erstellt.",
        icon: "i-heroicons-check-circle",
        color: "success",
      });

      return { success: true, countryId: country.id };
    } catch (error: any) {
      toast.add({
        title: "Fehler",
        description: `Konnte nicht erstellen: ${error.message}`,
        icon: "i-heroicons-x-circle",
        color: "error",
      });
      return { success: false };
    }
  };

  // Update country
  const updateCountry = async (
    id: number,
    countryData: CountryEditInput
  ): Promise<boolean> => {
    // ... (rest of the function is unchanged)
    try {
      const updateData: CountryUpdate = countryData;
      const { error } = await supabase
        .from("country")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;

      toast.add({
        title: "Gespeichert!",
        description: "Das Land wurde erfolgreich aktualisiert.",
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

  // Delete country
  const deleteCountry = async (id: number): Promise<boolean> => {
    // ... (rest of the function is unchanged)
    try {
      const { error } = await supabase.from("country").delete().eq("id", id);

      if (error) throw error;

      toast.add({
        title: "Gelöscht!",
        description: "Das Land wurde erfolgreich gelöscht.",
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

  // Validate country ID from route
  const validateCountryId = (routeId: string | string[]): number => {
    // ... (rest of the function is unchanged)
    const id = Number(routeId);
    if (isNaN(id)) {
      throw createError({
        statusCode: 404,
        statusMessage: "Land nicht gefunden",
      });
    }
    return id;
  };

  // Create reactive state for forms
  const createCountryFormState = () =>
    reactive<{
      name: string | undefined;
      full_name: string | undefined;
      short: string | undefined;
    }>({
      name: undefined,
      full_name: undefined,
      short: undefined,
    });

  const createEditFormState = () =>
    reactive<{
      full_name: string | undefined;
      short: string | undefined;
    }>({
      full_name: undefined,
      short: undefined,
    });

  // Populate form state from country data
  const populateFormState = (
    state: any,
    country: CountryEdit,
    includeNames = true
  ) => {
    // ... (rest of the function is unchanged)
    if (includeNames && "name" in state) {
      state.name = country.name || undefined;
    }
    state.full_name = country.full_name || undefined;
    state.short = country.short || undefined;
  };

  // Navigation helpers
  const navigateToCountryEdit = (countryId: number) => {
    router.push(`/countries/${countryId}`);
  };

  const navigateToCountryList = () => {
    router.push("/countries");
  };

  return {
    // Types
    countryCreateSchema,
    countryEditSchema,
    // CRUD operations
    getCountry,
    getCountries,
    getMyCountries,
    createCountry,
    updateCountry,
    deleteCountry,
    // Utilities
    validateCountryId,
    createCountryFormState,
    createEditFormState,
    populateFormState,
    // Navigation
    navigateToCountryEdit,
    navigateToCountryList,

    // --- MODIFIED: Export reactive data instead of the fetch function ---
    countriesForSelect,
    pendingSelect,
    errorSelect,
  };
};