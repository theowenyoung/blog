import { request } from "../request.ts";
import JSONBin from "../jsonbin/mod.ts";
const jsonBin = new JSONBin({
  api: "https://json.owenyoung.com",
  key: Deno.env.get("JSONBIN_KEY") || "abc",
});
const jsonBinPath = "/hackernewszh-task-data";
export async function runHackernewszhTask() {
  // get last run
  const { keys, lastRunAt } = await jsonBin.get(jsonBinPath, {
    keys: [],
    lastRunAt: 0,
  });
  // check last run at
  const now = new Date();
  const lastRunAtDate = new Date(lastRunAt);

  const diff = now.getTime() - lastRunAtDate.getTime();

  // is < 30 min
  // if (diff < 30 * 60 * 1000) {
  //   throw new HTTPError(
  //     "tooManyRequest",
  //     "last run at is less than 30 min ago",
  //     429
  //   );
  // }

  const feedResult = await request("https://hnfront.buzzing.cc/feed.json");
  const nextTweet = await getNextTweet(feedResult, keys);
  if (nextTweet) {
    await jsonBin.set(jsonBinPath, {
      keys: nextTweet.keys,
      lastRunAt: now.toISOString(),
    });
    await sendTweet(nextTweet.text);
  }
}

async function getNextTweet(jsonFeed, keys) {
  const items = jsonFeed.items
    .slice(0, 200)
    .sort((a, b) => {
      const aScore = a._score;
      const bScore = b._score;
      return bScore - aScore;
    })
    .map((item) => {
      const text =
        item.title + "\n\n" + item.content_text.replace(/\n/g, "\n\n");
      return {
        id: item.id,
        text,
        sensitive: !!item._sensitive,
      };
    })
    .filter((item) => {
      // remove url
      // get final text
      const textWithoutUrl = item.text.replace(
        /(?:https?|ftp):\/\/[\n\S]+/g,
        ""
      );
      if (textWithoutUrl.length <= 240) {
        return true;
      } else {
        return false;
      }
    });

  let chosedItem;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!keys.includes(item.id)) {
      // only 1000
      keys.unshift(item.id);
      if (keys.length > 1000) {
        keys = keys.slice(0, 1000);
      }
      chosedItem = {
        keys: keys,
        text: item.text,
        sensitive: !!item._sensitive,
      };
      break;
    }
  }
  return chosedItem;
}

function sendTweet(text) {
  const IFTTT_KEY = Deno.env.get("IFTTT_KEY");
  if (!IFTTT_KEY) {
    throw new Error("IFTTT_KEY is not set");
  }
  return;
  return request(
    `https://maker.ifttt.com/trigger/newhntweet/with/key/${IFTTT_KEY}`,
    {
      responseType: "text",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        value1: text,
      }),
    }
  );
}
