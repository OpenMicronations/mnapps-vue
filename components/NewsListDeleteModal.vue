<script setup lang="ts">

const {
  getNewsList,
  deleteNewsList,
  createFormState,
  populateFormState,
  validateNewsListId,
  navigateToNewsList,
  selectableNewspapers,
} = useNewsList();

const route = useRoute();
const routeId = validateNewsListId(route.params.id);

const { data: newsList, pending } = await useAsyncData(
  `news-list-${routeId}`,
  () => getNewsList(routeId)
);

const state = createFormState();
// Delete modal state
const isDeleteModalOpen = ref(false);
const deleteConfirmation = ref("");
const deleteLoading = ref(false);

const canDelete = computed(() => {
  return deleteConfirmation.value === newsList.value?.name;
});

// Sanitize selectableNewspapers for the USelectMenu component
const formattedSelectableNewspapers = computed(() => {
  return (selectableNewspapers.value ?? []).map((item) => ({
    ...item,
    label: item.label ?? "", // Ensure label is never null
  }));
});

// Proxy computed for USelectMenu v-model to handle object/ID mismatch
const selectedNewspapers = computed({
  get() {
    const allItems = formattedSelectableNewspapers.value;
    if (!state.newspapers || !allItems) {
      return [];
    }
    const selectedIds = new Set(state.newspapers);
    return allItems.filter((item) => selectedIds.has(item.value));
  },
  set(newValue: { label: string; value: number }[]) {
    state.newspapers = newValue.map((item) => item.value);
  },
});

// Populate form when data is loaded
watch(
  newsList,
  (newList) => {
    if (newList) {
      populateFormState(state, newList);
    }
  },
  { immediate: true }
);

async function handleDelete() {
  if (!canDelete.value || !newsList.value) return;

  deleteLoading.value = true;
  try {
    const success = await deleteNewsList(routeId);
    if (success) {
      isDeleteModalOpen.value = false;
      navigateToNewsList();
    }
  } finally {
    deleteLoading.value = false;
  }
}
</script>
<template>
  <UModal
    title="RSS-Feed löschen"
    :ui="{
      title: 'text-xl font-bold',
    }"
  >
    <slot></slot>
    <template #content>
      <div v-if="newsList" class="p-6">
        <div class="flex items-center gap-3 mb-4">
          <UIcon
            name="i-heroicons-exclamation-triangle"
            class="w-5 h-5 text-red-500"
          />
          <h3 class="text-lg font-semibold">RSS-Feed löschen</h3>
        </div>

        <div class="space-y-4">
          <div class="bg-red-50 border border-red-200 rounded-lg p-4">
            <p class="text-sm text-red-800">
              <strong>Warnung:</strong> Diese Aktion kann nicht rückgängig
              gemacht werden. Der RSS-Feed und alle damit verbundenen Daten werden
              permanent gelöscht.
            </p>
          </div>

          <div>
            <UFormField
              label="Bestätigung"
              :description="`Gib '${newsList.name}' ein, um die Löschung zu bestätigen:`"
            >
              <UInput
                v-model="deleteConfirmation"
                :placeholder="newsList.name"
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