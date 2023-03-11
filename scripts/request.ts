export interface RequestOptions extends RequestInit {
  responseType?: "json" | "text" | "raw";
}
export async function request(url: string, options?: RequestOptions) {
  options = options || {};
  // @ts-ignore: it's ok
  let { responseType, ...fetchOptions } = options;
  if (!responseType) {
    responseType = "json";
  }
  fetchOptions = {
    redirect: "follow",
    ...fetchOptions,
  };

  const response = await fetchWithTimeout(url, fetchOptions);
  if (response.ok && response.status >= 200 && response.status < 400) {
    if (responseType === "json") {
      if (response.status === 204) {
        return null;
      }

      const data = await response.json();
      return data;
    } else if (responseType === "text") {
      if (response.status === 204) {
        return "";
      }

      const data = await response.text();
      // log.debug("response", data);
      return data;
    } else if (responseType === "raw") {
      const data = await response.text();

      // log.debug("response text", data);
      const responseHeaders: Record<string, string> = Object
        .fromEntries([
          // @ts-ignore: it's ok
          ...response.headers.entries(),
        ]);
      const finalUrl = response.url;
      const result = {
        body: data,
        headers: responseHeaders,
        status: response.status,
        statusText: response.statusText,
        url: finalUrl,
      };

      return result;
    }
  } else {
    // try get body text
    let details: string | undefined;
    try {
      details = await response.text();
    } catch (_e) {
      // ignore
      console.warn("parse response failed", _e);
    }
    throw new Error(
      response.status + ": " + response.statusText || "" + " " + details || "",
    );
  }
}

async function fetchWithTimeout(resource: string | URL, options: RequestInit) {
  let timeout = 15000;
  // @ts-ignore: it's ok
  if (options && options.timeout) {
    // @ts-ignore: it's ok
    timeout = options.timeout;
  }

  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  const fetchParams = {
    ...options,
    signal: controller.signal,
  };

  // @ts-ignore: it's ok
  if (options.proxy) {
    // @ts-ignore: it's ok
    const client = Deno.createHttpClient({
      // @ts-ignore: it's ok
      proxy: { url: options.proxy },
    });
    // @ts-ignore: it's ok
    fetchParams.client = client;
  }

  // @ts-ignore: it's ok
  const response = await fetch(resource, fetchParams);
  clearTimeout(id);
  return response;
}
