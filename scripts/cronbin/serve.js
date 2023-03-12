import { Server } from "https://deno.land/std@0.179.0/http/server.ts";
import handler from "./main.js";
const hostname = "localhost";
const port = 8000;
const server = new Server({
  hostname,
  port,
  handler: (request) => {
    return handler.fetch(request, {
      CRONBIN: {
        get: async (key) => {
          try {
            const value = await Deno.readTextFile(`./data/${key}.json`);

            return value;
          } catch (_e) {
            return null;
          }
        },
        put: async (key, value) => {
          // ensure folder exists
          await Deno.mkdir("./data", { recursive: true });
          await Deno.writeTextFile(`./data/${key}.json`, value);
        },
      },
    });
  },
});
console.log(`Starting to listen on port ${port}`);
server.listenAndServe();
globalThis.addEventListener("unload", () => {
  server.close();
});
