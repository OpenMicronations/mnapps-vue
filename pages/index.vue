<script setup lang="ts">
// This composable gives you reactive access to the current user
const user = useSupabaseUser();
</script>

<template>
  <div>
    <h1>Home Page</h1>
    <!-- Conditionally render content based on login state -->
    <div v-if="user">   
      <p>Welcome back, {{ user.email }}!</p>
      <p>Your User ID is: {{ user.id }}</p>
    </div>
    <div v-else>
      <p>You are not logged in.</p>
      <!-- You could add a login link here -->
    </div>
  </div>
</template>