<script setup lang="ts">
// Definiere die Struktur für einen einzelnen Artikel
interface Article {
  title: string;
  link: string;
  description: string;
  author: string;
  pubDate: string;
}

// Definiere die Struktur für die geparsten Daten aus dem Feed
interface ListData {
  listTitle: string;
  articles: Article[];
}

const route = useRoute();
const listId = route.params.id as string;

// Rufe die Daten vom personalisierten RSS-Feed-Endpunkt ab
const { data, pending, error } = await useFetch(`/api/rss/list/${listId}`, {
  // Ein eindeutiger Key ist bei dynamischen Routen entscheidend,
  // um Caching- und Hot-Reload-Probleme zu vermeiden.
  key: `list-${listId}`,

  server: false, // Wichtig für den DOMParser
  cache: "no-cache", // Stellt sicher, dass immer die neuesten Daten geladen werden

  // Die transform-Funktion wandelt die rohe Antwort in unser Datenobjekt um
  transform: async (rawData: unknown): Promise<ListData> => {
    // Wir erwarten ein Blob, aber prüfen den Typ zur Laufzeit
    if (!(rawData instanceof Blob)) {
      console.error("Unerwartete Daten empfangen, erwarte Blob.", rawData);
      return { listTitle: "Fehler", articles: [] };
    }

    const xmlString = await rawData.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, "application/xml");

    if (doc.querySelector("parsererror")) {
      console.error("Fehler beim Parsen des XML-Feeds.", xmlString);
      return { listTitle: "Parsing Fehler", articles: [] };
    }

    // Extrahiere den Titel der Liste aus dem <channel>-Tag
    const listTitle =
      doc.querySelector("channel > title")?.textContent || "Unbenannte Liste";

    // Extrahiere die Artikel aus den <item>-Tags
    const articles = Array.from(doc.querySelectorAll("item")).map((item) => {
      const getText = (selector: string) =>
        item.querySelector(selector)?.textContent || "";
      return {
        title: getText("title"),
        link: getText("link"),
        description: getText("description"),
        author: getText("author") || getText("dc\\:creator"),
        pubDate: getText("pubDate"),
      };
    });

    return { listTitle, articles };
  },
});

// Setze den Seitentitel dynamisch basierend auf dem Listennamen
useHead({
  title: data.value?.listTitle || "Nachrichtenliste",
});

// Helferfunktion zur Datumsformatierung
const formatDate = (dateString: string) => {
  if (!dateString) return "";
  return new Date(dateString).toLocaleDateString("de-DE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
</script>

<template>
  <UContainer class="py-8">
    <!-- Ladezustand -->
    <div v-if="pending" class="space-y-4">
      <USkeleton class="h-8 w-1/2" />
      <USkeleton v-for="i in 3" :key="i" class="h-32 w-full" />
    </div>

    <!-- Fehlerzustand (z.B. Liste nicht gefunden) -->
    <div v-else-if="error">
      <UAlert
        icon="i-heroicons-exclamation-triangle"
        color="error"
        variant="soft"
        title="Liste nicht gefunden"
        :description="error.message"
      />
      <UButton to="/newspaper/all" class="mt-4">Zurück zur Übersicht</UButton>
    </div>

    <!-- Erfolgreiche Anzeige -->
    <div v-else-if="data" class="space-y-6">
      <h1 class="text-3xl font-bold">{{ data.listTitle }}</h1>

      <!-- Fall: Liste ist leer -->
      <div v-if="data.articles.length === 0">
        <UAlert
          icon="i-heroicons-inbox"
          title="Diese Liste ist leer"
          description="Für die ausgewählten Zeitungen wurden noch keine Artikel gefunden."
        />
      </div>

      <!-- Fall: Liste hat Artikel -->
      <div v-else class="space-y-4">
        <UCard v-for="(article, index) in data.articles" :key="index">
          <template #header>
            <NuxtLink
              :to="article.link"
              target="_blank"
              class="text-xl font-semibold text-primary-600 dark:text-primary-400 hover:underline"
            >
              {{ article.title }}
            </NuxtLink>
          </template>

          <p class="text-gray-600 dark:text-gray-300">
            {{ article.description }}
          </p>

          <template #footer>
            <div
              class="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400"
            >
              <span>{{ article.author }}</span>
              <span>{{ formatDate(article.pubDate) }}</span>
            </div>
          </template>
        </UCard>
      </div>
    </div>
  </UContainer>
</template>