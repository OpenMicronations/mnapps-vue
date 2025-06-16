<script setup lang="ts">
import { computed } from "vue";

const { getCountry, validateCountryId } = useCountry();
const { getNewspaperOfCountry } = useNewspaper();
const user = useSupabaseUser();
const userId = computed(() => user.value?.id || null);

const route = useRoute();
const routeId = computed(() => validateCountryId(route.params.id));

// --- REVISED DATA FETCHING ---

// 1. Use a stable key and the `watch` option for the country data.
const { data: country, pending } = useAsyncData(
    "country-details",
    () => getCountry(routeId.value),
    {
        watch: [routeId], // Re-run the fetcher when routeId changes
    }
);

// 2. Do the same for the newspapers data.
const { data: newspapers } = useAsyncData(
    "country-newspapers",
    () => {
        // Add a guard to prevent fetching if the ID is invalid
        if (!routeId.value) return Promise.resolve([]);
        return getNewspaperOfCountry(routeId.value);
    },
    {
        watch: [routeId], // Re-run when routeId changes
    }
);

const formRef = ref();
const loading = ref(false);

async function handleDelete() {
    if (!country.value) return;
    if (confirm(`Are you sure you want to delete ${country.value.name}?`)) {
        loading.value = true;
        try {
            // Replace with your actual Supabase delete logic
            console.log(`Deleting country with ID: ${country.value.id}`);
            // await client.from('countries').delete().eq('id', country.value.id)
            await navigateTo("/countries");
        } catch (error) {
            console.error("Failed to delete country:", error);
        } finally {
            loading.value = false;
        }
    }
}
</script>

<template>
    <div v-if="pending" class="flex justify-center items-center min-h-64">
        <div class="flex flex-col items-center gap-4">
            <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin" />
            <p class="text-gray-600">Lade Land...</p>
        </div>
    </div>

    <!-- Main content -->
    <div v-else-if="country">
        <NuxtLink to="/countries" class="">
            <p class="flex gap-2 items-center text-white/40 hover:text-white">
                <UIcon name="i-lucide-arrow-left" class="size-5"></UIcon> Zurück
            </p>
        </NuxtLink>
        <div class="flex justify-between items-center">
            <h2 class="text-3xl font-bold">{{ country.name }}</h2>
            <div v-if="userId == country.author" class="flex gap-2">
                <CountryEditModal>
                    <UButton variant="soft" leading-icon="i-lucide-pen" class="hover:cursor-pointer">Bearbeiten
                    </UButton>
                </CountryEditModal>
                <CountryDeleteModal>

                    <UButton variant="outline" color="error" leading-icon="i-lucide-trash" class="hover:cursor-pointer"
                        :loading="loading">Löschen</UButton>
                </CountryDeleteModal>
            </div>
        </div>
        <div class="mb-2">
            <p>
                Voller Name: <b>{{ country.full_name }}</b>
            </p>
        </div>
        <USeparator></USeparator>
        <div>
            <h3 class="text-2xl font-bold mt-4">
                Zeitungen aus {{ country.name }}
            </h3>
            <div v-if="newspapers && newspapers.length > 0"
                class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
                <CountryCard v-for="newspaper in newspapers" :key="newspaper.id" :title="newspaper.name || undefined"
                    :to="`/mein/zeitungen/edit/${newspaper.id}`" />
            </div>
        </div>
    </div>

    <div v-else class="flex justify-center items-center min-h-64">
        <UCard>
            <div class="flex flex-col items-center gap-4 p-8">
                <UIcon name="i-heroicons-exclamation-triangle" class="w-12 h-12 text-red-500" />
                <h2 class="text-xl font-semibold">Land nicht gefunden</h2>
                <p class="text-center">
                    Das angeforderte Land konnte nicht gefunden werden.
                </p>
                <UButton to="/countries" variant="outline">
                    Zurück zur Übersicht
                </UButton>
            </div>
        </UCard>
    </div>
</template>