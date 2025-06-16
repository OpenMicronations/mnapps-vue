<template>
  <div class="flex justify-between items-center">
    <div>
      <h2 class="text-3xl font-bold">RSS-Listen</h2>
    </div>
    <div>
      <ifUser class="flex gap-4">
        <NewsListCreateModal>
          <UButton variant="soft" leading-icon="i-lucide-plus" class="hover:cursor-pointer">Neu</UButton>
        </NewsListCreateModal>
        <UButton
          :variant="showOnlyMine ? 'solid' : 'outline'"
          leading-icon="i-lucide-eye"
          @click="toggleOnlyMine"
        >
          Meine Listen
        </UButton>
      </ifUser>
    </div>
  </div>

  <div id="allrsslists" ref="allrsslistsRef">
    <AllRssGrid />
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'

const showOnlyMine = ref(false)
const allrsslistsRef = ref(null)

const toggleOnlyMine = () => {
  showOnlyMine.value = !showOnlyMine.value

  nextTick(() => {
    const container = allrsslistsRef.value
    if (!container) return

    const nmcDivs = container.querySelectorAll('div#nmc')
    nmcDivs.forEach(div => {
      div.style.display = showOnlyMine.value ? 'none' : ''
    })
  })
}
</script>
