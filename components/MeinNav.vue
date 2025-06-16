<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const items = ref<NavigationMenuItem[][]>([
  [
    {
      label: 'Guide',
      icon: 'i-lucide-book-open',
      to: '/mein'
    },
    {
      label: 'Guide',
      icon: 'i-lucide-book-open'
    },
    {
      label: 'Guide',
      icon: 'i-lucide-book-open'
    },
  ]
])
</script>

<template>
  <UNavigationMenu orientation="vertical" :items="items" class="data-[orientation=vertical]:w-48" />
</template>
