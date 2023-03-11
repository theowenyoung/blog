import { request } from "../request.ts";
export interface NoticeOptions {
  text: string;
}
export async function sendNotice(options: NoticeOptions) {
  const chatId = Deno.env.get("TELEGRAM_NOTICE_CHAT_ID");
  const botToken = Deno.env.get("TELEGRAM_NOTICE_BOT_TOKEN");
  if (!chatId || !botToken) {
    throw new Error(
      "TELEGRAM_NOTICE_CHAT_ID or TELEGRAM_NOTICE_BOT_TOKEN is not set",
    );
  }
  const { text } = options;
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const raw = JSON.stringify({
    "chat_id": chatId,
    "text": text,
  });

  const requestOptions: RequestInit = {
    method: "POST",
    headers: myHeaders,
    body: raw,
    redirect: "follow",
  };

  await request(
    `https://api.telegram.org/bot${botToken}/sendMessage`,
    requestOptions,
  );
}
