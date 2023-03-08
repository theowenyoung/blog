export default class JSONBin {
  constructor({ api, key }) {
    this.api = api || "https://json.owenyoung.com";
    if (!key) {
      throw new Error("key is required");
    }
    this.key = key;
  }

  async get(path, defaultValue) {
    const url = `${this.api}${path || "/"}?key=${this.key}`;
    let sentArr = defaultValue;
    const response = await fetch(url);
    if (response.ok) {
      sentArr = await response.json();
    } else {
      if (response.status === 404) {
        sentArr = defaultValue;
      } else {
        throw new Error(`${response.status}: ${response.statusText}`);
      }
    }
    return sentArr;
  }

  async set(path, value) {
    if (!path) {
      throw new Error("path is required");
    }
    const url = `${this.api}${path || "/"}?key=${this.key}`;
    const writeResponse = await fetch(url, {
      method: "POST",
      body: JSON.stringify(value),
    });
    if (!writeResponse.ok) {
      throw new Error(`${writeResponse.status}: ${writeResponse.statusText}`);
    }
    return;
  }
}
