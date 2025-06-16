import { createClient } from "@supabase/supabase-js";

export default defineEventHandler(async (event) => {
  const newspaperIdParam = getRouterParam(event, "id");
  const newspaperId = parseInt(newspaperIdParam || "", 10);

  if (isNaN(newspaperId)) {
    throw createError({
      statusCode: 400,
      statusMessage: "A valid numerical newspaper ID is required.",
    });
  }

  const config = useRuntimeConfig(event);
  const supabaseAdmin = createClient(
    config.supabaseUrl!,
    config.supabaseServiceKey!,
    { auth: { persistSession: false } },
  );

  const functionName = `process_one_newspaper/${newspaperId}`;

  // --- MODIFICATION HERE ---
  // We will now explicitly set the Authorization and API Key headers.
  const { data, error } = await supabaseAdmin.functions.invoke(functionName, {
    headers: {
      // The client library uses the 'apikey' for the anon key.
      // We are providing the service key as the Bearer token for authorization.
      Authorization: `Bearer ${config.supabaseServiceKey}`,
    },
  });
  // --- END MODIFICATION ---

  if (error) {
    console.error(
      `Error invoking Supabase function '${functionName}':`,
      // The error object might have more context now
      error.context || error,
    );
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to refresh newspaper feed.",
      data: { originalError: error.message },
    });
  }
  setResponseStatus(event, 200);
  return data;
});