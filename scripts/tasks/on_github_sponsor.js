import { sendNotice } from "./send_notice.ts";
export async function onGithubSponsor(body) {
  let text = "Github Sponsor: ";
  try {
    if (body) {
      if (body.sponsorship) {
        if (body.sponsorship.privacy_level) {
          text += body.sponsorship.privacy_level + ", ";
        }
        if (body.sponsorship.tier) {
          if (body.sponsorship.tier) {
            text +=
              body.sponsorship.tier.name +
              ", " +
              (body.sponsorship.tier.is_one_time ? "一次性" : "月度");
          }
        }
        if (body.sponsorship.sponsor) {
          if (body.sponsorship.sponsor.login) {
            text +=
              ", " +
              body.sponsorship.sponsor.login +
              ", " +
              body.sponsorship.sponsor.html_url;
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
