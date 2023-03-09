export interface ConstructorOptioins {
  api: string;
  key: string;
}
export default class JSONBin {
  private api: string;
  private key: string;
  constructor(options: ConstructorOptioins) {
    const { api, key } = options;
    if (!api) {
      throw new Error("api is required");
    }
    this.api = api;
    if (!key) {
      throw new Error("key is required");
    }
    this.key = key;
  }

  async get(path: string, defaultValue: unknown) {
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

  async set(path: string, value: unknown) {
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
    if (writeResponse.body) {
      await writeResponse.body.cancel();
    }
    return;
  }
}
