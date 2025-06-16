<script setup lang="ts">
definePageMeta({
  middleware: "auth",
});

// 1. useNewspaper anstelle von useCountry verwenden
const { getMyNewsLists } = useNewsList();

// 2. Daten für Zeitungen laden
const { data: newspapers, pending } = await useAsyncData(
  "my-newslists",
  getMyNewsLists
);
</script>

<template>
  <UContainer class="pt-4">
    <div class="flex gap-12">
      <div class="w-full">
        <!-- 3. Breadcrumbs anpassen -->
        <span>
          <NuxtLink
            class="text-sm font-bold mb-2 hover:underline"
            to="/mein"
          >
            Dashboard
          </NuxtLink>
          &nbsp;<span>></span>&nbsp;
          <NuxtLink
            class="text-sm text-primary font-bold mb-2 hover:underline"
            to="/mein/listen"
          >
            Newslisten
          </NuxtLink>
        </span>
        <div class="flex justify-between items-center">
          <h1 class="text-4xl font-bold">Meine News-Listen</h1>
          <!-- 4. Link zum Erstellen anpassen -->
          <ULink to="/mein/listen/create" target="_self">
            <UIcon
              name="i-lucide-circle-plus"
              class="size-6 hover:cursor-pointer hover:text-primary"
            />
          </ULink>
        </div>
        <USeparator class="mt-6" />
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="pending" class="flex justify-center items-center min-h-64">
      <div class="flex flex-col items-center gap-4">
        <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin" />
        <p class="text-gray-600">Lade Listen...</p>
      </div>
    </div>

    <!-- Newspapers grid -->
    <div
      v-else-if="newspapers && newspapers.length > 0"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4"
    >
      <!-- 5. NewspaperCard verwenden und über Zeitungen iterieren -->
      <CountryCard
        v-for="newspaper in newspapers"
        :key="newspaper.id"
        :title="newspaper.name || undefined"
        :to="`/mein/zeitungen/edit/${newspaper.id}`"
      />
    </div>

    <!-- Empty state -->
    <div v-else class="flex justify-center items-center min-h-64">
      <UCard>
        <div class="flex flex-col items-center gap-4 p-8">
          <!-- 6. Texte und Icons für Zeitungen anpassen -->
          <UIcon
            name="i-heroicons-newspaper"
            class="w-12 h-12 text-gray-400"
          />
          <h2 class="text-xl font-semibold text-gray-900">
            Noch keine Zeitungen
          </h2>
          <p class="text-gray-600 text-center">
            Erstelle deine erste Zeitung, um loszulegen.
          </p>
          <UButton to="/mein/listen/create" icon="i-heroicons-plus">
            Zeitung erstellen
          </UButton>
        </div>
      </UCard>
    </div>
  </UContainer>
</template>