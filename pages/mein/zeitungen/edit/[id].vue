<script setup lang="ts">
import type { FormSubmitEvent } from "#ui/types";

definePageMeta({
  middleware: "auth",
});

const {
  newspaperEditSchema,
  getNewspaper,
  updateNewspaper,
  deleteNewspaper,
  createFormState,
  populateFormState,
  validateNewspaperId,
  navigateToNewspaperList,
  countriesForSelect,
  pendingCountries,
} = useNewspaper();

const schema = newspaperEditSchema;
type Schema = typeof newspaperEditSchema._output;

const route = useRoute();
const routeId = validateNewspaperId(route.params.id);

const { data: newspaper, pending } = await useAsyncData(
  `newspaper-${routeId}`,
  () => getNewspaper(routeId)
);

const state = createFormState();
const formRef = ref();
const loading = ref(false);

// State für das Modal
const isDeleteModalOpen = ref(false);
const deleteConfirmation = ref("");
const deleteLoading = ref(false);

const canDelete = computed(() => {
  return deleteConfirmation.value === newspaper.value?.name;
});

// Sanitize countriesForSelect for the USelectMenu component
const formattedCountriesForSelect = computed(() => {
  return (countriesForSelect.value ?? []).map((item) => ({
    ...item,
    name: item.name ?? "", // Ensure name is never null
  }));
});

// Proxy computed for USelectMenu v-model to handle object/ID mismatch
const selectedCountry = computed({
  get() {
    return formattedCountriesForSelect.value.find(
      (c) => c.id === state.country
    );
  },
  set(newValue: { name: string; id: number } | undefined) {
    state.country = newValue?.id;
  },
});

watch(
  newspaper,
  (newNewspaper) => {
    if (newNewspaper) {
      populateFormState(state, newNewspaper);
    }
  },
  { immediate: true }
);

// Setzt den Modal-Zustand zurück, wenn es geschlossen wird
function resetDeleteModal() {
  deleteConfirmation.value = "";
  deleteLoading.value = false;
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true;
  try {
    await updateNewspaper(routeId, event.data);
  } finally {
    loading.value = false;
  }
}

function handleSave() {
  formRef.value?.submit();
}

async function handleDelete() {
  if (!canDelete.value || !newspaper.value) return;

  deleteLoading.value = true;
  try {
    const success = await deleteNewspaper(routeId);
    if (success) {
      isDeleteModalOpen.value = false;
      navigateToNewspaperList();
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
        <p class="text-gray-600">Lade Zeitung...</p>
      </div>
    </div>

    <!-- Main content -->
    <div v-else-if="newspaper">
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
            to="/mein/zeitungen"
          >
            Zeitungen
          </NuxtLink>
          &nbsp;<span>></span>&nbsp;
          <NuxtLink
            class="text-sm text-primary font-bold mb-2 hover:underline"
            :to="`/mein/zeitungen/edit/${newspaper.id}`"
          >
            {{ newspaper.name }}
          </NuxtLink>
        </span>
        <div class="flex justify-between items-center mt-2">
          <h1 class="text-4xl font-bold">
            {{ newspaper.name }} bearbeiten
          </h1>

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
                name="i-heroicons-newspaper"
                class="w-5 h-5 text-primary"
              />
              <h2 class="text-lg font-semibold">Informationen bearbeiten</h2>
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
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Name -->
            <UFormField name="name" label="Name der Zeitung">
              <UInput
                v-model="state.name"
                size="lg"
                icon="i-heroicons-newspaper"
                class="w-full"
              />
            </UFormField>

            <!-- Country Select Menu -->
            <UFormField name="country" label="Land">
              <USelectMenu
                v-model="selectedCountry"
                :items="formattedCountriesForSelect"
                :loading="pendingCountries"
                placeholder="Land auswählen"
                by="id"
                option-attribute="name"
                searchable
                size="lg"
                class="w-full"
              />
            </UFormField>

            <!-- URL -->
            <UFormField name="url" label="Website URL">
              <UInput
                v-model="state.url"
                size="lg"
                icon="i-heroicons-link"
                class="w-full"
              />
            </UFormField>

            <!-- RSS Feed -->
            <UFormField name="rss" label="RSS Feed URL">
              <UInput
                v-model="state.rss"
                size="lg"
                icon="i-heroicons-rss"
                class="w-full"
              />
            </UFormField>

            <!-- Description -->
            <UFormField
              name="description"
              label="Beschreibung"
              class="md:col-span-2 w-full"
            >
              <UTextarea
                v-model="state.description"
                :rows="4"
                class="w-full"
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
              <h3 class="text-lg font-semibold">Zeitung löschen</h3>
            </div>
          </template>

          <div class="space-y-4">
            <p class="text-sm text-gray-600">
              Diese Aktion kann nicht rückgängig gemacht werden.
              <br />
              Gib
              <strong class="text-gray-800">{{ newspaper.name }}</strong>
              ein, um die Löschung zu bestätigen.
            </p>

            <UInput
              v-model="deleteConfirmation"
              :placeholder="newspaper.name ?? ''"
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
          <h2 class="text-xl font-semibold">Zeitung nicht gefunden</h2>
          <p class="text-gray-600 text-center">
            Die angeforderte Zeitung konnte nicht gefunden werden.
          </p>
          <UButton to="/mein/zeitungen" variant="outline">
            Zurück zur Übersicht
          </UButton>
        </div>
      </UCard>
    </div>
  </UContainer>
</template>