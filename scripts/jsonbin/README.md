# JSONBin

Simple JSON as Storage service deployed on Cloudflare Workers.

## Deploy this following code to Cloudflare Workers

<https://github.com/theowenyoung/blog/blob/main/scripts/jsonbin/main.js>

See [How to deploy](#how)

### Write JSON

```bash
curl 'https://json.owenyoung.com/foo/bar?key=abc' --data '{"foo":"bar"}'
```

### Read JSON

```bash
curl 'https://json.owenyoung.com/foo/bar?key=abc'
```

### Usage

```typescript
import JSONBin from "https://deno.land/x/jsonbin@v0.0.4/mod.ts";

const jsonBin = new JSONBin({
  api: "https://json.owenyoung.com",
  key: "abc",
});

const sentArr = await jsonBin.get("/rss/abc", []);

console.log("current sentArr", sentArr);

// do some work
// ...

sentArr.push("456");

// write the newest sentArr to KV

await jsonBin.set("/rss/abc", sentArr);
```

### How

1. Create a KV namespane on [Cloudfalre](https://dash.cloudflare.com/) with name `jsonbin`
2. Create a worker on [Cloudfalre](https://dash.cloudflare.com/), bind the KV at Settings -> Variables -> KV Namespace Bindings ,`name: `JSONBIN`.
3. Quick Edit worker code, with <https://github.com/theowenyoung/blog/blob/main/scripts/jsonbin/main.js> , change the APIKEY, save it.
4. You can add a custom domai for it.
