import { request } from "../request.ts";
import { sendNotice } from "./send_notice.ts";
export async function checkTrackawesomelistIsOk() {
  const feedJson = await request("https://www.trackawesomelist.com/feed.json");
  const latestBuildTime = feedJson.date_published;
  const date = new Date(latestBuildTime);
  const now = new Date();
  if (now.getTime() - date.getTime() > 48 * 60 * 60 * 1000) {
    await sendNotice({
      text: "https://www.trackawesomelist.com 超过24小时没有更新了",
    });
  }

  return null;
}
