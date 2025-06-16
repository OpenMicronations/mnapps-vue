<script setup lang="ts">
import type { ArticleWithNewspaper } from "~/types/article";

const props = defineProps<{
  article: ArticleWithNewspaper;
}>();

const formattedDate = computed(() => {
  if (!props.article.published_at) return "";
  return new Date(props.article.published_at).toLocaleDateString("de-DE", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
});
</script>

<template>
  <UCard>
    <div class="space-y-3">
      <div
        class="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400"
      >
        <span class="font-semibold">{{
          article.newspaper?.name || "Unbekannte Quelle"
        }}</span>
        <span v-if="formattedDate">|</span>
        <span>{{ formattedDate }}</span>
      </div>

      <!-- Using h2 for better semantics in a list -->
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white">
        {{ article.title }}
      </h2>

      <p class="text-gray-600 dark:text-gray-300 line-clamp-3">
        {{ article.snippet || "Keine Beschreibung verfügbar." }}
      </p>

      <div class="pt-2">
        <UButton
          :to="article.link"
          target="_blank"
          icon="i-heroicons-arrow-top-right-on-square"
          label="Zum Artikel"
          trailing
          variant="soft"
        />
      </div>
    </div>
  </UCard>
</template>