<script setup lang="ts">
// 1. Import `ref` and `useToast`
import { computed, ref } from "vue";
import { useToast } from "#imports";

const { getNewspaper, validateNewspaperId } = useNewspaper();
const user = useSupabaseUser();
const userId = computed(() => user.value?.id || null);

const route = useRoute();
const toast = useToast(); // Initialize toast for notifications
const routeId = computed(() => validateNewspaperId(route.params.id));

const { data: newspaper, pending } = useAsyncData(
  "newspaper-details",
  () => getNewspaper(routeId.value),
  {
    watch: [routeId],
  },
);

// This ref is for the delete button
const loading = ref(false);
// 2. Create a separate loading state for the reload button
const isReloading = ref(false);

// 3. Add the function to handle the API call
async function handleReload() {
  if (!routeId.value) {
    toast.add({
      title: "Error",
      description: "Newspaper ID is missing.",
      color: "red",
    });
    return;
  }

  isReloading.value = true;
  try {
    const response = await $fetch(`/api/refresh/${routeId.value}`, {
      method: "GET",
    });
    toast.add({
      title: "Refresh Started!",
      description: response.message || "New articles should appear shortly.",
      icon: "i-lucide-check-circle",
      color: "green",
    });
  } catch (error) {
    console.error("Failed to refresh feed:", error);
    toast.add({
      title: "Refresh Failed",
      description: error.data?.message || "Could not connect to the server.",
      icon: "i-lucide-x-circle",
      color: "red",
    });
  } finally {
    isReloading.value = false;
  }
}
</script>

<template>
  <div v-if="pending" class="flex justify-center items-center min-h-64">
    <div class="flex flex-col items-center gap-4">
      <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin" />
      <p class="text-gray-600">Lade Zeitung...</p>
    </div>
  </div>

  <!-- Main content -->
  <div v-else-if="newspaper">
    <NuxtLink to="/newspapers" class="">
      <p class="flex gap-2 items-center text-white/40 hover:text-white">
        <UIcon name="i-lucide-arrow-left" class="size-5"></UIcon> Zurück
      </p>
    </NuxtLink>
    <div class="flex justify-between items-center">
      <h2 class="text-3xl font-bold">{{ newspaper.name }}</h2>
      <div v-if="userId == newspaper.author" class="flex gap-2">
        <NewspaperEditModal>
          <UButton
            variant="soft"
            leading-icon="i-lucide-pen"
            class="hover:cursor-pointer"
            >Bearbeiten
          </UButton>
        </NewspaperEditModal>

        <!-- 4. ADDED THE RELOAD BUTTON HERE -->
        <UButton
          variant="soft"
          :leading-icon="isReloading ? 'i-lucide-loader' : 'i-lucide-rss'"
          :class="{ 'animate-spin': isReloading }"
          :disabled="isReloading"
          @click="handleReload"
        >
          {{ isReloading ? "Reloading..." : "Reload Feed" }}
        </UButton>

        <NewspaperDeleteModal>
          <UButton
            variant="outline"
            color="error"
            leading-icon="i-lucide-trash"
            class="hover:cursor-pointer"
            :loading="loading"
            >Löschen</UButton
          >
        </NewspaperDeleteModal>
      </div>
    </div>
    <div>
      <p>{{ newspaper.description }}</p>
    </div>
    <USeparator class="my-2"></USeparator>
    <div>
      <NewspaperShowArticles
        :paperId="newspaper.id.toString()"
      ></NewspaperShowArticles>
    </div>
  </div>

  <div v-else class="flex justify-center items-center min-h-64">
    <UCard>
      <div class="flex flex-col items-center gap-4 p-8">
        <UIcon
          name="i-heroicons-exclamation-triangle"
          class="w-12 h-12 text-red-500"
        />
        <h2 class="text-xl font-semibold">Zeitung nicht gefunden</h2>
        <p class="text-center">
          Die angeforderte Zeitung konnte nicht gefunden werden.
        </p>
        <UButton to="/newspapers" variant="outline">
          Zurück zur Übersicht
        </UButton>
      </div>
    </UCard>
  </div>
</template>