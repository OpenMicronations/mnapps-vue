<script setup lang="ts">
import { z } from "zod";
import type { FormSubmitEvent } from "#ui/types";

const supabase = useSupabaseClient();
const router = useRouter();
const route = useRoute(); // Access route information

// Show a confirmation message if the URL has a '?r' query parameter
const showConfirmationMessage = computed(() => route.query.r !== undefined);

// Schema for form validation with German error messages
const schema = z.object({
  email: z.string().email("Ungültige E-Mail-Adresse"),
  password: z
    .string()
    .min(8, "Passwort muss mindestens 8 Zeichen lang sein"),
});

type Schema = z.output<typeof schema>;

const state = reactive({
  email: undefined,
  password: undefined,
});

// Sign-in function triggered on form submission
const signIn = async (event: FormSubmitEvent<Schema>) => {
  const { error } = await supabase.auth.signInWithPassword({
    email: event.data.email,
    password: event.data.password,
  });

  if (error) {
    console.error("Anmeldefehler:", error.message);
    // Here you could add a toast notification for the user
  } else {
    router.push("/"); // Redirect to homepage on success
  }
};
</script>

<template>
  <UContainer class="flex h-full items-center justify-center">
    <UCard class="w-full max-w-sm">
      <template #header>
        <h1 class="text-2xl font-bold">Anmeldung</h1>
      </template>

      <!-- This alert will only show if the URL is /auth/login?r -->
      <UAlert
        v-if="showConfirmationMessage"
        icon="i-heroicons-check-circle"
        color="primary"
        variant="subtle"
        title="Prüfe deine E-Mails"
        description="Wir haben dir einen Bestätigungslink gesendet."
        class="mb-4"
      />

      <UForm :schema="schema" :state="state" class="space-y-4" @submit="signIn">
        <UFormGroup label="E-Mail" name="email">
          <UInput
            v-model="state.email"
            icon="i-heroicons-envelope"
            placeholder="ihre@email.de"
            size="lg"
            class="w-full mb-4"
          />
        </UFormGroup>

        <UFormGroup label="Passwort" name="password">
          <UInput
            v-model="state.password"
            type="password"
            icon="i-heroicons-lock-closed"
            placeholder="••••••••"
            size="lg"
            class="w-full mb-4"
          />
        </UFormGroup>

        <div class="flex flex-col gap-2 pt-2">
          <UButton type="submit" block size="lg"> Anmelden </UButton>
          <UButton
            to="/auth/register"
            variant="link"
            color="neutral"
            block
            size="lg"
            class="w-full mb-4"
          >
            Jetzt registrieren
          </UButton>
        </div>
      </UForm>
    </UCard>
  </UContainer>
</template>