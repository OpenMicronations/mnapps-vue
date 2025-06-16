// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/supabase', '@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  supabase: {
    redirect: false,
  },
  devServer: {
    host: '127.0.0.1',
    port: 3000 // Optional: specify your preferred port
  },
  runtimeConfig: {
    supabaseUrl: process.env.SUPABASE_URL || '',
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    public: {
      supabaseUrl: process.env.SUPABASE_URL || '',
      supabaseKey: process.env.SUPABASE_KEY || '',
    }
  },
  /*routeRules: {
    // Cache any request to the /api/rss/ path
    "/api/rss/**": {
      cache: {
        // Cache the response for 10 minutes (600 seconds)
        maxAge: 600,
      },
    },
  },*/
})
