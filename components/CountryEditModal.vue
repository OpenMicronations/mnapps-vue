<script setup lang="ts">
import type { FormSubmitEvent } from "#ui/types";

const {
  countryEditSchema,
  getCountry,
  updateCountry,
  createEditFormState,
  populateFormState,
  validateCountryId,
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
</script>

<template>
  <UModal
    title="Land bearbeiten"
    :ui="{
      title: 'text-xl font-bold',
    }"
  >
    <slot></slot>
    <template #body>
      <!-- This container constrains the width of your form -->
      <div class="w-full max-w-3xl">
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

          <!-- Actions -->
          <div class="mt-8 flex justify-end">
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
        </UForm>
      </div>
    </template>
  </UModal>
</template>