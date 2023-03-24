import { sendNotice } from "./send_notice.ts";
export async function onAfdian(body) {
  // send notice
  await sendNotice({
    text: `${body.data.order.plan_title} ${body.data.order.total_amount}元\n${body.data.order.remark}\n主页地址: https://afdian.net/u/${body.data.order.user_id}`,
  });

  // also send notice to github to trigger github action

  const githubToken = Deno.env.get("PERSONAL_GITHUB_TOKEN");
  if (!githubToken) {
    throw new Error("PERSONAL_GITHUB_TOKEN is not set");
  }

  await request(
    "https://api.github.com/repos/immersive-translate/immersive-translate/dispatches",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${githubToken}`,
        "Content-Type": "application/json",
        "User-Agent": "Deno/1.0",
      },
      body: JSON.stringify({
        event_type: "update_sponsor",
      }),
    }
  );

  return { ec: 200 };
}
