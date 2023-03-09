// import dotenv
import "https://deno.land/x/dotenv/load.ts";
import { runHackernewszhTask as _runHackernewszhTask } from "./hackernewszh/mod.js";

Deno.test("task #1", async () => {
  await _runHackernewszhTask();
});
