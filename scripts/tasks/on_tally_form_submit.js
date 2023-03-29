import { sendNotice } from "./send_notice.ts";
export async function onTallyFormSubmit(body) {
  const { data } = body;
  const { formName, fields } = data;
  let text = `新回复 from: ${formName}:\n`;

  let value = fields.value;
  if (typeof fields.value === "string") {
    value = fields.value;
  } else if (typeof fields.value === "object" && fields.value.url) {
    value = fields.value.url;
  }
  for (const field of fields) {
    text += `${field.label}: ${value}\n`;
  }

  text += `\n主页地址:  https://tally.so/forms/${data.formId}/submissions`;

  // send notice
  await sendNotice({
    text,
  });

  return { ec: 200 };
}
