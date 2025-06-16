<script setup lang="ts">
const { getNewsLists } = useNewsList();
const user = useSupabaseUser();
const userId = user.value?.id || null;

const { data: newsLists, pending } = await useAsyncData(
  "all-newspapers",
  getNewsLists
);
</script>

<template>
  <div v-if="newsLists && newsLists.length > 0"
    class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
    <div v-for="newsList in newsLists" :key="newsList.id"
      :id="String(newsList.author) !== userId ? 'nmc' : undefined">
      <CountryCard :title="newsList.name || undefined" :to="`/rss-feeds/${newsList.id}`" />
    </div>
  </div>
</template>
