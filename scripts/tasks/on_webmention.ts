import { request } from "../request.ts";
export async function onWebmention() {
  const githubToken = Deno.env.get("PERSONAL_GITHUB_TOKEN");
  if (!githubToken) {
    throw new Error("PERSONAL_GITHUB_TOKEN is not set");
  }

  await request("https://api.github.com/repos/theowenyoung/blog/dispatches", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${githubToken}`,
      "Content-Type": "application/json",
      "User-Agent": "Deno/1.0",
    },
    body: JSON.stringify(
      {
        "event_type": "webmention",
      },
    ),
  });
}
