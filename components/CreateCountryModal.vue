<script setup lang="ts">
import type { FormSubmitEvent } from "#ui/types";

const {
  countryCreateSchema,
  createCountry,
  createCountryFormState,
  navigateToCountryEdit,
} = useCountry();

const schema = countryCreateSchema;
type Schema = typeof countryCreateSchema._output;

const state = createCountryFormState();
const formRef = ref();
const loading = ref(false);

async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true;
  try {
    const result = await createCountry(event.data);
    if (result.success && result.countryId) {
      navigateToCountryEdit(result.countryId);
    }
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
    title="Neues Land erstellen"
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
          <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
            <UFormField name="name" label="Name">
              <UInput
                v-model="state.name"
                placeholder="z.B. Deutschland"
                size="lg"
                icon="i-heroicons-globe-alt"
              />
            </UFormField>

            <UFormField name="full_name" label="Vollständiger Name">
              <UInput
                v-model="state.full_name"
                placeholder="z.B. Bundesrepublik Deutschland"
                size="lg"
                icon="i-heroicons-document-text"
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

        <!-- Wrapper for button alignment and spacing -->
        <div class="mt-8 flex justify-end">
          <UButton
            @click="handleSave"
            :loading="loading"
            size="lg"
            icon="i-heroicons-check"
            :disabled="loading"
          >
            {{ loading ? "Wird erstellt..." : "Land erstellen" }}
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>