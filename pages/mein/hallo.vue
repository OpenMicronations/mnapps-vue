<script setup lang="ts">
import { z } from "zod";
import type { FormSubmitEvent } from "#ui/types";

definePageMeta({
  middleware: "auth",
});

const route = useRoute();
const supabase = useSupabaseClient();
const toast = useToast();

const routeId = route.params.id as string;

// 1. Daten mit useAsyncData abrufen (wie zuvor)
const { data: country, pending } = await useAsyncData(
  `country-${routeId}`,
  async () => {
    const { data, error } = await supabase
      .from("country")
      .select("id, name, full_name, short") // Nur benötigte Felder abrufen
      .eq("id", routeId)
      .single();

    if (error) {
      throw createError({
        statusCode: 404,
        statusMessage: "Land nicht gefunden",
      });
    }
    return data;
  }
);

// 2. Zod-Schema für die Formularvalidierung definieren
const schema = z.object({
  name: z.string().min(3, "Name muss mindestens 3 Zeichen lang sein."),
  description: z.string().optional(), // Beschreibung ist optional
});

type Schema = z.output<typeof schema>;

// 3. Reaktiver Zustand für das Formular
// Wir initialisieren ihn leer und füllen ihn, sobald die Daten geladen sind.
const state = reactive({
  name: undefined,
  full_name: undefined,
  short: undefined
});

// 4. Beobachten, wann die Länderdaten geladen werden, und das Formular ausfüllen
watch(
  country,
  (newCountry) => {
    if (newCountry) {
      state.name = newCountry.name;
      state.full_name = newCountry.full_name;
      state.short = newCountry.short;
    }
  },
  { immediate: true } // 'immediate' stellt sicher, dass dies beim ersten Laden ausgeführt wird
);

// 5. Funktion zum Behandeln der Formularübermittlung
const loading = ref(false);
async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true;
  try {
    const { error } = await supabase
      .from("country")
      .update(event.data) // event.data enthält die validierten Formulardaten
      .eq("id", routeId);

    if (error) throw error;

    toast.add({
      title: "Gespeichert!",
      description: "Das Land wurde erfolgreich aktualisiert.",
      icon: "i-heroicons-check-circle",
      color: "green",
    });
  } catch (error: any) {
    toast.add({
      title: "Fehler",
      description: `Konnte nicht speichern: ${error.message}`,
      icon: "i-heroicons-x-circle",
      color: "red",
    });
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <UContainer class="pt-4">
    <!-- Ladezustand anzeigen -->
    <div v-if="pending">Lade Land...</div>

    <!-- Hauptinhalt anzeigen, wenn die Daten geladen sind -->
    <div v-else-if="country">
      <div class="flex gap-12">
        <div class="w-full">
          <span>
            <NuxtLink
              class="text-sm font-bold mb-2 hover:underline"
              to="/mein"
              >Dashboard</NuxtLink
            >
            &nbsp;<span>></span>&nbsp;
            <NuxtLink
              class="text-sm text-primary font-bold mb-2 hover:underline"
              to="/mein/laender"
              >Länder</NuxtLink
            >
          </span>
          <div class="flex justify-between items-center mt-2">
            <h1 class="text-4xl font-bold">
              {{ country.name }} bearbeiten
            </h1>
          </div>
          <USeparator class="my-6" />
        </div>
      </div>

      <!-- Nuxt UI Formular mit der NEUEN <UFormField> Komponente -->
      <UForm
        :schema="schema"
        :state="state"
        class="space-y-4 md:w-1/2"
        @submit="onSubmit"
      >
        <!-- ALT: <UFormGroup label="Name..." name="name"> -->
        <UFormField name="full_name" label="Ganzer Name">
          <UInput v-model="state.full_name" placeholder="z.B. Verbundsrepublik Gurkistan" class="w-full" />
        </UFormField>

        <UFormField name="short" label="Abkürzung">
          <UInput v-model="state.short" class="w-12" />
        </UFormField>

        <!-- ALT: <UFormGroup label="Beschreibung..." name="description"> -->
        <!--<UFormField name="description" label="Beschreibung (optional)">
          <UTextarea
            v-model="state.description"
            placeholder="Eine kurze Beschreibung..."
          />
        </UFormField>-->

        <UButton type="submit" :loading="loading"> Änderungen speichern </UButton>
      </UForm>
    </div>
  </UContainer>
</template>

---

a. Short muss 2 oder 3 Zeichen lang sein, nur Buchstaben
b. Das Design ist noch nicht perfekt - gerne etwas schöner mit Nuxt 