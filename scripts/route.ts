const APIKEY = Deno.env.get("APIKEY");
import { runHackernewszhTask } from "./hackernewszh/mod.js";
import { HTTPError } from "./error.ts";
export async function handleRequest(request: Request) {
  // first check if the request is authorized
  const { headers } = request;
  const urlObj = new URL(request.url);
  const authorization = headers.get("Authorization");
  const headerAuthorizationValue = `Bearer ${APIKEY}`;
  if (authorization) {
    if (authorization !== headerAuthorizationValue) {
      // if not authorized, return 401
      throw new HTTPError(
        "unauthorized",
        "Authrorization Bearer abc is required",
        401,
      );
    }
  } else if (urlObj.searchParams.has("key")) {
    const keyFromQuery = urlObj.searchParams.get("key");
    if (keyFromQuery !== APIKEY) {
      throw new HTTPError(
        "unauthorized",
        "search query key=abc is required",
        401,
      );
    }
  } else {
    throw new HTTPError(
      "unauthorized",
      "Authrorization Bearer abc or search query key=abc is required",
      401,
    );
  }

  // if authorized, route it
  const { pathname } = urlObj;
  if (pathname === "/runHackernewszhTask") {
    await runHackernewszhTask();
  }

  // throw 404 if not found
  throw new HTTPError("not found", "not found", 404);
}
