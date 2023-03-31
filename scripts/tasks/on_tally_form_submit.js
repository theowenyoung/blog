import { sendNotice } from "./send_notice.ts";
export async function onTallyFormSubmit(body) {
  const { data } = body;
  const { formName, fields } = data;
  let text = `新回复 from: ${formName}:\n`;

  for (const field of fields) {
    let value = field.value;
    if (typeof field.value === "string") {
      value = field.value;
    } else if (
      field.value &&
      typeof field.value === "object" &&
      field.value.url
    ) {
      value = field.value.url;
    }
    text += `${field.label}: ${value}\n`;
  }

  text += `\n主页地址:  https://tally.so/forms/${data.formId}/submissions`;

  // send notice
  await sendNotice({
    text,
  });

  return { ec: 200 };
}
