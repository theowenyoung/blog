import { sendNotice } from "./send_notice.ts";
export async function onTallyFormSubmit(body) {
  const { data } = body;
  const { formName, fields } = data;
  let text = `新回复 from: ${formName}:\n`;
  let photo = "";

  for (const field of fields) {
    let value = field.value;
    const type = field.type;
    if (type === "DROPDOWN") {
      const options = field.options;
      const option = options.find((option) => option.id === field.value);
      value = option.text;
    } else if (typeof field.value === "string") {
      value = field.value;
    } else if (
      field.value &&
      Array.isArray(field.value) &&
      field.value.length > 0 &&
      field.value[0].url
    ) {
      // yes photo
      value = field.value[0].url;
      photo = value;
    }
    if (value) {
      text += `${field.label}: ${value}\n`;
    }
  }

  text += `\n主页地址:  https://tally.so/forms/${data.formId}/submissions`;
  const noticeBody = {
    text,
    image: photo,
  };

  // send notice
  const response = await sendNotice(noticeBody);

  return response;
}
