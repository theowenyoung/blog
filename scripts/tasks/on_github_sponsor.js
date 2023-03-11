import { sendNotice } from "./send_notice.ts";
export async function onGithubSponsor(body) {
  let text = "Github Sponsor: ";
  try {
    if (body) {
      if (body.sposor) {
        if (body.sposor.privacy_level) {
          text += body.sposor.privacy_level + ", ";
        }
        if (body.sposor.tier) {
          if (body.sporsor.tier) {
            text +=
              body.sporsor.tier.name +
              ", " +
              (body.sporsor.tier.is_one_time ? "一次性" : "月度");
          }
        }
      }
    }
  } catch (_e) {
    text = JSON.stringify(body);
  }

  // send notice
  await sendNotice({
    text: text,
  });

  return { ec: 200 };
}
