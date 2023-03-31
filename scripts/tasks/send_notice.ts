import { request } from "../request.ts";
export interface NoticeOptions {
  text: string;
  image?: string;
}
export async function sendNotice(options: NoticeOptions) {
  const chatId = Deno.env.get("TELEGRAM_NOTICE_CHAT_ID");
  const botToken = Deno.env.get("TELEGRAM_NOTICE_BOT_TOKEN");
  if (!chatId || !botToken) {
    throw new Error(
      "TELEGRAM_NOTICE_CHAT_ID or TELEGRAM_NOTICE_BOT_TOKEN is not set",
    );
  }
  const { text, image } = options;
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  let url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  let raw: string | FormData = JSON.stringify({
    "chat_id": chatId,
    "text": text,
    "disable_web_page_preview": true,
  });

  if (image) {
    url = `https://api.telegram.org/bot${botToken}/sendPhoto`;
    raw = JSON.stringify({
      "chat_id": chatId,
      "photo": image,
      "caption": text,
    });

    const bodyFormData = new FormData();
    bodyFormData.append("chat_id", chatId);
    bodyFormData.append(
      "caption",
      text,
    );
    // download photo url
    const b = await fetch(image, {
      method: "GET",
      headers: {},
      redirect: "follow",
    });

    const photoBlob = await b.blob();
    bodyFormData.append("photo", photoBlob);
    raw = bodyFormData;
  }

  const requestOptions: RequestInit = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };
  console.log("url", url);
  console.log("requestOptions", JSON.stringify(requestOptions, null, 2));

  await request(
    url,
    requestOptions,
  );
}
