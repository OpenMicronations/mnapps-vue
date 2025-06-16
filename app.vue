<template>
  <UApp class="">
    <div class="h-screen w-screen bg-slate-900 flex">
      <!-- Sidebar -->
      <div class="w-[300px] flex-shrink-0">
        <AppNav />
      </div>

      <!-- Scrollable Content -->
      <div class="bg-gray-950 w-full p-8 rounded-tl-xl overflow-auto mt-4 border-l-2 border-t-2 border-white/10">
        <NuxtPage />
      </div>
    </div>
  </UApp>
</template>
