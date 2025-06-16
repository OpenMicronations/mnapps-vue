<script setup lang="ts">
const {
  getNewspaper,
  deleteNewspaper,
  validateNewspaperId,
  navigateToNewspaperList
} = useNewspaper();

const route = useRoute();
const routeId = validateNewspaperId(route.params.id);

const { data: newspaper, pending } = await useAsyncData(
  `country-${routeId}`,
  () => getNewspaper(routeId)
);

const deleteConfirmation = ref("");
const deleteLoading = ref(false);

const canDelete = computed(() => {
  return deleteConfirmation.value === newspaper.value?.name;
});

async function handleDelete() {
  if (!canDelete.value || !newspaper.value) return;

  deleteLoading.value = true;
  try {
    const success = await deleteNewspaper(routeId);
    if (success) {
      navigateToNewspaperList();
    }
  } finally {
    deleteLoading.value = false;
  }
}
</script>

<template>
  <UModal title="Zeitung löschen" :ui="{
    title: 'text-xl font-bold',
  }">
    <slot></slot>
    <template #content>
      <div v-if="newspaper" class="p-6">
        <div class="flex items-center gap-3 mb-4">
          <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 text-red-500" />
          <h3 class="text-lg font-semibold">Zeitung löschen</h3>
        </div>

        <div class="space-y-4">
          <div class="bg-red-50 border border-red-200 rounded-lg p-4">
            <p class="text-sm text-red-800">
              <strong>Warnung:</strong> Diese Aktion kann nicht rückgängig
              gemacht werden. Die Zeitung und alle damit verbundenen Daten werden
              permanent gelöscht.
            </p>
          </div>

          <div>
            <p>Achtung: Es kann bis zu 10 Minuten dauern, bis das Löschen auch im RSS-Feed hinterlegt ist.</p>

            <UFormField label="Bestätigung"
              :description="`Gib '${newspaper.name}' ein, um die Löschung zu bestätigen:`">
              <UInput v-model="deleteConfirmation" :placeholder="newspaper.name ?? ''" size="lg" />
            </UFormField>
          </div>

          <div class="flex justify-end gap-3 pt-4">
            <UButton variant="ghost" color="neutral" :disabled="deleteLoading">
              Abbrechen
            </UButton>
            <UButton color="error" @click="handleDelete" :loading="deleteLoading" :disabled="!canDelete"
              icon="i-heroicons-trash">
              Endgültig löschen
            </UButton>
          </div>
        </div>
      </div>
    </template>
  </UModal>
</template>