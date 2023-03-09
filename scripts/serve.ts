import { serve } from "https://deno.land/std@0.178.0/http/server.ts";
import { errorToResponse } from "./error.ts";
import { handleRequest } from "./route.ts";
serve(async (request) => {
  try {
    const responseBody = await handleRequest(request);
    return new Response(JSON.stringify(responseBody, null, 2), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (e) {
    return errorToResponse(e);
  }
});
