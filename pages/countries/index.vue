<template>
  <div class="flex justify-between items-center">
    <div>
      <h2 class="text-3xl font-bold">Länder</h2>
    </div>
    <div>
      <ifUser class="flex gap-4">
        <CreateCountryModal>
          <UButton variant="soft" leading-icon="i-lucide-plus" class="hover:cursor-pointer">Neu</UButton>
        </CreateCountryModal>
        <UButton
          :variant="showOnlyMine ? 'solid' : 'outline'"
          leading-icon="i-lucide-eye"
          @click="toggleOnlyMine"
        >
          Meine Länder
        </UButton>
      </ifUser>
    </div>
  </div>

  <div id="allcountries" ref="allCountriesRef">
    <AllCountriesGrid />
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'

const showOnlyMine = ref(false)
const allCountriesRef = ref(null)

const toggleOnlyMine = () => {
  showOnlyMine.value = !showOnlyMine.value

  nextTick(() => {
    const container = allCountriesRef.value
    if (!container) return

    const nmcDivs = container.querySelectorAll('div#nmc')
    nmcDivs.forEach(div => {
      div.style.display = showOnlyMine.value ? 'none' : ''
    })
  })
}
</script>
