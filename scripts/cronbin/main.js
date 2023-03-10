// Modify this
const APIKEY = "abc";

export default {
  async fetch(request, env) {
    try {
      const responseArray = await handleRequest(request, env);
      const contentType = responseArray[1] || "application/json";
      if (contentType === "redirect") {
        const response = new Response(`Redirect to ${responseArray[0]}`, {
          status: 302,
          headers: {
            Location: responseArray[0],
          },
        });
        return response;
      } else if (typeof contentType === "string") {
        const response = new Response(responseArray[0], {
          headers: {
            "Content-Type": contentType,
          },
        });
        return response;
      } else {
        // headers
        const responseHeaders = new Headers();
        for (const [key, value] of Object.entries(contentType)) {
          for (const v of value) {
            responseHeaders.append(key, v);
          }
        }
        const response = new Response(responseArray[0], {
          headers: responseHeaders,
        });
        return response;
      }
    } catch (e) {
      console.warn("handle request error", e);
      return errorToResponse(e);
    }
  },

  async scheduled(event, env, ctx) {
    ctx.waitUntil(checkAndRunTasks(env));
  },
};

async function handleRequest(request, env) {
  if (!env.CRONBIN) {
    throw new HTTPError(
      "kvNotFound",
      "Not Found KV Database Bind",
      500,
      "Interval Server Error"
    );
  }

  // first check if the request is authorized
  const { headers } = request;
  const urlObj = new URL(request.url);
  const { pathname } = urlObj;

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
    // check cookie
    const cookie = headers.get("cookie");
    const apiKey = getCookieValue(cookie, "key");
    if (apiKey !== APIKEY) {
      throw new HTTPError(
        "unauthorized",
        "Authrorization Bearer abc or search query key=abc is required",
        401,
        "Unauthorized"
      );
    }
  }

  if (pathname === "/") {
    const data = await getData(env);
    const cookie = headers.get("cookie");
    let clientOffset = getCookieValue(cookie, "_clientOffset");
    if (!clientOffset) {
      clientOffset = 0;
    }
    clientOffset = Number(clientOffset);

    const body = getIndexHtml(data, clientOffset);
    const responseHeaders = {
      "Content-Type": ["text/html"],
    };

    // send cookie if changed
    const apiKey = getCookieValue(cookie, "key");
    const domain = request.headers.get("host")?.split(":")[0];
    if (apiKey !== APIKEY) {
      responseHeaders["set-cookie"] = [
        `key=${APIKEY}; HttpOnly; Max-Age=9999999999999999999999999999; Domain=${domain}; Path=/;`,
      ];
    }
    return [body, responseHeaders];
  } else if (pathname.startsWith("/tasks")) {
    const data = await getData(env);
    if (pathname === "/tasks") {
      // add task
      const formData = await request.formData();
      const interval = formData.get("interval");
      const url = formData.get("url");
      if (!interval) {
        throw new HTTPError(
          "intervalRequired",
          "interval is required",
          400,
          "Bad Request"
        );
      }
      if (!url) {
        throw new HTTPError(
          "urlRequired",
          "url is required",
          400,
          "Bad Request"
        );
      }
      const { tasks } = data;
      const taskKeys = Object.keys(tasks);
      const sortedTaskKeys = taskKeys.sort((a, b) => {
        return tasks[a] - tasks[b];
      });
      // find the largest task key
      const largestTaskKey = sortedTaskKeys[sortedTaskKeys.length - 1];
      const nextTaskKey = largestTaskKey ? Number(largestTaskKey) + 1 : 1;
      data.tasks[nextTaskKey] = {
        interval,
        url,
      };
      await setData(env, data);
      return ["/", "redirect"];
    }

    const taskRunPattern = new URLPattern({
      pathname: "/tasks/:id/run",
      baseURL: urlObj.origin,
    });

    // check if url match run pattern
    const match = taskRunPattern.exec(request.url);
    if (
      match &&
      match.pathname &&
      match.pathname.groups &&
      match.pathname.groups.id
    ) {
      const { id } = match.pathname.groups;
      const task = data.tasks[id];
      if (!task) {
        throw new HTTPError(
          "taskNotFound",
          "Task not found",
          404,
          "The requested resource was not found"
        );
      }
      // run task
      await runTasks([id], data, env);
      // redirect to /
      return ["/", "redirect"];
    } else {
      const taskEditPattern = new URLPattern({
        pathname: "/tasks/:id/edit",
        baseURL: urlObj.origin,
      });
      const editMatch = taskEditPattern.exec(request.url);
      if (
        editMatch &&
        editMatch.pathname &&
        editMatch.pathname.groups &&
        editMatch.pathname.groups.id
      ) {
        const { id } = editMatch.pathname.groups;
        const task = data.tasks[id];
        if (!task) {
          throw new HTTPError(
            "taskNotFound",
            "Task not found",
            404,
            "The requested resource was not found"
          );
        }

        const formData = await request.formData();
        const interval = formData.get("interval");
        const url = formData.get("url");
        if (!interval) {
          throw new HTTPError(
            "intervalRequired",
            "interval is required",
            400,
            "Bad Request"
          );
        }
        if (!url) {
          throw new HTTPError(
            "urlRequired",
            "url is required",
            400,
            "Bad Request"
          );
        }
        // find the largest task key
        data.tasks[id] = {
          interval,
          url,
        };
        await setData(env, data);
        return ["/", "redirect"];
      }

      const taskDeletePattern = new URLPattern({
        pathname: "/tasks/:id/delete",
        baseURL: urlObj.origin,
      });
      const taskDeletePatternMatch = taskDeletePattern.exec(request.url);
      if (
        taskDeletePatternMatch &&
        taskDeletePatternMatch.pathname &&
        taskDeletePatternMatch.pathname.groups &&
        taskDeletePatternMatch.pathname.groups.id
      ) {
        const { id } = taskDeletePatternMatch.pathname.groups;
        const task = data.tasks[id];
        if (!task) {
          throw new HTTPError(
            "taskNotFound",
            "Task not found",
            404,
            "The requested resource was not found"
          );
        }
        // delete task
        delete data.tasks[id];
        await setData(env, data);
        return ["/", "redirect"];
      }

      throw new HTTPError(
        "taskRouteNotFound",
        "Task route not found",
        404,
        "The requested resource was not found"
      );
    }
  } else if (pathname === "/api/data") {
    // yes authorized, continue
    if (request.method === "POST") {
      // add task
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
      await setData(env, json);
      return ['{"ok":true}'];
    } else {
      const data = await getData(env);
      return [JSON.stringify(data, null, 2)];
    }
  }
  throw new HTTPError(
    "notFound",
    "Not Found",
    404,
    "The requested resource was not found"
  );
}

