import { sendNotice } from "./tasks/send_notice.ts";
import { onAfdian } from "./tasks/on_afdian.js";
import { onGithubSponsor } from "./tasks/on_github_sponsor.js";
import { runHackernewszhTask } from "./tasks/hackernewszh/mod.js";
import { checkTrackawesomelistIsOk } from "./tasks/check_trackawesomelist_is_ok.ts";
import { checkBuzzingIsOk } from "./tasks/check_buzzing_is_ok.ts";
import { onWebmention } from "./tasks/on_webmention.ts";
import { HTTPError } from "./error.ts";
export async function handleRequest(request: Request) {
  const APIKEY = Deno.env.get("APIKEY");

  // first check if the request is authorized
  const { headers, method } = request;
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
  if (pathname === "/notice") {
    let text = "";
    if (method === "GET") {
      text = urlObj.searchParams.get("text") || "";
    } else if (method === "POST") {
      // check content type
      const contentType = headers.get("Content-Type");
      if (!contentType || contentType === "application/json") {
        const body = await request.json();
        text = body.text;
      } else {
        const formData = await request.formData();
        if (formData) {
          text = formData.get("text") as string || "";
        }
      }
    }

    if (text) {
      return sendNotice({
        text,
      });
    } else {
      throw new HTTPError("bad request", "text is required", 400);
    }
  } else if (pathname === "/runHackernewszhTask") {
    await runHackernewszhTask();
    return;
  } else if (pathname === "/checkTrackawesomelistIsOk") {
    return checkTrackawesomelistIsOk();
  } else if (pathname === "/checkBuzzingIsOk") {
    return checkBuzzingIsOk();
  } else if (pathname === "/onWebmention") {
    return onWebmention();
  } else if (pathname === "/onAfdian") {
    if (method === "POST") {
      // get body
      const body = await request.json();
      return onAfdian(body);
    }
  } else if (pathname === "/onGithubSporsor") {
    if (method === "POST") {
      const body = await request.json();
      return onGithubSponsor(body);
    }
  }
  // throw 404 if not found
  throw new HTTPError("not found", "not found", 404);
}
