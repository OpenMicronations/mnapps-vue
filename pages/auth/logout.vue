<script setup lang="ts">
const supabase = useSupabaseClient()

// Auto logout on page load
onMounted(async () => {
  const { error } = await supabase.auth.signOut()
  
  if (error) {
    console.log(error)
  }
  
  // Redirect to home regardless of error
  await navigateTo('/')
})
</script>

<template>
  <div>
    <p>Logging out...</p>
  </div>
</template>