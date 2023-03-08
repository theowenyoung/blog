// Modify this
const APIKEY = "abc";

export default {
  async fetch(request, env) {
    try {
      const responseBody = await handleRequest(request, env);
      return new Response(responseBody, {
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (e) {
      return errorToResponse(e);
    }
  },
};

async function handleRequest(request, env) {
  if (!env.JSONBIN) {
    throw new HTTPError(
      "kvNotFound",
      "Not Found KV Database Bind",
      500,
      "Internal Server Error"
    );
  }

  // first check if the request is authorized
  const { headers } = request;
  const urlObj = new URL(request.url);
  const authorization = headers.get("Authorization");
  const headerAuthorizationValue = `Bearer ${APIKEY}`;
  if (authorization) {
    if (authorization !== headerAuthorizationValue) {
      // if not authorized, return 401
      throw new HTTPError(
        "unauthorized",
        "Authrorization Bearer abc is required",
        401,
        "Unauthorized"
      );
    }
  } else if (urlObj.searchParams.has("key")) {
    const keyFromQuery = urlObj.searchParams.get("key");
    if (keyFromQuery !== APIKEY) {
      throw new HTTPError(
        "unauthorized",
        "search query key=abc is required",
        401,
        "Unauthorized"
      );
    }
  } else {
    throw new HTTPError(
      "unauthorized",
      "Authrorization Bearer abc or search query key=abc is required",
      401,
      "Unauthorized"
    );
  }

  // yes authorized, continue
  if (request.method === "POST") {
    const { pathname } = new URL(request.url);
    let json = "";
    try {
      json = JSON.stringify(await request.json());
    } catch (e) {
      throw new HTTPError(
        "jsonParseError",
        "request body JSON is not valid, " + e.message,
        400,
        "Bad Request"
      );
    }
    await env.JSONBIN.put(pathname, json);
    return '{"ok":true}';
  } else if (request.method === "GET") {
    const { pathname } = new URL(request.url);
    const value = await env.JSONBIN.get(pathname);
    if (value === null) {
      throw new HTTPError(
        "notFound",
        "Not Found",
        404,
        "The requested resource was not found"
      );
    }
    return value;
  } else {
    throw new HTTPError(
      "methodNotAllowed",
      "Method Not Allowed",
      405,
      "The requested method is not allowed"
    );
  }
}

function errorToResponse(error) {
  const bodyJson = {
    ok: false,
    error: "Internal Server Error",
    message: "Internal Server Error",
  };
  let status = 500;
  let statusText = "Internal Server Error";

  if (error instanceof Error) {
    bodyJson.message = error.message;
    bodyJson.error = error.name;

    if (error.status) {
      status = error.status;
    }
    if (error.statusText) {
      statusText = error.statusText;
    }
  }
  return new Response(JSON.stringify(bodyJson, null, 2), {
    status: status,
    statusText: statusText,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

class HTTPError extends Error {
  constructor(name, message, status, statusText) {
    super(message);
    this.name = name;
    this.status = status;
    this.statusText = statusText;
  }
}
