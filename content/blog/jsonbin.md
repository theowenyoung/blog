---
title: 在 Cloudflare Workers 部署一个 JSON as a Storage 服务
date: 2023-03-09T01:38:46+08:00
updated: 2023-03-09
draft: false
taxonomies:
  categories:
    - Dev
  tags:
    - JSON
---

我特别喜欢[JSON](https://www.json.org/json-en.html), 因为它真的很小巧和简单，幸运的是，它还是我使用的主要语言 Javascript 和 Typescript 里的一级公民，也太幸运了吧！

我经常用本地的 JSON 文件来存储一些需要持久化的数据，这样可以省掉要调试 sql 或者 redit 的大把时间，而且数据都是明文纯文本存储，搜索，定位问题都很方便，比如整个[Buzzing](https://www.buzzing.cc/) 还有整个[Track Awesome List](https://www.trackawesomelist.com/) 都只使用 JSON 作为持久化存储的格式。

但是像这样比较大的项目，我会把 JSON 文件存储到 Cloudflare 的 R2 服务里（类似 AWS 的 S3 ），但是除此之外，我还有很多小小的工作流，这些东西通常也需要一个持久化的数据存储，比如一个 RSS 的监控服务，我需要记录哪些 ID 已经被发送过了，这是一个很常见的需求，但是要寻找一个适合的服务也不是一件容易的事，所以今天我尝试搜索了一下 JSON as a Storage 方案，最后决定采用 Cloudfalre 的 Workers 作为 host, 其实也就几十行代码的事，Workers 好就好在一次部署，终生不用再管，所以特别适合这种服务。

<!-- more -->

部署之后，你会得到一个这样的接口：

## 写 json

```bash
curl 'https://json.owenyoung.com/foo/bar?key=abc' --data '{"foo":"bar"}'
```

## 读 json

```bash
curl 'https://json.owenyoung.com/foo/bar?key=abc'
```

### 示例：如何记录已发送的 RSS ids

```javascript
let sentArr = [];
const response = await fetch(
  "https://json.owenyoung.com/rss/hackernews/sent?key=abc"
);
if (response.ok) {
  sentArr = await response.json();
} else {
  if (response.status === 404) {
    sentArr = [];
  } else {
    throw new Error(`${response.status}: ${response.statusText}`);
  }
}

console.log("current sentArr", sentArr);

// do some work

sentArr.push("456");

// write the newest sentArr to KV

const writeResponse = await fetch(
  "https://json.owenyoung.com/rss/hackernews/sent?key=abc",
  {
    method: "POST",
    body: JSON.stringify(sentArr),
  }
);

if (!writeResponse.ok) {
  throw new Error(`${writeResponse.status}: ${writeResponse.statusText}`);
}
```

好吧，上面那一坨有点烦，我[封装了一个叫 JSONBin 的类](https://github.com/theowenyoung/blog/blob/main/scripts/jsonbin/mod.ts)，我喜欢用 Deno 写这种小脚本，所以你可以在 Deno 中这样使用：

```typescript
import JSONBin from "https://deno.land/x/jsonbin@v0.0.5/mod.ts";

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

## 如何在 Cloudfalre Workers 上部署该服务

如下：

1. 先在 [Cloudfalre](https://dash.cloudflare.com/) 创建一个 KV 命名空间, `Workers -> KV` , 名字可以叫：`jsonbin`
2. 然后在[Cloudfalre](https://dash.cloudflare.com/) 创建一个 Worker, 在该 Worker 的 Settings -> Variables -> KV Namespace Bindings , 绑定刚刚创建的 KV， Variable name 填：`JSONBIN`, kv namespace 选择刚刚那个就可以了.
3. 点击快速编辑，把 [`main.js`](https://github.com/theowenyoung/blog/blob/main/scripts/jsonbin/main.js) 里的代码粘贴进去, 记得修改一下密钥。
4. 如果有需要，可以在 Triggers 里面配置绑定的自定义域名，我绑定了一个 `json.owenyoung.com`

> 灵感和初始代码来自 [这里 jsonbase ](https://github.com/huhuhang/jsonbase/blob/master/index.js)，我加了一点鲁棒性在里面！

希望这个小脚本成为你的工作流中的粘合剂！
