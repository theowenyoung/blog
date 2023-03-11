import { sendNotice } from "./send_notice.ts";
export async function onAfdian(body) {
  // send notice
  await sendNotice({
    text: `${body.data.order.plan_title} ${body.data.order.total_amount}元\n${body.data.order.remark}`,
  });
}
