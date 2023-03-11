import { request } from "../request.ts";
import { sendNotice } from "./send_notice.ts";
export async function checkBuzzingIsOk() {
  const feedJson = await request("https://hnnew.buzzing.cc/feed.json");
  const latestBuildTime = feedJson._latest_build_time;
  const date = new Date(latestBuildTime);
  const now = new Date();
  if (now.getTime() - date.getTime() > 1 * 60 * 60 * 1000) {
    // send notice
    await sendNotice({
      text: "https://www.buzzing.cc 超过1小时没有更新了",
    });
  }
}
