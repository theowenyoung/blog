import { getCurrentTaskIds } from "./main.js";
import { parseCurl } from "./main.js";
import { assertEquals } from "https://deno.land/std@0.178.0/testing/asserts.ts";
import { checkAndRunTasks } from "./main.js";

Deno.test("check task", async () => {
  // await checkAndRunTasks({
  //   CRONBIN: {
  //     get: async (key) => {
  //       try {
  //         const value = await Deno.readTextFile(`./data/${key}.json`);
  //
  //         return value;
  //       } catch (_e) {
  //         return null;
  //       }
  //     },
  //     put: async (key, value) => {
  //       // ensure folder exists
  //       await Deno.mkdir("./data", { recursive: true });
  //       await Deno.writeTextFile(`./data/${key}.json`, value);
  //     },
  //   },
  // });
});
Deno.test("getCurrentUrls", () => {
  const data = {
    tasks: {
      1: {
        url: "https://www.google.com",
        interval: 5,
        logs: [
          {
            run_at: "2021-01-01T00:00:00.000Z",
            ok: true,
            message: "ok",
          },
        ],
      },
    },
  };

  const now = new Date("2021-01-01T00:06:00.000Z").toISOString();
  const ids = getCurrentTaskIds(now, data);
  assertEquals(ids, ["1"]);

  const now2 = new Date("2021-01-01T00:04:59.000Z").toISOString();
  const ids2 = getCurrentTaskIds(now2, data);
  assertEquals(ids2, []);
});

Deno.test("getCurrentUrls #2", () => {
  const data = {
    tasks: {
      1: {
        url: "https://www.google.com",
        interval: "*/5 * * * *",
        logs: [
          {
            run_at: "2021-01-01T00:00:00.000Z",
            ok: true,
            message: "ok",
          },
        ],
      },
    },
  };

  const now = new Date("2021-01-01T00:06:00.000Z").toISOString();
  const ids = getCurrentTaskIds(now, data);
  assertEquals(ids, ["1"]);

  const now2 = new Date("2021-01-01T00:04:59.000Z").toISOString();
  const ids2 = getCurrentTaskIds(now2, data);
  assertEquals(ids2, []);
});

Deno.test("url match", () => {
  const taskRunPattern = new URLPattern({
    pathname: "/tasks/:id/run",
  });

  // check if url match run pattern
  const match = taskRunPattern.exec("http://localhost:8000/tasks/2/run");
  assertEquals(match.pathname.groups.id, "2");
});

Deno.test("parseCurl", () => {
  const result = parseCurl(
    "curl -X POST -H 'Content-Type: application/json' -d '{\"name\": \"John\"}' http://localhost:8000/tasks/2/run",
  );
  assertEquals(result.method, "POST");
  assertEquals(result.headers, {
    "Content-Type": "application/json",
  });
  assertEquals(result.body, `{"name": "John"}`);
});

Deno.test("parseCurl #2", () => {
  const result = parseCurl("curl https://test.com");
  assertEquals(result.method, "GET");
  assertEquals(result.url, "https://test.com");
});

Deno.test("parseCurl put #3", () => {
  const result = parseCurl("curl -X PUT https://test.com");
  assertEquals(result.method, "PUT");
  assertEquals(result.url, "https://test.com");
});

Deno.test("parseCurl #4", () => {
  const result = parseCurl(`
curl --location 'https://jsonplaceholder.typicode.com/posts' \
--header 'Authorization: Bearer abc' \
--header 'Content-Type: application/json' \
--data '{
    "title":"test"
}'
`);

  assertEquals(result.method, "POST");
  assertEquals(result.url, "https://jsonplaceholder.typicode.com/posts");
  assertEquals(result.headers, {
    Authorization: "Bearer abc",
    "Content-Type": "application/json",
  });
});

Deno.test("parseCurl #5", () => {
  const result =
    parseCurl(`curl --location 'https://jsonplaceholder.typicode.com/posts' \
--header 'Content-Type: application/json' \
--data '{
    "title":"test"
}'`);
  assertEquals(
    result.body,
    `{
    "title":"test"
}`,
  );
});

Deno.test("parseCurl #6", () => {
  const result = parseCurl(
    `curl -L -H 'Authorization: Bearer abc' -H 'Content-Type: application/json' https://api.github.com/repos/xxx/yyy/dispatches -d '{"event_type":"schedule"}'`,
  );
  assertEquals(result.method, "POST");
  assertEquals(result.url, "https://api.github.com/repos/xxx/yyy/dispatches");
});

Deno.test("parseCurl #7", () => {
  const result =
    parseCurl(`curl --location 'https://api.telegram.org/xxxxx:xxx/sendMessage' \
--header 'Content-Type: application/json' \
--data '{
    "chat_id":"-22",
    "text":"{{message}}"
}'`);
  assertEquals(result.method, "POST");
});

Deno.test("parseCurl #8", () => {
  const result = parseCurl(
    `curl https://api.day.app/5oZSh36eJ83HjAG3Hsi4V8/hello`,
  );
  // console.log(result);
  assertEquals(result.method, "GET");
});
