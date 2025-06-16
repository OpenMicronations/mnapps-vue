<template>
  <NuxtLink :to="to" class="block">
    <UCard class="hover:ring-primary/20 hover:ring-4 hover:cursor-pointer transition-all">
      <template #header>
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-bold">{{ title }}</h3>
          <UIcon name="i-lucide-square-arrow-out-up-right" />
        </div>
      </template>
      <p>{{ description }}</p>
    </UCard>
  </NuxtLink>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  to: {
    type: String,
    required: true
  }
});
</script>
