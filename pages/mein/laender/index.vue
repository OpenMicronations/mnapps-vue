<script setup lang="ts">
definePageMeta({
  middleware: "auth",
});

const { getMyCountries } = useCountry();

const { data: countries, pending } = await useAsyncData(
  "my-countries",
  getMyCountries
);
</script>

<template>
  <UContainer class="pt-4">
    <div class="flex gap-12">
      <div class="w-full">
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
            to="/mein/laender"
          >
            Länder
          </NuxtLink>
        </span>
        <div class="flex justify-between items-center">
          <h1 class="text-4xl font-bold">Länder</h1>
          <ULink to="/mein/laender/create" target="_self">
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
        <p class="text-gray-600">Lade Länder...</p>
      </div>
    </div>

    <!-- Countries grid -->
    <div v-else-if="countries && countries.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
      <CountryCard
        v-for="country in countries"
        :key="country.id"
        :title="country.name || undefined"
        :to="`/mein/laender/edit/${country.id}`"
      />
    </div>

    <!-- Empty state -->
    <div v-else class="flex justify-center items-center min-h-64">
      <UCard>
        <div class="flex flex-col items-center gap-4 p-8">
          <UIcon
            name="i-heroicons-globe-alt"
            class="w-12 h-12 text-gray-400"
          />
          <h2 class="text-xl font-semibold text-gray-900">
            Noch keine Länder
          </h2>
          <p class="text-gray-600 text-center">
            Erstelle dein erstes Land, um loszulegen.
          </p>
          <UButton to="/mein/laender/create" icon="i-heroicons-plus">
            Land erstellen
          </UButton>
        </div>
      </UCard>
    </div>
  </UContainer>
</template>