// import dotenv
import "https://deno.land/x/dotenv/load.ts";
import {
  runHackernewszhTask as _runHackernewszhTask,
  setup as _setup,
} from "./hackernewszh/mod.js";

Deno.test("task #1", async () => {
  _setup();
  await _runHackernewszhTask();
});
