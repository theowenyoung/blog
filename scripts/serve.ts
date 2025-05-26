import { serve } from "https://deno.land/std@0.178.0/http/server.ts";
import { errorToResponse } from "./error.ts";
import { handleRequest } from "./route.ts";
import {checkSp500Signal} from "./check_sp500.ts";
Deno.cron("Log a message", { hour: { every: 1 } }, async () => {
  console.log("This will print once an hour.");
  await checkSp500Signal();
});
serve((request) => {
  return handleRequest(request).then((responseBody) => {
    // @ts-ignore: it's ok
    if (!responseBody) {
      // @ts-ignore: it's ok
      responseBody = { ok: true };
    }
    return new Response(JSON.stringify(responseBody, null, 2), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  }).catch((e) => {
    console.warn("Error in request:", e);
    return errorToResponse(e);
  });
});
