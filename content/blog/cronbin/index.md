---
title: 在 Cloudflare Workers 部署一个带有 Dashboard 的 Cron 服务
date: 2023-03-10T11:04:55+08:00
updated: 2023-03-10
draft: false
taxonomies:
  categories:
    - Dev
  tags:
    - Cron
    - Cloudflare
---

昨天在 Cloudflare 搭建了 [JSONBin](/content/blog/jsonbin.md) 服务，作为持久化存储的方案，今天又总结出了我的工作流似乎还需要一个重要的 Trigger，那就是 Cron 任务，如果把这个问题解决，那么百分之 90 的用例就都被覆盖了。

目前已解决的工作流问题：

- Webhook Trigger: [Deno Deploy](https://deno.com/deploy)
- 持久化存储： [JSONBin](/content/blog/jsonbin.md)

<!-- more -->

待解决的问题：

- Cron 任务
- 需要 Oauth2.0 授权的第三方接口调用，比如推特等

今天用部署在 Cloudflare Workers 之上单一 Javascript 文件，几百行代码，完全满足了我的 Cron 任务需求。最终效果如下：

![screenshot](./cronbin.png)

该工具的功能很简单，就是定时对配置里的 URL 发出请求，并且记录每个 URL 最近 10 条的日志，方便定位问题。

最终源码都在这[一个文件](https://github.com/theowenyoung/blog/blob/main/scripts/cronbin/main.js)里，可以很方便的部署在 Cloudflare Worker 之上。

HTML 文件也只有一个，增删改查都在一个页面进行。数据存储在一个 JSON 文件里，存储结构如下：

```
{
  "tasks": {
    "1": {
      "url": "https://test.com",
      "interval": 5,
      "note":"Note",
      "logs": [
        {
          "ok": true,
          "message": "success",
          "run_at": "2019-01-01 00:00:00"
        }
      ]
    }
  }
}

```

用户（我）首先在这个简单的 UI 里增删改查 Task，然后利用 Cloudflare Workers 的 [Schedule 事件](https://developers.cloudflare.com/workers/runtime-apis/scheduled-event/)，每分钟运行一次[`CheckAndRunTasks`](https://github.com/theowenyoung/blog/blob/53afd7aaf518523544a1fc37cddbe00c6f2f3b4a/scripts/cronbin/main.js#L348)函数,该函数通过检查每个 Task 里`logs`字段里最近的`run_at`和任务本身的`interval`,来确定要不要运行该任务，随后计算出一个该次需要运行的 urls 列表，然后`Promise.allSettled`并行发出请求，最后，记录各 URL 执行的情况。

有了这个之后，我就可以执行一些定时的任务了，比如我刚把定时发送[Hacker News 中文精选](https://twitter.com/HackerNewsZh)的推特 Bot 的[服务](https://github.com/theowenyoung/blog/blob/main/scripts/hackernewszh/mod.js#L14)放在了 Deno Deploy 里，然后在这个 Cronbin 里添加一个每`60`分钟的定时请求： `https://task.owenyoung.com/runHackernewszhTask?key=abc`，这样就搞定了这个 bot 的定时发布程序。

目前还有一个痛点，就是发布推文这个 API，要是只有一个账户还好，但是我同时有很多个 Bot，所以最好是有一个 UI 界面可以绑定多账户，然后提供一个简单的发布 API 出来。我目前是用 IFTTT 做这件事，If Webhook -> Then Post a Tweet. 目前 IFTTT 免费层级只能绑定一个账户。所以我新开了一个坑[SimpleAPI](https://github.com/theowenyoung/simpleapi),准备用无服务器的方式提供任何接口的 SimpleAPI 版本，不知道能不能填上这个坑。

如果你想部署该服务，可以参考我写的这个[文档](https://github.com/theowenyoung/blog/tree/main/scripts/cronbin)
