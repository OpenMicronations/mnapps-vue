<!-- pages/newsLists/[id].vue -->
<script setup lang="ts">
import { computed } from "vue";
import { useRequestURL } from "#app";

const url = useRequestURL();
const baseUrl = `${url.protocol}//${url.host}/`;

const { getNewsList, validateNewsListId, selectableAuthors, selectableCategories } = useNewsList();
const user = useSupabaseUser();
const userId = computed(() => user.value?.id || null);

const route = useRoute();
const routeId = computed(() => validateNewsListId(route.params.id));

// Fetch the specific news list
const { data: newsList, pending } = useAsyncData(
    "newslist-details",
    () => getNewsList(routeId.value),
    {
        watch: [routeId],
    },
);

const loading = ref(false);

// Use a computed property to ensure the URL is created after newsList is loaded
const value = computed(() => {
    if (newsList.value?.id) {
        return `${baseUrl}api/rss/list/${newsList.value.id}`;
    }
    return ""; // Return an empty string while loading
});

const copied = ref(false);

function copy() {
    // Prevent copying an empty string
    if (!value.value) return;

    navigator.clipboard.writeText(value.value);
    copied.value = true;

    setTimeout(() => {
        copied.value = false;
    }, 2000);
}
</script>

<template>
    <!-- Loading State -->
    <div v-if="pending" class="flex justify-center items-center min-h-64">
        <div class="flex flex-col items-center gap-4">
            <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin" />
            <p class="text-gray-600">Lade Liste...</p>
        </div>
    </div>

    <!-- Main Content -->
    <div v-else-if="newsList">
        <NuxtLink to="/rss-feeds" class="">
            <p class="flex gap-2 items-center text-white/40 hover:text-white">
                <UIcon name="i-lucide-arrow-left" class="size-5"></UIcon> Zurück
            </p>
        </NuxtLink>
        <div class="flex justify-between items-center">
            <h2 class="text-3xl font-bold">{{ newsList.name }}</h2>
            <!-- Actions are only available to the author of the list -->
            <div class="flex gap-2">
                <UButton leading-icon="i-lucide-rss" :to="'/api/rss/list/' + newsList.id" external>RSS-Feed</UButton>
                <div v-if="userId == newsList.author" class="flex gap-2">
                    <NewsListEditModal>
                    <UButton variant="soft" leading-icon="i-lucide-pen" class="hover:cursor-pointer">Bearbeiten
                    </UButton>
                    </NewsListEditModal>
                    <NewsListDeleteModal>
                        <UButton variant="outline" color="error" leading-icon="i-lucide-trash"
                            class="hover:cursor-pointer" :loading="loading">
                            Löschen
                        </UButton>
                    </NewsListDeleteModal>
                </div>

            </div>

        </div>
        
        <p class="mt-4">RSS-Feed URL</p>
        <UInput v-model="value" :ui="{ trailing: 'pr-0.5' }" class="mb-2 max-w-[400px] w-full">
            
            <template v-if="value?.length" #trailing>
                <UTooltip text="Copy to clipboard" :content="{ side: 'right' }">
                    <UButton :color="copied ? 'success' : 'neutral'" variant="link" size="sm"
                        :icon="copied ? 'i-lucide-copy-check' : 'i-lucide-copy'" aria-label="Copy to clipboard"
                        @click="copy" />
                </UTooltip>
            </template>
        </UInput>
        <USeparator class="my-2"></USeparator>

        <!-- Component to display the newspapers contained in this list -->
        <div>
            <LazyNewsListShowNewspapers :list-id="newsList.id.toString()"></LazyNewsListShowNewspapers>
        </div>
    </div>

    <!-- Not Found State -->
    <div v-else class="flex justify-center items-center min-h-64">
        <UCard>
            <div class="flex flex-col items-center gap-4 p-8">
                <UIcon name="i-heroicons-exclamation-triangle" class="w-12 h-12 text-red-500" />
                <h2 class="text-xl font-semibold">Liste nicht gefunden</h2>
                <p class="text-center">
                    Die angeforderte Liste konnte nicht gefunden werden.
                </p>
                <UButton to="/newsLists" variant="outline">
                    Zurück zur Übersicht
                </UButton>
            </div>
        </UCard>
    </div>
</template>