export async function checkAndRunTasks(env) {
  const now = new Date();
  const data = await getData(env);
  const taksIds = getCurrentTaskIds(now.toISOString(), data);
  if (!taksIds || taksIds.length === 0) {
    return;
  }
  await runTasks(taksIds, data, env);
}

export async function runTasks(taksIds, data, env) {
  const urls = [];
  for (const taskId of taksIds) {
    const task = data.tasks[taskId];
    if (!task) {
      continue;
    }
    const { url } = task;
    urls.push(url);
  }
  // promise settled
  const results = await Promise.allSettled(
    urls.map((url) =>
      fetch(url).then(async (res) => {
        const body = await res.text();
        if (res.ok) {
          return body;
        } else {
          throw new Error(`${res.status}: ${res.statusText}, body: ${body}`);
        }
      })
    )
  );
  const now = new Date();
  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    const taskId = taksIds[i];
    if (!data.tasks[taskId].logs) {
      data.tasks[taskId].logs = [];
    }
    // check logs is too long, if so, remove the last one
    if (data.tasks[taskId].logs.length >= 10) {
      data.tasks[taskId].logs.pop();
    }
    if (result.status === "fulfilled") {
      data.tasks[taskId].logs.unshift({
        run_at: now.toISOString(),
        ok: true,
      });
    } else {
      const { reason } = result;
      let failedMessage = reason.message || "unknownError";
      failedMessage = failedMessage.slice(0, 150);

      data.tasks[taskId].logs.unshift({
        run_at: now.toISOString(),
        ok: false,
        message: failedMessage,
      });
    }
  }
  // if data is changed, update it
  await setData(env, data);
}

export function getCurrentTaskIds(now, data) {
  if (!data || !data.tasks) {
    return;
  }
  const nowDate = new Date(now);
  const { tasks } = data;
  const taskKeys = Object.keys(tasks);
  const finalTasks = [];
  for (const key of taskKeys) {
    const task = tasks[key];
    if (!task) {
      continue;
    }
    const { interval, logs } = task;
    let lastRunAt = new Date(0);
    if (logs && logs.length > 0) {
      lastRunAt = new Date(logs[0].run_at);
    }

    const diff = nowDate.getTime() - lastRunAt.getTime();
    if (diff >= interval) {
      finalTasks.push(key);
    }
  }
  return finalTasks;
}

async function getData(env) {
  const value = await env.CRONBIN.get("data");
  if (value === null) {
    return {
      tasks: {},
    };
  }
  return JSON.parse(value);
}

