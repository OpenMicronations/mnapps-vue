<script setup lang="ts">
const { getCountries } = useCountry();
const user = useSupabaseUser();
const userId = user.value?.id || null;

const { data: countries, pending } = await useAsyncData(
  "all-countries",
  getCountries
);
</script>

<template>
  <div v-if="countries && countries.length > 0"
       class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
    <div v-for="country in countries"
         :key="country.id"
         :id="String(country.author) !== userId ? 'nmc' : undefined">
      <CountryCard
        :title="country.name || undefined"
        :to="`/countries/${country.id}`" />
    </div>
  </div>
</template>
