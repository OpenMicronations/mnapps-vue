<script setup lang="ts">
import type { FormSubmitEvent } from "#ui/types";

definePageMeta({
  middleware: "auth",
});

// 1. Use the new news list composable
const {
  newsListCreateSchema,
  createNewsList,
  createFormState,
  navigateToNewsListEdit,
  selectableNewspapers, // Data for the multi-select
  pendingNewspapers, // Loading state for the multi-select
} = useNewsList();

const schema = newsListCreateSchema;
type Schema = typeof newsListCreateSchema._output;

const state = createFormState();
const formRef = ref();
const loading = ref(false);

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

async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true;
  try {
    const result = await createNewsList(event.data);
    if (result.success && result.listId) {
      navigateToNewsListEdit(result.listId);
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
          to="/mein/listen"
        >
          Listen
        </NuxtLink>
        &nbsp;>&nbsp;
        <NuxtLink
          class="text-sm text-primary font-bold mb-2 hover:underline"
          to="/mein/listen/create"
        >
          Liste erstellen
        </NuxtLink>
      </span>
      <div class="flex justify-between items-center mt-2">
        <h1 class="text-4xl font-bold">Liste erstellen</h1>
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
            <h2 class="text-lg font-semibold">Neue Liste erstellen</h2>
          </div>
          <UButton
            @click="handleSave"
            :loading="loading"
            size="lg"
            icon="i-heroicons-check"
            :disabled="loading"
          >
            {{ loading ? "Erstelle..." : "Liste erstellen" }}
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
              placeholder="z.B. Meine Tech-News"
              size="lg"
              icon="i-heroicons-tag"
              class="w-full"
            />
          </UFormField>

          <!-- Newspaper Multi-Select -->
          <UFormField name="newspapers" label="Zeitungen auswählen">
            <USelectMenu
              v-model="selectedNewspapers"
              :items="formattedSelectableNewspapers"
              :loading="pendingNewspapers"
              multiple
              placeholder="Zeitungen zur Liste hinzufügen"
              by="value"
              option-attribute="label"
              searchable
              size="lg"
            />
          </UFormField>
        </div>
      </UForm>
    </UCard>
  </UContainer>
</template>