async function setData(env, data) {
  await env.CRONBIN.put("data", JSON.stringify(data, null, 2));
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

function getIndexHtml(data, _clientOffset) {
  let html = `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <link rel="shortcut icon" href="data:image/x-icon;," type="image/x-icon">
      <title>Cronbin</title>
      <style>
        .w-md {
          width: 5rem;
        }
        .w-lg {
          width: 20rem;
        }
        .mr {
          margin-right: 1rem;
        }
        .mb {
          margin-bottom: 0.5rem;
        }
        div.table 
        {
          display:table;
          border: 1px solid black;
          border-collapse: collapse;
        }
        form.tr, div.tr
        {
          display:table-row;
          border: 1px solid black;
          border-collapse: collapse;
        }
        span.td
        {
          display:table-cell;
          padding: 8px;
          border: 1px solid black;
          border-collapse: collapse;
        }
      </style>
    </head>
    <body>
  `;
  const taskKeys = Object.keys(data.tasks);
  // sort it
  taskKeys.sort((a, b) => {
    return b - a;
  });

  const tasksLists = taskKeys
    .map((key) => {
      const task = data.tasks[key];
      if (!task) {
        return "";
      }
      const { interval, url, logs } = task;
      let logsHtml = "";
      if (logs && logs.length > 0) {
        const latestLog = encodeHTML(logToText(logs[0], _clientOffset));
        let moreLogsHtml = "";
        if (logs.length > 1) {
          moreLogsHtml = ``;
          for (let i = 1; i < logs.length; i++) {
            let logDetail = logToText(logs[i], _clientOffset);

            logDetail = encodeHTML(logDetail);
            moreLogsHtml += "<p>" + logDetail + "</p>";
          }
          moreLogsHtml += ``;
        }

        logsHtml = `<details><summary>${latestLog}</summary>${moreLogsHtml}</details>`;
      }
      return `<form class="tr" method="POST">
   <span class="td">${key}</span><span class="td"><input type="submit" formaction="/tasks/${key}/edit" style="visibility: hidden; display: none;"><input class="w-md" type="number" min="1" max="43200" name="interval" value="${interval}" required placeholder="minutes" /></span>
  <span class="td"><input class="w-lg" type="url" name="url" value="${url}" rqeuired placeholder="url" /></span>     
  <span class="td"><input class="mr mb" type="submit" formaction="/tasks/${key}/edit" value="Save"><button formaction="/tasks/${key}/run" class="mr mb">Run</button><button formaction="/tasks/${key}/delete">Delete</button></span>
  <span class="td">${logsHtml}</span>
  </form>`;
    })
    .join("");

  const body = `<main>
  <h2>Cronbin</h2>
  <p><a href="https://github.com/theowenyoung/blog/tree/main/scripts">Source Code</a></p>

<div class="table">
<div class="tr">
  <span class="td"><b>ID</b></span><span class="td"><b>Interval</b></span><span class="td"><b>URL</b></span><span class="td"><b>Actions</b></span><span class="td"><b>Logs</b></span>
</div>
<form class="tr" method="POST">
  <span class="td"></span><span class="td"><input type="submit" formaction="/tasks" style="visibility: hidden; display: none;"><input class="w-md" type="number" name="interval" value="30" min="1" max="43200" required placeholder="minutes" /></span>
  <span class="td"><input class="w-lg" type="url" name="url" rqeuired placeholder="url" /></span>
  <span class="td"><button formaction="/tasks">Add</button></span>
</form>
${tasksLists}
</div>
</main>`;
  const script = `
var clientOffset = getCookie("_clientOffset");
var currentOffset = new Date().getTimezoneOffset() * -1;
var reloadForCookieRefresh = false;

if (clientOffset  == undefined || clientOffset == null || clientOffset != currentOffset) {
    setCookie("_clientOffset", currentOffset, 30);
    reloadForCookieRefresh = true;
}

if (reloadForCookieRefresh)
    window.location.reload();

function setCookie(name, value, days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name) {
    var nameEQ = name + "=";
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

  `;

  return html + body + `<script>${script}</script></body></html>`;
}

function logToText(log, _clientOffset) {
  let { ok, run_at, message } = log;
  message = message || "";

  return `${ok ? "✅" : "❌"} ${timeToText(
    new Date(run_at),
    _clientOffset
  )} ${message}`;
}

function timeToText(time, clientOffset) {
  // get xx ago
  const now = new Date();
  const diff = now.getTime() - time.getTime();
  const diffInMinutes = Math.floor(diff / 1000 / 60);
  if (diffInMinutes < 1) {
    const seconds = Math.floor(diff / 1000);
    return `${seconds}s ago`;
  }
  const diffInHours = Math.floor(diffInMinutes / 60);

  const clientTimezoneDateTime = time.getTime() + clientOffset * 60 * 1000;
  const clientDate = new Date(clientTimezoneDateTime);

  if (diffInHours < 24) {
    // get hour, minutes, second
    const hour = clientDate.getUTCHours();
    const minutes = clientDate.getUTCMinutes();
    return `${hour}:${minutes}`;
  }
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays}d ago`;
  }

  // return clientDate.toISOString();
  // return clientDate.toISOString().slice(0, 18);
}

function getCookieValue(cookie, key) {
  let keyValue = null;
  if (cookie) {
    const parts = cookie.split(";");
    for (const part of parts) {
      const [cookieKey, value] = part.split("=");
      if (cookieKey && cookieKey.trim() === key) {
        keyValue = value;
        break;
      }
    }
  }
  return keyValue;
}
function encodeHTML(str) {
  return str.replace(/[\u00A0-\u9999<>\&]/g, function (i) {
    return "&#" + i.charCodeAt(0) + ";";
  });
}
