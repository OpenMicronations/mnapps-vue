<script setup lang="ts">
import type { FormSubmitEvent } from "#ui/types";

definePageMeta({
  middleware: "auth",
});

const {
  countryEditSchema,
  getCountry,
  updateCountry,
  deleteCountry,
  createEditFormState,
  populateFormState,
  validateCountryId,
  navigateToCountryList,
} = useCountry();

const schema = countryEditSchema;
type Schema = typeof countryEditSchema._output;

const route = useRoute();
const routeId = validateCountryId(route.params.id);

const { data: country, pending } = await useAsyncData(
  `country-${routeId}`,
  () => getCountry(routeId)
);

const state = createEditFormState();
const formRef = ref();
const loading = ref(false);

// Delete modal state
const deleteConfirmation = ref("");
const deleteLoading = ref(false);

// Computed to check if delete confirmation matches
const canDelete = computed(() => {
  return deleteConfirmation.value === country.value?.name;
});

watch(
  country,
  (newCountry) => {
    if (newCountry) {
      populateFormState(state, newCountry, false);
    }
  },
  { immediate: true }
);

async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true;
  try {
    await updateCountry(routeId, event.data);
  } finally {
    loading.value = false;
  }
}

function handleSave() {
  formRef.value?.submit();
}

function resetDeleteModal() {
  deleteConfirmation.value = "";
}

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
    <!-- Loading state -->
    <div v-if="pending" class="flex justify-center items-center min-h-64">
      <div class="flex flex-col items-center gap-4">
        <UIcon name="i-heroicons-arrow-path" class="w-8 h-8 animate-spin" />
        <p class="text-gray-600">Lade Land...</p>
      </div>
    </div>

    <!-- Main content -->
    <div v-else-if="country">
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
            to="/mein/laender"
          >
            Länder
          </NuxtLink>
          &nbsp;<span>></span>&nbsp;
          <NuxtLink
            class="text-sm text-primary font-bold mb-2 hover:underline"
            :to="`/mein/laender/${country.id}`"
          >
            {{ country.name }}
          </NuxtLink>
        </span>
        <div class="flex justify-between items-center mt-2">
          <h1 class="text-4xl font-bold">{{ country.name }} bearbeiten</h1>
          
          <!-- Delete Modal -->
          <UModal @close="resetDeleteModal">
            <UIcon
              name="i-lucide-trash-2"
              class="size-6 hover:cursor-pointer hover:text-red-600"
            />

            <template #content>
              <div class="p-6">
                <div class="flex items-center gap-3 mb-4">
                  <UIcon
                    name="i-heroicons-exclamation-triangle"
                    class="w-5 h-5 text-red-500"
                  />
                  <h3 class="text-lg font-semibold">
                    Land löschen
                  </h3>
                </div>

                <div class="space-y-4">
                  <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p class="text-sm text-red-800">
                      <strong>Warnung:</strong> Diese Aktion kann nicht rückgängig gemacht werden. Das Land und alle damit verbundenen Daten werden permanent gelöscht.
                    </p>
                  </div>

                  <div>
                    <UFormField
                      label="Bestätigung"
                      :description="`Gib '${country?.name}' ein, um die Löschung zu bestätigen:`"
                    >
                      <UInput
                        v-model="deleteConfirmation"
                        :placeholder="country.name"
                        size="lg"
                      />
                    </UFormField>
                  </div>

                  <div class="flex justify-end gap-3 pt-4">
                    <UButton
                      variant="ghost"
                      color="neutral"
                      :disabled="deleteLoading"
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
                </div>
              </div>
            </template>
          </UModal>
        </div>
        <USeparator class="my-6" />
      </div>

      <!-- Form Card -->
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <UIcon
                name="i-heroicons-globe-alt"
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
            <UFormField
              name="full_name"
              label="Vollständiger Name"
              class="md:col-span-2"
            >
              <UInput
                v-model="state.full_name"
                placeholder="z.B. Bundesrepublik Deutschland"
                size="lg"
                icon="i-heroicons-document-text"
                class="w-full max-w-xl"
              />
            </UFormField>

            <UFormField
              name="short"
              label="Abkürzung"
              description="2-3 Buchstaben"
            >
              <UInput
                v-model="state.short"
                placeholder="z.B. DE"
                size="lg"
                class="uppercase"
                maxlength="3"
                icon="i-heroicons-tag"
              />
            </UFormField>
          </div>
        </UForm>
      </UCard>
    </div>

    <!-- Error state -->
    <div v-else class="flex justify-center items-center min-h-64">
      <UCard>
        <div class="flex flex-col items-center gap-4 p-8">
          <UIcon
            name="i-heroicons-exclamation-triangle"
            class="w-12 h-12 text-red-500"
          />
          <h2 class="text-xl font-semibold text-gray-900">
            Land nicht gefunden
          </h2>
          <p class="text-gray-600 text-center">
            Das angeforderte Land konnte nicht gefunden werden.
          </p>
          <UButton to="/mein/laender" variant="outline">
            Zurück zur Übersicht
          </UButton>
        </div>
      </UCard>
    </div>
</template>

<style scoped>
.uppercase {
  text-transform: uppercase;
}
</style>