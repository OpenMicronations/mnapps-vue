<script setup lang="ts">
import type { FormSubmitEvent } from "#ui/types";

definePageMeta({
  middleware: "auth",
});

const {
  newsListEditSchema,
  getNewsList,
  updateNewsList,
  deleteNewsList,
  createFormState,
  populateFormState,
  validateNewsListId,
  navigateToNewsList,
  selectableNewspapers,
  pendingNewspapers,
} = useNewsList();

const schema = newsListEditSchema;
type Schema = typeof newsListEditSchema._output;

const route = useRoute();
const routeId = validateNewsListId(route.params.id);

const { data: newsList, pending } = await useAsyncData(
  `news-list-${routeId}`,
  () => getNewsList(routeId)
);

const state = createFormState();
const formRef = ref();
const loading = ref(false);

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

// Reset modal state on close
function resetDeleteModal() {
  deleteConfirmation.value = "";
  deleteLoading.value = false;
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true;
  try {
    await updateNewsList(routeId, event.data);
  } finally {
    loading.value = false;
  }
}

function handleSave() {
  formRef.value?.submit();
}

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
  <UModal title="RSS-Liste bearbeiten" :ui="{
    title: 'text-xl font-bold',
  }">
    <slot></slot>
    <template #body>
      <!-- This container constrains the width of your form -->
      <div class="w-full max-w-3xl">
        <h3 class="text-xl font-bold">Allgemeines</h3>
        <UForm
          ref="formRef"
          :schema="schema"
          :state="state"
          class="space-y-6"
          @submit="onSubmit"
        >
          <div class="grid grid-cols-1 gap-6">
            <!-- List Name -->
            <UFormField name="name" label="Listenname">
              <UInput
                v-model="state.name"
                size="lg"
                icon="i-heroicons-tag"
                class="!w-full"
              />
            </UFormField>

            <!-- Newspaper Multi-Select -->
            <UFormField name="newspapers" label="Enthaltene Zeitungen">
              <USelectMenu
                v-model="selectedNewspapers"
                :items="formattedSelectableNewspapers"
                :loading="pendingNewspapers"
                multiple
                placeholder="Zeitungen auswählen"
                by="value"
                option-attribute="label"
                searchable
                size="lg"
                class="!w-full"
              />
            </UFormField>
          </div>
        </UForm>
        <div class="mt-8 flex justify-end">
          <UButton @click="handleSave" :loading="loading" size="lg" icon="i-heroicons-check" :disabled="loading">
            {{ loading ? "Wird bearbeitet..." : "Zeitung bearbeiten" }}
          </UButton>
        </div>
        <USeparator>
        </USeparator>
        
        <h3 class="text-xl font-bold mt-4">Filter</h3>
        <FilterSetup :list-id="newsList?.id || ''"></FilterSetup>
      </div>
    </template>
  </UModal>
</template>