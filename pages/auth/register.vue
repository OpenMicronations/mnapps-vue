<script setup lang="ts">
import { z } from "zod";
import type { FormSubmitEvent } from "#ui/types";

const supabase = useSupabaseClient();
const router = useRouter();

// Schema for form validation with German error messages
const schema = z
  .object({
    email: z.string().email("Ungültige E-Mail-Adresse"),
    password: z
      .string()
      .min(8, "Passwort muss mindestens 8 Zeichen lang sein"),
    confirmPassword: z
      .string()
      .min(8, "Passwort muss mindestens 8 Zeichen lang sein"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Die Passwörter stimmen nicht überein",
    path: ["confirmPassword"], // Set error on the confirmation field
  });

type Schema = z.output<typeof schema>;

const state = reactive({
  email: undefined,
  password: undefined,
  confirmPassword: undefined,
});

// Sign-up function triggered on form submission
const signUp = async (event: FormSubmitEvent<Schema>) => {
  const { error } = await supabase.auth.signUp({
    email: event.data.email,
    password: event.data.password,
  });

  if (error) {
    console.error("Registrierungsfehler:", error.message);
    // Add a toast notification for the user here
  } else {
    console.log("Überprüfen Sie Ihre E-Mails für den Bestätigungslink");
    router.push("/auth/login?r=1"); // Redirect to login after successful sign-up
  }
};
</script>

<template>
  <UContainer class="flex h-screen items-center justify-center">
    <UCard class="w-full max-w-sm">
      <template #header>
        <h1 class="text-2xl font-bold">Registrieren</h1>
      </template>

      <UForm :schema="schema" :state="state" class="space-y-4" @submit="signUp">
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
            class="w-full mb-4"
            size="lg"
          />
        </UFormGroup>

        <UFormGroup label="Passwort bestätigen" name="confirmPassword">
          <UInput
            v-model="state.confirmPassword"
            type="password"
            icon="i-heroicons-lock-closed"
            placeholder="••••••••"
            class="w-full mb-4"
            size="lg"
          />
        </UFormGroup>

        <div class="flex flex-col gap-2 pt-2">
          <UButton type="submit" block size="lg"> Konto erstellen </UButton>
          <UButton to="/auth/login" variant="link" color="neutral" block size="lg">
            Zurück zur Anmeldung
          </UButton>
        </div>
      </UForm>
    </UCard>
  </UContainer>
</template>