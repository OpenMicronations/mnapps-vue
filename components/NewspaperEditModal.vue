<script setup lang="ts">
import type { FormSubmitEvent } from "#ui/types";

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
</script>

<template>
  <UModal title="Zeitung bearbeiten" :ui="{
    title: 'text-xl font-bold',
  }">
    <slot></slot>
    <template #body>
      <!-- This container constrains the width of your form -->
      <div class="w-full max-w-3xl">
        <p>Achtung: Es kann bis zu 10 Minuten dauern, bis dein Bearbeitungsvorgang auch im RSS-Feed hinterlegt ist.</p>
        <UForm ref="formRef" :schema="schema" :state="state" class="space-y-6" @submit="onSubmit">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Name -->
            <UFormField name="name" label="Name der Zeitung">
              <UInput v-model="state.name" size="lg" icon="i-heroicons-newspaper" class="w-full" />
            </UFormField>

            <!-- Country Select Menu -->
            <UFormField name="country" label="Land">
              <USelectMenu v-model="state.country" :items="countriesForSelect" :loading="pendingCountries"
                value-key="id" label-key="name" placeholder="Land auswählen" class="w-full" size="lg" />
            </UFormField>

            <!-- URL -->
            <UFormField name="url" label="Website URL">
              <UInput v-model="state.url" size="lg" icon="i-heroicons-link" class="w-full" />
            </UFormField>

            <!-- RSS Feed -->
            <UFormField name="rss" label="RSS Feed URL">
              <UInput v-model="state.rss" size="lg" icon="i-heroicons-rss" class="w-full" />
            </UFormField>

            <!-- Description -->
            <UFormField name="description" label="Beschreibung" class="md:col-span-2 w-full">
              <UTextarea v-model="state.description" :rows="4" class="w-full" />
            </UFormField>
          </div>
        </UForm>
        <div class="mt-8 flex justify-end">
          <UButton @click="handleSave" :loading="loading" size="lg" icon="i-heroicons-check" :disabled="loading">
            {{ loading ? "Wird erstellt..." : "Zeitung bearbeiten" }}
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>