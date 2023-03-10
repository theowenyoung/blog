# Cronbin

## Dev

> Install Deno first

```bash
make cronserve
# or: deno run -A --watch ./scripts/cronbin/serve.js ./scripts/cronbin/serve.js
```

## Deploy

1. Create a KV namespane on [Cloudfalre](https://dash.cloudflare.com/) with name `CRONBIN`
2. Create a worker on [Cloudfalre](https://dash.cloudflare.com/), bind the KV at Settings -> Variables -> KV Namespace Bindings ,`name: `CRONBIN`.
3. Quick Edit worker code, with <https://github.com/theowenyoung/blog/blob/main/scripts/cronbin/main.js> , change the APIKEY, save it.
4. You can add a custom domai for it.

## Usage

First, visit <https://yourdomain.com/?key=abc>, then, the browser will remember your cookie, so next time, we can visit <https://yourdomain.com/> directly.

## Screenshot

![screenshot](./cronbin.png)
