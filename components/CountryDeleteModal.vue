<script setup lang="ts">
const {
  countryEditSchema,
  getCountry,
  deleteCountry,
  validateCountryId,
  navigateToCountryList,
} = useCountry();

const route = useRoute();
const routeId = validateCountryId(route.params.id);

const { data: country, pending } = await useAsyncData(
  `country-${routeId}`,
  () => getCountry(routeId)
);

// Delete modal state
const deleteConfirmation = ref("");
const deleteLoading = ref(false);

// Computed to check if delete confirmation matches
const canDelete = computed(() => {
  return deleteConfirmation.value === country.value?.name;
});

async function handleDelete() {
  if (!canDelete.value || !country.value) return;

  deleteLoading.value = true;
  try {
    const success = await deleteCountry(routeId);
    if (success) {
      navigateToCountryList();
    }
  } finally {
    deleteLoading.value = false;
  }
}
</script>

<template>
  <UModal
    title="Land löschen"
    :ui="{
      title: 'text-xl font-bold',
    }"
  >
    <slot></slot>
    <template #content>
      <div v-if="country" class="p-6">
        <div class="flex items-center gap-3 mb-4">
          <UIcon
            name="i-heroicons-exclamation-triangle"
            class="w-5 h-5 text-red-500"
          />
          <h3 class="text-lg font-semibold">Land löschen</h3>
        </div>

        <div class="space-y-4">
          <div class="bg-red-50 border border-red-200 rounded-lg p-4">
            <p class="text-sm text-red-800">
              <strong>Warnung:</strong> Diese Aktion kann nicht rückgängig
              gemacht werden. Das Land und alle damit verbundenen Daten werden
              permanent gelöscht.
            </p>
          </div>

          <div>
            <UFormField
              label="Bestätigung"
              :description="`Gib '${country.name}' ein, um die Löschung zu bestätigen:`"
            >
              <UInput
                v-model="deleteConfirmation"
                :placeholder="country.name ?? ''"
                size="lg"
              />
            </UFormField>
          </div>

          <div class="flex justify-end gap-3 pt-4">
            <UButton variant="ghost" color="neutral" :disabled="deleteLoading">
              Abbrechen
            </UButton>
            <UButton
              color="error"
              @click="handleDelete"
              :loading="deleteLoading"
              :disabled="!canDelete"
              icon="i-heroicons-trash"
            >
              Endgültig löschen
            </UButton>
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>