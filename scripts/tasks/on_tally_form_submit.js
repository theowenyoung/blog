import { sendNotice } from "./send_notice.ts";
export async function onTallyFormSubmit(body) {
  const { data } = body;
  const { formName, fields } = data;
  let text = `新回复 from: ${formName}:\n`;

  for (const field of fields) {
    text += `${field.label}: ${field.value}\n`;
  }

  // send notice
  await sendNotice({
    text,
  });

  return { ec: 200 };
}
