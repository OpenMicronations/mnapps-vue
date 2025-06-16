<script setup lang="ts">
import type { Database } from "~/types/supabase"; // Annahme: du hast Typen generiert

// Definiere den Typ für unseren Artikel, inklusive des verknüpften Zeitungsnamens
type ArticleWithNewspaper = Database["public"]["Tables"]["parsed_news"]["Row"] & {
  newspaper: {
    name: string | null;
  } | null;
};

const route = useRoute();
const articleId = route.params.id as string;

// Rufe die Daten für den spezifischen Artikel ab
const { data: article, error } = await useFetch<ArticleWithNewspaper>(
  `/api/articles/${articleId}`,
  {
    // Ein eindeutiger Key ist wichtig für dynamische Seiten
    key: `article-${articleId}`,
  }
);

// Formatiere das Datum für die Anzeige
const formattedDate = computed(() => {
  if (!article.value?.published_at) return "";
  return new Date(article.value.published_at).toLocaleDateString("de-DE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});

// Setze den Seitentitel dynamisch
useHead({
  title: article.value?.title || "Artikel",
});
</script>

<template>
  <UContainer class="py-8">
    <!-- Fehlerbehandlung, z.B. für 404 Not Found -->
    <div v-if="error">
      <UAlert
        icon="i-heroicons-exclamation-triangle"
        color="red"
        variant="soft"
        title="Artikel nicht gefunden"
        :description="error.message"
      />
      <UButton to="/newspaper/all" class="mt-4">Zurück zur Übersicht</UButton>
    </div>

    <!-- Anzeige des Artikels -->
    <div v-else-if="article">
      <!-- Breadcrumb-Navigation für bessere UX -->
      <UBreadcrumb
        :links="[
          { label: 'Home', to: '/' },
          { label: 'Nachrichten', to: '/newspaper/all' },
          { label: article.title || 'Artikel' },
        ]"
        class="mb-4"
      />

      <UCard>
        <div class="space-y-4">
          <!-- Metadaten: Quelle und Datum -->
          <div
            class="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400"
          >
            <span class="font-semibold">{{
              article.newspaper?.name || "Unbekannte Quelle"
            }}</span>
            <span v-if="formattedDate">|</span>
            <span>{{ formattedDate }}</span>
          </div>

          <!-- Titel -->
          <h1 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            {{ article.title }}
          </h1>

          <!-- Snippet/Beschreibung aus dem RSS-Feed -->
          <UAlert
            icon="i-heroicons-chat-bubble-left-right"
            :description="article.snippet || 'Keine Beschreibung verfügbar.'"
            class="prose dark:prose-invert max-w-none"
          />

          <!-- Prominenter Button zum Originalartikel -->
          <div class="pt-4">
            <UButton
              :to="article.link"
              target="_blank"
              icon="i-heroicons-arrow-top-right-on-square"
              size="xl"
              label="Ganzen Artikel lesen"
              trailing
            />
          </div>
        </div>
      </UCard>
    </div>
  </UContainer>
</template>