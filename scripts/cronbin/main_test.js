import { getCurrentTaskIds } from "./main.js";
import { assertEquals } from "https://deno.land/std@0.178.0/testing/asserts.ts";
Deno.test("getCurrentUrls", () => {
  const data = {
    tasks: {
      1: {
        url: "https://www.google.com",
        interval: 5 * 60 * 1000,
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
