<script setup lang="ts">
import type { FormSubmitEvent } from "#ui/types";

definePageMeta({
  middleware: "auth",
});

// 1. useNewspaper anstelle von useCountry verwenden
const {
  newspaperCreateSchema,
  createNewspaper,
  createFormState,
  navigateToNewspaperEdit,
  countriesForSelect, // Daten für das SelectMenu
  pendingCountries, // Ladezustand für das SelectMenu
} = useNewspaper();

const schema = newspaperCreateSchema;
type Schema = typeof newspaperCreateSchema._output;

const state = createFormState();
const formRef = ref();
const loading = ref(false);

async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true;
  try {
    // 2. Die korrekten Funktionen aufrufen
    const result = await createNewspaper(event.data);
    if (result.success && result.newspaperId) {
      navigateToNewspaperEdit(result.newspaperId);
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
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Name -->
          <UFormField name="name" label="Name der Zeitung">
            <UInput
              v-model="state.name"
              placeholder="z.B. The Daily Planet"
              size="lg"
              icon="i-heroicons-newspaper"
            />
          </UFormField>

          <!-- Country Select Menu -->
          <UFormField name="country" label="Land">
            <USelectMenu
              v-model="state.country"
              :items="countriesForSelect"
              :loading="pendingCountries"
              placeholder="Land auswählen"
              value-key="id"
              label-key="name"
              searchable
              size="lg"
            />
          </UFormField>

          <!-- URL -->
          <UFormField name="url" label="Website URL">
            <UInput
              v-model="state.url"
              placeholder="https://example.com"
              size="lg"
              icon="i-heroicons-link"
            />
          </UFormField>

          <!-- RSS Feed -->
          <UFormField name="rss" label="RSS Feed URL">
            <UInput
              v-model="state.rss"
              placeholder="https://example.com/rss"
              size="lg"
              icon="i-heroicons-rss"
            />
          </UFormField>

          <!-- Description (spans both columns) -->
          <UFormField
            name="description"
            label="Beschreibung"
            class="md:col-span-2"
          >
            <UTextarea
              v-model="state.description"
              placeholder="Kurze Beschreibung der Zeitung..."
              :rows="4"
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
            {{ loading ? "Wird erstellt..." : "Zeitung erstellen" }}
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>