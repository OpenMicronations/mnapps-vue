<template>
  <div class="flex justify-between items-center">
    <div>
      <h2 class="text-3xl font-bold">Zeitungen</h2>
    </div>
    <div>
      <ifUser class="flex gap-4">
        <NewspaperCreateModal>
          <UButton variant="soft" leading-icon="i-lucide-plus" class="hover:cursor-pointer">Neu</UButton>
        </NewspaperCreateModal>
        <UButton
          :variant="showOnlyMine ? 'solid' : 'outline'"
          leading-icon="i-lucide-eye"
          @click="toggleOnlyMine"
        >
          Meine Zeitungen
        </UButton>
      </ifUser>
    </div>
  </div>

  <div id="allnewspapers" ref="allNewspapersRef">
    <AllNewsGrid />
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'

const showOnlyMine = ref(false)
const allNewspapersRef = ref(null)

const toggleOnlyMine = () => {
  showOnlyMine.value = !showOnlyMine.value

  nextTick(() => {
    const container = allNewspapersRef.value
    if (!container) return

    const nmcDivs = container.querySelectorAll('div#nmc')
    nmcDivs.forEach(div => {
      div.style.display = showOnlyMine.value ? 'none' : ''
    })
  })
}
</script>
