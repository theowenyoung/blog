import JSONBin from "https://deno.land/x/jsonbin@v0.0.4/mod.ts";

const jsonBin = new JSONBin({
  api: "https://json.owenyoung.com",
  key: "abc",
});

const sentArr: string[] = await jsonBin.get("/rss/abc", []) as string[];

console.log("current sentArr", sentArr);

// do some work
// ...

sentArr.push("456");

// write the newest sentArr to KV

await jsonBin.set("/rss/abc", sentArr);
