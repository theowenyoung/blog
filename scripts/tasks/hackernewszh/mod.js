import { request } from "../../request.ts";
import { HTTPError } from "../../error.ts";
import { sendNotice } from "../send_notice.ts";
import JSONBin from "../../jsonbin/mod.ts";
const jsonBinPath = "/hackernewszh-task-data";

let jsonBin = null;
export function setup() {
  const jsonBinKey = Deno.env.get("JSONBIN_KEY");
  jsonBin = new JSONBin({
    api: "https://json.owenyoung.com",
    key: jsonBinKey,
  });
}

export async function runHackernewszhTask() {
  if (!jsonBin) {
    setup();
  }
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
  if (diff < 30 * 60 * 1000) {
    throw new HTTPError(
      "tooManyRequest",
      "last run at is less than 30 min ago",
      429
    );
  }

  const feedResult = await request("https://hnfront.buzzing.cc/feed.json");
  try {
    const nextTweet = await getNextTweet(feedResult, keys);
    if (nextTweet) {
      await jsonBin.set(jsonBinPath, {
        keys: nextTweet.keys,
        lastRunAt: now.toISOString(),
      });
      await sendTweet(nextTweet.text);
    }
  } catch (e) {
    await sendNotice({
      text: "hnbot error" + e.message.slice(0, 200),
    });
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
        predictedText:
          item.title +
          "(" +
          item.title +
          ")" +
          "\n\n" +
          item.content_text.replace(/\n/g, "\n\n"),
        item: item,

        sensitive: !!item._sensitive,
      };
    })
    .filter((item) => {
      // remove url
      // get final text
      const textWithoutUrl = item.predictedText.replace(
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

      // use open ai to translate title.

      const originalItem = item.item;
      const originalEnTitle = originalItem._translations.en.title;
      const openAiTitleResult = await translateWithOpenAi(originalEnTitle);
      const content = originalItem.content_text.replace(/\n/g, "\n\n");

      const finalZhText = originalItem.title;

      let gpt = "";
      if (
        !openAiTitleResult.text.includes(
          "This translation may not make complete sense"
        )
      ) {
        if (openAiTitleResult.text !== originalItem.title) {
          gpt = `\n\nGPT🤔: ${openAiTitleResult.text}`;
        }
      }

      const text = `${finalZhText}${gpt}\n\n${content}`;

      chosedItem = {
        keys: keys,
        text: text,
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
const prefixies = [
  "Show HN: ",
  "Ask HN: ",
  "Tell HN: ",
  "Poll: ",
  "Launch HN: ",
];

async function translateWithOpenAi(text) {
  const prefix = prefixies.find((prefix) => text.startsWith(prefix));
  const textWithoutPrefix = prefix ? text.slice(prefix.length) : text;
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + Deno.env.get("OPENAI_KEY"),
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      temperature: 0,
      max_tokens: 2048,
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant that translates to zh-Hans`,
        },

        {
          role: "user",
          content:
            "Translate the following text to zh-Hans: ```\n" +
            textWithoutPrefix +
            "\n```",
        },

        {
          role: "user",
          content: "Context: this is a hacker news title",
        },
      ],
    }),
  };

  const response = await request(
    "https://api.openai.com/v1/chat/completions",
    options
  );
  if (
    response &&
    response.choices &&
    response.choices.length > 0 &&
    response.choices[0].message &&
    response.choices[0].message.content
  ) {
    const text = response.choices[0].message.content.trim();
    return {
      text: prefix ? prefix + text : text,
    };
  } else {
    throw new Error("server response invalid: " + JSON.stringify(response));
  }
}
