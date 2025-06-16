<script setup lang="ts">
    const user = useSupabaseUser();
</script>

<template>
    <div v-if="user?.id">
        <slot></slot>
    </div>
</template>