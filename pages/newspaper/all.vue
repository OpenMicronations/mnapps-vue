<script setup lang="ts">
// Definiere, wie ein einzelner Artikel aussehen soll
interface Article {
  title: string;
  link: string;
  description: string;
  author: string;
  pubDate: string;
}

const {
  data: articles,
  pending,
  error,
} = await useFetch("/api/rss/all", {
  // --- FIX #1: Gib dem Fetch einen stabilen Schlüssel ---
  // Das löst die "Incompatible options" Warnung und stabilisiert das Hot-Reloading.
  key: "fetchAllArticles",

  server: false,
  cache: "no-cache",

  // --- FIX #2: Korrekte Verarbeitung des Blobs ---
  // Die Funktion muss 'async' sein und den Blob in Text umwandeln.
  transform: async (data: Blob): Promise<Article[]> => {
    // Wir erwarten einen Blob, keinen String mehr.
    if (!(data instanceof Blob)) {
      console.error("Unerwartete Daten empfangen, erwarte Blob.", data);
      return [];
    }

    // Wandle den Blob-Inhalt in einen Text um. .text() gibt ein Promise zurück.
    const xmlString = await data.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlString, "application/xml");

    if (doc.querySelector("parsererror")) {
      console.error("Fehler beim Parsen des XML-Feeds.", xmlString);
      return [];
    }

    return Array.from(doc.querySelectorAll("item")).map((item) => {
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
  },
});

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
  <UContainer>
    <h1 class="text-3xl font-bold my-8">Aggregierte Nachrichten</h1>

    <!-- Ladezustand anzeigen -->
    <div v-if="pending" class="text-center">
      <p>Lade Nachrichten...</p>
    </div>

    <!-- Fehlerzustand anzeigen -->
    <div v-else-if="error">
      <UAlert
        icon="i-heroicons-exclamation-triangle"
        color="red"
        variant="soft"
        title="Fehler beim Laden der Nachrichten"
        :description="error.message"
      />
    </div>

    <!-- Die Artikel anzeigen, wenn alles geklappt hat -->
    <div v-else class="space-y-4">
      <UCard v-for="(article, index) in articles" :key="index">
        <template #header>
          <!-- Der Titel ist ein klickbarer Link zum Originalartikel -->
          <NuxtLink
            :to="article.link"
            target="_blank"
            class="text-xl font-semibold text-primary-600 dark:text-primary-400 hover:underline"
          >
            {{ article.title }}
          </NuxtLink>
        </template>

        <!-- Die Beschreibung des Artikels -->
        <p class="text-gray-600 dark:text-gray-300">
          {{ article.description }}
        </p>

        <template #footer>
          <!-- Autor und Datum im Footer für Zusatzinfos -->
          <div
            class="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400"
          >
            <span>{{ article.author }}</span>
            <span>{{ formatDate(article.pubDate) }}</span>
          </div>
        </template>
      </UCard>
    </div>
  </UContainer>
</template>