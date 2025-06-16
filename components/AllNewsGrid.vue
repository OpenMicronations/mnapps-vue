<script setup lang="ts">
const { getNewspapers } = useNewspaper();
const user = useSupabaseUser();
const userId = user.value?.id || null;

const { data: newspapers, pending } = await useAsyncData(
  "all-newspapers",
  getNewspapers
);
</script>

<template>
  <div v-if="newspapers && newspapers.length > 0"
    class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
    <div v-for="newspaper in newspapers" :key="newspaper.id"
      :id="String(newspaper.author) !== userId ? 'nmc' : undefined">
      <CountryCard :title="newspaper.name || undefined" :to="`/newspapers/${newspaper.id}`" />
    </div>
  </div>
</template>
