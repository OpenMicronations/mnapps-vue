<script setup lang="ts">
import type { FormSubmitEvent } from "#ui/types";

// 1. Define a prop to receive the list ID from the parent page.
const props = defineProps({
  listId: {
    type: String,
    required: true,
  },
});

// 2. Use the composable to get all necessary data and functions
const {
  newsListEditSchema,
  getNewsList,
  populateFormState,
  createFormState,
  selectableAuthors,
  pendingAuthors,
  selectableCategories,
  pendingCategories,
  editAuthorFilter,
  editCategoryFilter,
} = useNewsList();

const schema = newsListEditSchema;
type Schema = typeof newsListEditSchema._output;

// 3. Create the reactive state for the form and a loading ref
const state = createFormState();
const formRef = ref();
const loading = ref(false);

// 4. Fetch the data for the specific list being edited using the prop
const { data: newsList, pending: pendingList } = await useAsyncData(
  `news-list-${props.listId}`, // Use the prop in the key for reactivity
  () => getNewsList(props.listId), // Use the prop to fetch the correct list
);

// 5. Watch for the data to load, then populate the form state
watch(
  newsList,
  (listData) => {
    if (listData) {
      populateFormState(state, listData);
    }
  },
  { immediate: true },
);

// 6. Implement the real saving logic in the onSubmit function
async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true;
  try {
    // Use the prop to save to the correct list
    const [authorResult, categoryResult] = await Promise.all([
      editAuthorFilter(props.listId, event.data.filter_authors ?? []),
      editCategoryFilter(props.listId, event.data.filter_categories ?? []),
    ]);

    if (!authorResult || !categoryResult) {
      // The toast error is already handled in the composable
      console.error("One or more filters failed to save.");
    }
  } catch (error) {
    console.error("An error occurred during saving:", error);
  } finally {
    loading.value = false;
  }
}

function handleSave() {
  formRef.value?.submit();
}
</script>

<template>
  <!-- Show a loading state while the list data is being fetched -->
  <div v-if="pendingList">
    <USkeleton class="h-12 w-full mb-4" />
    <USkeleton class="h-12 w-full" />
  </div>

  <!-- Once loaded, display the form -->
  <div v-else>
    <UForm ref="formRef" :schema="schema" :state="state" class="space-y-4" @submit="onSubmit">
      <!-- Author Multi-Select -->
      <UFormField name="filter_authors" label="Nach Autoren filtern">
        <USelectMenu v-model="state.filter_authors" :items="selectableAuthors ?? []" :loading="pendingAuthors" multiple
          placeholder="Autoren auswählen" searchable class="!w-full" size="lg" />
      </UFormField>

      <!-- Category Multi-Select -->
      <UFormField name="filter_categories" label="Nach Kategorien filtern">
        <USelectMenu v-model="state.filter_categories" :items="selectableCategories ?? []" :loading="pendingCategories"
          multiple placeholder="Kategorien auswählen" searchable size="lg" class="!w-full" />
      </UFormField>

      <!-- The save button is now fully functional -->
      <div class="flex justify-end mt-6">
        <UButton @click="handleSave" :loading="loading" :disabled="loading" icon="i-heroicons-check-circle">
          Filter speichern
        </UButton>
      </div>
    </UForm>
  </div>
</template>