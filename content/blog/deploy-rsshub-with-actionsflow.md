---
title: 使用Actionsflow在Github上免费部署Rsshub
date: 2021-02-03
updated: 2022-03-10
taxonomies:
  categories:
    - Random
  tags:
    - Github Actions
    - Actionsflow
---

[Rsshub](https://github.com/DIYgod/RSSHub)是一个很棒的工具，把很多知名或不知名的网页数据通通统一为[RSS 格式](https://en.wikipedia.org/wiki/RSS)，堪称中文互联网的 W3C. 但是官方推荐的部署方式是[Docker 部署](https://docs.rsshub.app/install/#docker-compose-bu-shu)，对于大多数轻量使用的用户来说有点重，所以这里介绍一种免费，轻量，按需使用的部署方式，利用[Actionsflow](https://github.com/actionsflow/actionsflow)部署在 GitHub 的 [Actions](https://docs.github.com/en/actions) 上。

[Actionsflow](https://github.com/actionsflow/actionsflow)是一个基于 Github Actions 上的 IFTTT/Zapier 的开源替代，使用 [Github Actions 的配置格式](https://actionsflow.github.io/docs/workflow/)来配置你需要的工作流, 更多关于 Actionsflow 的使用可以看我的[另一篇文章介绍](https://blog.owenyoung.com/zh/posts/actionsflow/),或者[官方文档](https://actionsflow.github.io/docs/)

<!-- more -->

比如我自己在用的一个工作流就是监控豆瓣车组的一些我需要的关键词，如果有提到关键词的帖子，那么发送一个 telegram 消息给我，配置如下：

```yaml
on:
  rsshub:
    path:
      - path: /douban/group/669481
        query:
          filter_case_sensitive: false
          filter_title: 罐头|狗粮|爱肯拿|渴望|姐妹们快|牛奶|牛肉|羊肉|来伊份岩烧|来伊份面包|烤箱|生鲜|螺蛳粉|米诺|果酸|杏仁酸|鸡蛋|大米|薅|cr海盐|洗头膏|崔娅蓬松|洗鼻|橙
          filterout_title: 求|转|求购|交流|已购|专楼|蒙牛|伊利|讨论|华为|停车|代拍|完|分装|意向|拼单|删|一元
jobs:
  ifttt:
    name: Make a Request to telegram
    runs-on: ubuntu-latest
    steps:
      - name: Send a telegram message
        uses: appleboy/telegram-action@v0.1.0
        with:
          to: ${{ secrets.TELEGRAM_TO }}
          token: ${{ secrets.TELEGRAM_TOKEN }}
          message: |
            <b>${{ on.rsshub.outputs.title}}</b>
            <a href="${{on.rsshub.outputs.link}}">${{on.rsshub.outputs.description}}</a>
          format: html
          disable_web_page_preview: true
```

> 配置来自[这里](https://github.com/theowenyoung/actionsflow-workflow/blob/main/workflows/rsshub.yml)

接下来介绍下如何部署：）

> 因为 rsshub 这个 trigger 没有内置在 Actionsflow 里，所以按照官方的教程初始化之后，需要主动安装下[@actionsflow/trigger-rsshub](https://github.com/theowenyoung/actionsflow-trigger-rsshub)这个 trigger

1.  使用这个[链接](https://github.com/actionsflow/actionsflow-workflow-default/generate)用 Actionsflow 的默认模板创建一个新的 GitHub 项目，一个典型的 Actionsflow 项目长这样：

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

1.  clone 你刚创建的项目到本地

    ```bash
    git clone git@github.com:<your-github-username>/<repo-name>
    ```

1.  在本地编辑 `.github/workflows/actionsflow.yml` 文件，取消`schedule`的注释

1.  安装[@actionsflow/trigger-rsshub](https://github.com/theowenyoung/actionsflow-trigger-rsshub)

    ```bash
    npm i @actionsflow/trigger-rsshub
    ```

1.  在`workflows/`文件夹创建你自己的 workflow 文件

    > workflow 的写法和 rsshub trigger 的用法清参考官方文档[Actionsflow Workflow Syntax](https://actionsflow.github.io/docs/workflow/), [Actionsflow rsshub trigger](https://github.com/theowenyoung/actionsflow-trigger-rsshub)

    > 可以参考[这里](https://actionsflow.github.io/docs/actions/)列出的 常用 Github Action，以及这个[Actionsflow 的 Awesome 项目](https://github.com/actionsflow/awesome-actionsflow)

    示例(`/workflow/rsshub.yml`)：

    ```yaml
    on:
      rsshub:
        path: /smzdm/keyword/女装
    jobs:
      print:
        name: Print
        runs-on: ubuntu-latest
        steps:
          - name: Print Outputs
            env:
              title: ${{on.rsshub.outputs.title}}
              description: ${{on.rsshub.outputs.description}}
              link: ${{on.rsshub.outputs.link}}
            run: |
              echo title: $title
              echo description: $description
              echo link: $link
    ```

1.  保存并提交你的文件到 Github

> 如果你想本地测试的话，需要先安装[Docker](https://docs.docker.com/get-docker/), 并运行 `npm run start`
