<script setup lang="ts">
import type { FormSubmitEvent } from "#ui/types";

definePageMeta({
  middleware: "auth",
});

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
  <UContainer class="py-8">
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
        &nbsp;>&nbsp;
        <NuxtLink
          class="text-sm text-primary font-bold mb-2 hover:underline"
          to="/mein/laender/create"
        >
          Land erstellen
        </NuxtLink>
      </span>
      <div class="flex justify-between items-center mt-2">
        <h1 class="text-4xl font-bold">Land erstellen</h1>
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
            <h2 class="text-lg font-semibold">Neues Land erstellen</h2>
          </div>
          <UButton
            @click="handleSave"
            :loading="loading"
            size="lg"
            icon="i-heroicons-check"
            :disabled="loading"
          >
            {{ loading ? "Erstelle..." : "Land erstellen" }}
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
          <UFormField name="name" label="Name">
            <UInput
              v-model="state.name"
              placeholder="z.B. Deutschland"
              size="lg"
              icon="i-heroicons-globe-alt"
              class="w-full"
            />
          </UFormField>

          <UFormField name="full_name" label="Vollständiger Name">
            <UInput
              v-model="state.full_name"
              placeholder="z.B. Bundesrepublik Deutschland"
              size="lg"
              icon="i-heroicons-document-text"
              class="w-full"
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
  </UContainer>
</template>

<style scoped>
.uppercase {
  text-transform: uppercase;
}
</style>