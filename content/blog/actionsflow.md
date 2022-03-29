---
title: Actionsflow介绍 - 可以一键部署在Github上的IFTTT/Zapier的开源替代
date: 2021-02-02
updated: 2021-02-02
taxonomies:
  categories:
    - Misc
  tags:
    - Workflows
---

我还记得当年第一次使用[IFTTT](https://ifttt.com)的时候的那种兴奋，天呐，这才是互联网！从那时起，就一直使用 IFTTT 到今天，真的很棒的一个产品！直到 IFTTT 最近宣布要收费，我就在想有没有合适的开源方案可以替代，因为托管方案肯定没戏了，连 10 年都免费的 IFTTT 都开始收费了，其他的只会更贵，结果发现主流的开源替代方案，比如 huginn, n8n, node-red 好像又有点重，不够轻量，而且扩展起来也不容易。

<!-- more -->

刚好在那时看到[Github 的 Actions](https://docs.github.com/en/actions)支持[Schedule](https://docs.github.com/en/actions/reference/events-that-trigger-workflows#schedule)事件，而 Github 的 Actions 又是对开源项目免费使用，所以就萌生了利用 Github Actions 的定时运行来检测更新，并执行指定动作。所以一个新的轮子[Actionsflow](https://github.com/actionsflow/actionsflow) 来了！

## 开始

1. 使用这个[链接](https://github.com/actionsflow/actionsflow-workflow-default/generate)用 Actionsflow 的默认模板创建一个新的 GitHub 项目，一个典型的 Actionsflow 项目长这样：

   ```bash
   ├── .github
   │   └── workflows
   │       └── actionsflow.yml
   ├── .gitignore
   ├── README.md
   └── workflows
   │   └── rss.yml
   │   └── webhook.yml
   └── package.json
   ```

1. 取消 `.github/workflows/actionsflow.yml` 文件里`schedule`的注释
1. 在`workflows/`文件夹创建你自己的 workflow 文件
1. 保存并提交你的文件到 Github

## 配置

我对 Actionsflow 的设计原则是规则尽可能简单，并且可扩展，workflow 的配置规则直接采用 Github Actions 的[配置格式](https://docs.github.com/en/actions/reference/workflow-syntax-for-github-actions)，如果你之前有用过 Github Actions 的话，应该立刻就能懂 Actionsflow 的全部配置规则：

```yaml
on:
  rss:
    url: https://hnrss.org/newest?points=300
    config:
    	limit: 10
jobs:
  request:
    name: Make a HTTP Request
    runs-on: ubuntu-latest
    steps:
      - name: Make a HTTP Request
        uses: actionsflow/axios@v1
        with:
          url: https://hookb.in/VGPzxoWbdjtE22bwznzE
          method: POST
          body: |
            {
              "link":"${{ on.rss.outputs.link }}",
              "title": "${{ on.rss.outputs.title }}",
              "content":"<<<${{ on.rss.outputs.contentSnippet }}>>>"
            }
```

和原生的 Github Actions 的配置相比，Actionsflow 只是扩展了`on`的事件，在 Actionsflow 里，我把它叫做`trigger`，[ RSS trigger](https://actionsflow.github.io/docs/triggers/rss/)经常被用来做示例使用，你可以点击[这里]([Actionsflow Triggers | Actionsflow Documentation](https://actionsflow.github.io/docs/triggers/))查看目前 Actionsflow 支持的所有 trigger. Trigger 里有个特殊的参数是`config`,这个 config 是通用参数，也就是所有的 trigger 都支持 config 参数，config 实现了很多通用的功能的，比如设置过滤条件，设置过滤条数，格式化输出结果，设置触发时间等等，点击[这里]([Workflow Syntax for Actionsflow | Actionsflow Documentation](https://actionsflow.github.io/docs/workflow/#ontriggerconfig)可以查看所有支持的配置。

其他的就和 Github Actions 的配置一样了，你可以在 jobs 里配置任何复杂的任务，或者简单的发个请求，你可以用` ${{ on.rss.outputs.<key> }}`来使用 trigger 的结果，每个 trigger 的结果的 key 需要去看对应 trigger 的文档。

我在[这里](https://actionsflow.github.io/docs/actions/)列出了你可能会用到的 Github Action，同时新建了一个[Awesome 项目](https://github.com/actionsflow/awesome-actionsflow)列出一些常用的 Actionsflow 工作流。

## Webhook

Actionsflow 不仅支持定时抓取类的任务，同时还支持 Webhook 类的任务，这样第三方服务如果有任何更新就可以主动通知 Actionsflow 了。这里 Webhook 机制是利用 Github 可以接收外界的 [`repository_dispatch`](https://docs.github.com/en/actions/reference/events-that-trigger-workflows#repository_dispatch) 事件来触发 Action 运行来实现的，具体使用可以见[这里](https://actionsflow.github.io/docs/triggers/webhook/)

## 本地运行

大多数情况下，使用 Github Actions 运行 Actionsflow 是更方便，也是推荐的使用方式，但是可能出于某种原因你需要在本地或者你自己的 VPS 上部署 Actionsflow. 要在本地运行 Actionsflow，必须先安装[Docker](https://www.docker.com/)

然后只需要运行:

```bash
docker run -it -v /var/run/docker.sock:/var/run/docker.sock -v ${PWD}:/data -p 3000:3000 actionsflow/actionsflow
```

手动运行方式见[这里](https://actionsflow.github.io/docs/self-hosted/#manual)
