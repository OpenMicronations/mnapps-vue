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
  <UContainer class="py-8">
    <!-- Loading state -->
    <div v-if="pending" class="flex justify-center items-center min-h-64">
      <div class="flex flex-col items-center gap-4">
        <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin" />
        <p class="text-gray-600">Lade Liste...</p>
      </div>
    </div>

    <!-- Main content -->
    <div v-else-if="newsList">
      <!-- Breadcrumb -->
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
            class="text-sm font-bold mb-2 hover:underline"
            to="/mein/listen"
          >
            Listen
          </NuxtLink>
          &nbsp;<span>></span>&nbsp;
          <NuxtLink
            class="text-sm text-primary font-bold mb-2 hover:underline"
            :to="`/mein/listen/edit/${newsList.id}`"
          >
            {{ newsList.name }}
          </NuxtLink>
        </span>
        <div class="flex justify-between items-center mt-2">
          <h1 class="text-4xl font-bold">{{ newsList.name }} bearbeiten</h1>

          <!-- Delete Button -->
          <UButton
            icon="i-heroicons-trash"
            color="error"
            variant="soft"
            size="lg"
            @click="isDeleteModalOpen = true"
          >
            Löschen
          </UButton>
        </div>
        <USeparator class="my-6" />
      </div>

      <!-- Form Card -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <UIcon
                name="i-heroicons-list-bullet"
                class="w-5 h-5 text-primary"
              />
              <h2 class="text-lg font-semibold">Liste bearbeiten</h2>
            </div>
            <UButton
              @click="handleSave"
              :loading="loading"
              size="lg"
              icon="i-heroicons-check"
              :disabled="loading"
            >
              {{ loading ? "Speichere..." : "Änderungen speichern" }}
            </UButton>
          </div>
        </template>

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
              />
            </UFormField>
          </div>
        </UForm>
      </UCard>

      <!-- Delete Modal -->
      <UModal v-model="isDeleteModalOpen" @close="resetDeleteModal">
        <UCard>
          <template #header>
            <div class="flex items-center gap-3">
              <UIcon
                name="i-heroicons-exclamation-triangle"
                class="w-5 h-5 text-red-500"
              />
              <h3 class="text-lg font-semibold">Liste löschen</h3>
            </div>
          </template>

          <div class="space-y-4">
            <p class="text-sm text-gray-600">
              Gib
              <strong class="text-gray-800">{{ newsList.name }}</strong>
              ein, um die Löschung zu bestätigen.
            </p>
            <UInput
              v-model="deleteConfirmation"
              :placeholder="newsList.name ?? ''"
              size="lg"
            />
          </div>

          <template #footer>
            <div class="flex justify-end gap-3">
              <UButton
                variant="ghost"
                color="neutral"
                :disabled="deleteLoading"
                @click="isDeleteModalOpen = false"
              >
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
          </template>
        </UCard>
      </UModal>
    </div>

    <!-- Error state -->
    <div v-else class="flex justify-center items-center min-h-64">
      <UCard>
        <div class="flex flex-col items-center gap-4 p-8">
          <UIcon
            name="i-heroicons-exclamation-triangle"
            class="w-12 h-12 text-red-500"
          />
          <h2 class="text-xl font-semibold">Liste nicht gefunden</h2>
          <p class="text-gray-600 text-center">
            Die angeforderte Liste konnte nicht gefunden werden.
          </p>
          <UButton to="/mein/listen" variant="outline">
            Zurück zur Übersicht
          </UButton>
        </div>
      </UCard>
    </div>
  </UContainer>
</template>