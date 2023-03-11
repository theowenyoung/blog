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
      // check interval is valid
      if (!isValidNumber(interval)) {
        throw new HTTPError(
          "invalidInterval",
          "interval is invalid",
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

      if (!isValidUrl(url)) {
        throw new HTTPError("invalidUrl", "url is invalid", 400, "Bad Request");
      }
      let note = formData.get("note") || "";
      if (note) {
        note = note.slice(0, 150);
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
        note,
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
      // first we should save it.

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

      // check interval is valid
      if (!isValidNumber(interval)) {
        throw new HTTPError(
          "invalidInterval",
          "interval is invalid",
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

      if (!isValidUrl(url)) {
        throw new HTTPError("invalidUrl", "url is invalid", 400, "Bad Request");
      }
      let note = formData.get("note") || "";
      if (note) {
        note = note.slice(0, 150);
      }

      // check is same
      //
      if (
        !(
          data.tasks[id].interval === interval &&
          data.tasks[id].url === url &&
          data.tasks[id].note === note
        )
      ) {
        // find the largest task key
        data.tasks[id] = {
          ...task,
          interval,
          url,
          note,
        };
        await setData(env, data);
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

        // check interval is valid
        if (!isValidNumber(interval)) {
          throw new HTTPError(
            "invalidInterval",
            "interval is invalid",
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

        if (!isValidUrl(url)) {
          throw new HTTPError(
            "invalidUrl",
            "url is invalid",
            400,
            "Bad Request"
          );
        }
        let note = formData.get("note") || "";
        if (note) {
          note = note.slice(0, 150);
        }

        // find the largest task key
        data.tasks[id] = {
          ...task,
          interval,
          url,
          note,
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
  } else if (pathname === "/notification") {
    const data = await getData(env);
    const formData = await request.formData();
    const notification_curl = formData.get("notification_curl");
    if (!notification_curl) {
      throw new HTTPError(
        "notification_curlRequired",
        "notification_curl is required",
        400,
        "Bad Request"
      );
    }
    if (!isValidUrl(notification_curl)) {
      throw new HTTPError(
        "invalidNotification_curl",
        "notification_curl is invalid",
        400,
        "Bad Request"
      );
    }
    data.notification_curl = notification_curl;
    await setData(env, data);
    return ["/", "redirect"];
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
  const notification_curl = data.notification_curl;

  // promise settled
  const results = await Promise.allSettled(
    urls.map((url) => {
      let finalUrl = "";
      const finalOptions = {};
      // check url is valid url or curl
      try {
        new URL(url);
        finalUrl = url;
      } catch (_e) {
        // not valid url, try to parse it as curl
        const curlOptions = parseCurl(url);
        finalUrl = curlOptions.url;
        if (curlOptions.method) {
          finalOptions.method = curlOptions.method;
        }

        if (curlOptions.headers) {
          finalOptions.headers = curlOptions.headers;
        }
        if (curlOptions.body) {
          finalOptions.body = curlOptions.body;
        }
      }
      if (!finalOptions.headers) {
        finalOptions.headers = {};
      }
      if (!finalOptions.headers["User-Agent"]) {
        finalOptions.headers["User-Agent"] =
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/110.0";
      }
      return fetch(finalUrl, finalOptions).then((res) => {
        return res.text().then((body) => {
          if (res.ok) {
            return body;
          } else {
            throw new Error(`${res.status}: ${res.statusText}, \n${body}`);
          }
        });
      });
    })
  );
  const now = new Date();
  let globalError = null;
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

      globalError = globalError || failedMessage;
      console.warn("task failed", reason);
      data.tasks[taskId].logs.unshift({
        run_at: now.toISOString(),
        ok: false,
        message: failedMessage,
      });
    }
  }

  // if data is changed, update it
  await setData(env, data);
  if (globalError && notification_curl) {
    let notificationFetchOptions = null;
    if (notification_curl) {
      notificationFetchOptions = parseCurl(notification_curl);
    }
    let { url, method, headers, body } = notificationFetchOptions;
    const finalHeaders = {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/110.0",
      ...headers,
    };
    // replace \n  for json

    let finalGlobalMessage = globalError.replace(/\n/g, "\\n");
    finalGlobalMessage = finalGlobalMessage + " -- cronbin";
    const finalBody = body.replace(/{{message}}/g, finalGlobalMessage);
    if (url.includes("{{message}}")) {
      url = url.replace(/{{message}}/g, encodeURIComponent(finalGlobalMessage));
    }

    const res = await fetch(url, {
      method,
      headers: finalHeaders,
      body: finalBody,
    });
    await res.text();
    if (!res.ok) {
      const notificationError = new Error(
        `notification failed: ${res.status}: ${
          res.statusText
        }, ${await res.text()}`
      );
      console.warn("notification error", notificationError);
    }
  }
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
    if (diff >= interval * 60 * 1000) {
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
          max-width: 30rem;
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
      let { interval, url, logs, note } = task;
      if (!note) {
        note = "";
      }
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
   <span class="td">${key}</span><span class="td"><input type="submit" formaction="/tasks/${key}/edit" style="visibility: hidden; display: none;"><input class="w-md" type="number" autocomplete="off" min="1" max="43200" name="interval" value="${interval}" required placeholder="minutes" /></span>
  <span class="td"><textarea rows="1" class="w-lg" name="url" autocomplete="off" rqeuired placeholder="URL or curl command">${url}</textarea></span>     
  <span class="td"><input class="mr mb" type="submit" formaction="/tasks/${key}/edit" value="Save"><button formaction="/tasks/${key}/run" class="mr mb">Run</button><button formaction="/tasks/${key}/delete">Delete</button></span>
  <span class="td"><input class="w-md" value="${note}" autocomplete="off" type="text" name="note" placeholder="Note" /></span>
  <span class="td">${logsHtml}</span>
  </form>`;
    })
    .join("");

  const body = `<main>
  <h2>Cronbin</h2>
  <p>Made by ❤️ <a href="https://www.owenyoung.com/">Owen</a> (<a href="https://github.com/theowenyoung/blog/tree/main/scripts/cronbin">Source Code</a>) </p>

<div class="table">
<div class="tr">
  <span class="td"><b>ID</b></span><span class="td"><b>Interval</b></span><span class="td"><b>URL</b></span><span class="td"><b>Actions</b></span><span class="td"><b>Notes</b></span><span class="td"><b>Logs</b></span>
</div>
<form class="tr" method="POST">
  <span class="td"></span><span class="td"><input type="submit" formaction="/tasks" style="visibility: hidden; display: none;"><input class="w-md" type="number" autocomplete="off" name="interval" value="30" min="1" max="43200" required placeholder="minutes" /></span>
  <span class="td"><textarea rows="1" class="w-lg" name="url" autocomplete="off" rqeuired placeholder="URL or curl command"></textarea></span>
  <span class="td"><button formaction="/tasks">Add</button></span>
<span class="td"><input class="w-md" type="text" name="note" autocomplete="off" placeholder="Note" /></span>
</form>
${tasksLists}
</div>
<section>
<h3>Notification when failed?</h3>
<form action="/notification" method="POST">
<textarea rows="2" cols="80" name="notification_curl" autocomplete="off" rqeuired placeholder="place a curl command, {{message}} is the error message placeholder.">${
    data.notification_curl || ""
  }</textarea>
<br />
<input type="submit" value="Save">
</form>

</section>
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
    return `${addZero(hour)}:${addZero(minutes)}`;
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

function isValidNumber(num) {
  return !isNaN(num) && num >= 1 && num <= 43200;
}

function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch (err) {
    // is curl command
    try {
      parseCurl(url);
      return true;
    } catch (e) {
      console.warn("parse curl command error", e);
      return false;
    }

    return false;
  }
}
function addZero(num) {
  return num < 10 ? "0" + num : num;
}

// parse curl

export function parseCurl(curl_request) {
  const argvsArr = stringToArgv(curl_request, {
    removequotes: "always",
  }).map((item) => {
    let value = item.trim();
    if (value.startsWith("\\")) {
      value = value.slice(1).trim();
    }
    return value;
  });

  const argvs = parseArgv(argvsArr);
  const json = {
    headers: {},
  };

  const removeQuotes = (str) => str.replace(/['"]+/g, "");

  const stringIsUrl = (url) => {
    return /^(ftp|http|https):\/\/[^ "]+$/.test(url);
  };

  const parseField = (string) => {
    return string.split(/: (.+)/);
  };

  const parseHeader = (header) => {
    let parsedHeader = {};
    if (Array.isArray(header)) {
      header.forEach((item, index) => {
        const field = parseField(item);
        parsedHeader[field[0]] = field[1];
      });
    } else {
      const field = parseField(header);
      parsedHeader[field[0]] = field[1];
    }

    return parsedHeader;
  };

  for (const argv in argvs) {
    switch (argv) {
      case "_":
        {
          const _ = argvs[argv];
          _.forEach((item) => {
            item = removeQuotes(item);

            if (stringIsUrl(item)) {
              json.url = item;
            }
          });
        }
        break;

      case "X":
      case "request":
        json.method = argvs[argv];
        break;

      case "H":
      case "header":
        {
          const parsedHeader = parseHeader(argvs[argv]);
          json.headers = {
            ...json.header,
            ...parsedHeader,
          };
        }
        break;

      case "u":
      case "user":
        json.header["Authorization"] = argvs[argv];
        break;

      case "A":
      case "user-agent":
        json.header["user-agent"] = argvs[argv];
        break;

      case "I":
      case "head":
        json.method = "HEAD";
        break;

      case "L":
      case "location":
        json.redirect = "follow";
        const value = argvs[argv];
        if (typeof value === "string") {
          json.url = value;
        }
        break;

      case "b":
      case "cookie":
        json.header["Set-Cookie"] = argvs[argv];
        break;

      case "d":
      case "data":
      case "data-raw":
      case "data-ascii":
        const dataValue = argvs[argv];
        if (typeof dataValue === "string") {
          json.body = argvs[argv];
        } else {
          throw new Error("Invalid curl command, data value is not string");
        }
        break;

      case "data-urlencode":
        json.body = argvs[argv];
        break;

      case "compressed":
        if (!json.header["Accept-Encoding"]) {
          json.header["Accept-Encoding"] = argvs[argv] || "deflate, gzip";
        }
        break;

      default:
        break;
    }
  }
  if (!json.url) {
    throw new Error("Invalid curl command, no url detected");
  }

  if (!json.method) {
    if (json.body) {
      json.method = "POST";
    } else {
      json.method = "GET";
    }
  }

  return json;
}

// https://github.com/minimistjs/minimist/blob/main/index.js

function hasKey(obj, keys) {
  var o = obj;
  keys.slice(0, -1).forEach(function (key) {
    o = o[key] || {};
  });

  var key = keys[keys.length - 1];
  return key in o;
}

function isNumber(x) {
  if (typeof x === "number") {
    return true;
  }
  if (/^0x[0-9a-f]+$/i.test(x)) {
    return true;
  }
  return /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)(e[-+]?\d+)?$/.test(x);
}

function isConstructorOrProto(obj, key) {
  return (
    (key === "constructor" && typeof obj[key] === "function") ||
    key === "__proto__"
  );
}

function parseArgv(args, opts) {
  if (!opts) {
    opts = {};
  }

  var flags = {
    bools: {},
    strings: {},
    unknownFn: null,
  };

  if (typeof opts.unknown === "function") {
    flags.unknownFn = opts.unknown;
  }

  if (typeof opts.boolean === "boolean" && opts.boolean) {
    flags.allBools = true;
  } else {
    []
      .concat(opts.boolean)
      .filter(Boolean)
      .forEach(function (key) {
        flags.bools[key] = true;
      });
  }

  var aliases = {};

  function aliasIsBoolean(key) {
    return aliases[key].some(function (x) {
      return flags.bools[x];
    });
  }

  Object.keys(opts.alias || {}).forEach(function (key) {
    aliases[key] = [].concat(opts.alias[key]);
    aliases[key].forEach(function (x) {
      aliases[x] = [key].concat(
        aliases[key].filter(function (y) {
          return x !== y;
        })
      );
    });
  });

  []
    .concat(opts.string)
    .filter(Boolean)
    .forEach(function (key) {
      flags.strings[key] = true;
      if (aliases[key]) {
        [].concat(aliases[key]).forEach(function (k) {
          flags.strings[k] = true;
        });
      }
    });

  var defaults = opts.default || {};

  var argv = { _: [] };

  function argDefined(key, arg) {
    return (
      (flags.allBools && /^--[^=]+$/.test(arg)) ||
      flags.strings[key] ||
      flags.bools[key] ||
      aliases[key]
    );
  }

  function setKey(obj, keys, value) {
    var o = obj;
    for (var i = 0; i < keys.length - 1; i++) {
      var key = keys[i];
      if (isConstructorOrProto(o, key)) {
        return;
      }
      if (o[key] === undefined) {
        o[key] = {};
      }
      if (
        o[key] === Object.prototype ||
        o[key] === Number.prototype ||
        o[key] === String.prototype
      ) {
        o[key] = {};
      }
      if (o[key] === Array.prototype) {
        o[key] = [];
      }
      o = o[key];
    }

    var lastKey = keys[keys.length - 1];
    if (isConstructorOrProto(o, lastKey)) {
      return;
    }
    if (
      o === Object.prototype ||
      o === Number.prototype ||
      o === String.prototype
    ) {
      o = {};
    }
    if (o === Array.prototype) {
      o = [];
    }
    if (
      o[lastKey] === undefined ||
      flags.bools[lastKey] ||
      typeof o[lastKey] === "boolean"
    ) {
      o[lastKey] = value;
    } else if (Array.isArray(o[lastKey])) {
      o[lastKey].push(value);
    } else {
      o[lastKey] = [o[lastKey], value];
    }
  }

  function setArg(key, val, arg) {
    if (arg && flags.unknownFn && !argDefined(key, arg)) {
      if (flags.unknownFn(arg) === false) {
        return;
      }
    }

    var value = !flags.strings[key] && isNumber(val) ? Number(val) : val;
    setKey(argv, key.split("."), value);

    (aliases[key] || []).forEach(function (x) {
      setKey(argv, x.split("."), value);
    });
  }

  Object.keys(flags.bools).forEach(function (key) {
    setArg(key, defaults[key] === undefined ? false : defaults[key]);
  });

  var notFlags = [];

  if (args.indexOf("--") !== -1) {
    notFlags = args.slice(args.indexOf("--") + 1);
    args = args.slice(0, args.indexOf("--"));
  }

  for (var i = 0; i < args.length; i++) {
    var arg = args[i];
    var key;
    var next;

    if (/^--.+=/.test(arg)) {
      // Using [\s\S] instead of . because js doesn't support the
      // 'dotall' regex modifier. See:
      // http://stackoverflow.com/a/1068308/13216
      var m = arg.match(/^--([^=]+)=([\s\S]*)$/);
      key = m[1];
      var value = m[2];
      if (flags.bools[key]) {
        value = value !== "false";
      }
      setArg(key, value, arg);
    } else if (/^--no-.+/.test(arg)) {
      key = arg.match(/^--no-(.+)/)[1];
      setArg(key, false, arg);
    } else if (/^--.+/.test(arg)) {
      key = arg.match(/^--(.+)/)[1];
      next = args[i + 1];
      if (
        next !== undefined &&
        !/^(-|--)[^-]/.test(next) &&
        !flags.bools[key] &&
        !flags.allBools &&
        (aliases[key] ? !aliasIsBoolean(key) : true)
      ) {
        setArg(key, next, arg);
        i += 1;
      } else if (/^(true|false)$/.test(next)) {
        setArg(key, next === "true", arg);
        i += 1;
      } else {
        setArg(key, flags.strings[key] ? "" : true, arg);
      }
    } else if (/^-[^-]+/.test(arg)) {
      var letters = arg.slice(1, -1).split("");

      var broken = false;
      for (var j = 0; j < letters.length; j++) {
        next = arg.slice(j + 2);

        if (next === "-") {
          setArg(letters[j], next, arg);
          continue;
        }

        if (/[A-Za-z]/.test(letters[j]) && next[0] === "=") {
          setArg(letters[j], next.slice(1), arg);
          broken = true;
          break;
        }

        if (
          /[A-Za-z]/.test(letters[j]) &&
          /-?\d+(\.\d*)?(e-?\d+)?$/.test(next)
        ) {
          setArg(letters[j], next, arg);
          broken = true;
          break;
        }

        if (letters[j + 1] && letters[j + 1].match(/\W/)) {
          setArg(letters[j], arg.slice(j + 2), arg);
          broken = true;
          break;
        } else {
          setArg(letters[j], flags.strings[letters[j]] ? "" : true, arg);
        }
      }

      key = arg.slice(-1)[0];
      if (!broken && key !== "-") {
        if (
          args[i + 1] &&
          !/^(-|--)[^-]/.test(args[i + 1]) &&
          !flags.bools[key] &&
          (aliases[key] ? !aliasIsBoolean(key) : true)
        ) {
          setArg(key, args[i + 1], arg);
          i += 1;
        } else if (args[i + 1] && /^(true|false)$/.test(args[i + 1])) {
          setArg(key, args[i + 1] === "true", arg);
          i += 1;
        } else {
          setArg(key, flags.strings[key] ? "" : true, arg);
        }
      }
    } else {
      if (!flags.unknownFn || flags.unknownFn(arg) !== false) {
        argv._.push(flags.strings._ || !isNumber(arg) ? arg : Number(arg));
      }
      if (opts.stopEarly) {
        argv._.push.apply(argv._, args.slice(i + 1));
        break;
      }
    }
  }

  Object.keys(defaults).forEach(function (k) {
    if (!hasKey(argv, k.split("."))) {
      setKey(argv, k.split("."), defaults[k]);

      (aliases[k] || []).forEach(function (x) {
        setKey(argv, x.split("."), defaults[k]);
      });
    }
  });

  if (opts["--"]) {
    argv["--"] = notFlags.slice();
  } else {
    notFlags.forEach(function (k) {
      argv._.push(k);
    });
  }

  return argv;
}

// https://raw.githubusercontent.com/binocarlos/spawn-args/master/index.js
function stringToArgv(args, opts) {
  opts = opts || {};
  args = args || "";
  var arr = [];

  var current = null;
  var quoted = null;
  var quoteType = null;

  function addcurrent() {
    if (current) {
      // trim extra whitespace on the current arg
      arr.push(current.trim());
      current = null;
    }
  }

  // remove escaped newlines
  args = args.replace(/\\\n/g, "");

  for (var i = 0; i < args.length; i++) {
    var c = args.charAt(i);

    if (c == " ") {
      if (quoted) {
        quoted += c;
      } else {
        addcurrent();
      }
    } else if (c == "'" || c == '"') {
      if (quoted) {
        quoted += c;
        // only end this arg if the end quote is the same type as start quote
        if (quoteType === c) {
          // make sure the quote is not escaped
          if (quoted.charAt(quoted.length - 2) !== "\\") {
            arr.push(quoted);
            quoted = null;
            quoteType = null;
          }
        }
      } else {
        addcurrent();
        quoted = c;
        quoteType = c;
      }
    } else {
      if (quoted) {
        quoted += c;
      } else {
        if (current) {
          current += c;
        } else {
          current = c;
        }
      }
    }
  }

  addcurrent();

  if (opts.removequotes) {
    arr = arr.map(function (arg) {
      if (opts.removequotes === "always") {
        return arg.replace(/^["']|["']$/g, "");
      } else {
        if (arg.match(/\s/)) return arg;
        return arg.replace(/^"|"$/g, "");
      }
    });
  }

  return arr;
}
