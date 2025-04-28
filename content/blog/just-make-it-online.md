---
title: Fuck it，直接上线就好，不要执着于完美了
date: 2022-10-30T19:17:20+08:00
updated: 2022-10-30
draft: false
taxonomies:
  categories:
    - Random
  tags:
    - Track Awesome List
    - Random Book
---

前两天在推上看到这么[一句话](https://twitter.com/UselessIdeasBot/status/1586134491260747778):

> 任何一项大工程（修房子、拍电影、开发 app）完成度为 90% 的时候，你都要做好心理准备：剩余的大量细节工作会占掉你另一段与之前相当的时间。

一周前， 在 HN 上刷到[这样一个帖子](https://news.ycombinator.com/item?id=33303269):

> Tell HN: 我厌倦了成为一个完美主义者，所以我在 24 小时内建立了一个应用程序

今天又看到这篇文章[学会完成事情](https://www.boristhebrave.com/2022/09/14/learning-to-finish-things/)，也说出了我的心声：

> “为什么为老板工作的时候总能完成事情，但是自己做业余项目的时候就经常无疾而终呢？”

这些帖子对我触动挺大的，我一直以来都是一个完美主义者，每次都要把东西搞到让自己满意才最终上线，结果就是有不少项目都做到了 90%，最后却不了了之。我决定以后做项目一定要尽早的上线，然后在线上进行迭代，这样其实才是最理想的状态。

对于博客我已经这么做了，我最近一个月一直在博客上更新自己阅读后觉得[还不错的文章](https://www.owenyoung.com/categories/journal/), 每篇里面大概 3-5 篇链接，这就是一篇博文了。也不给社交网络推送，就自己的博客里发，有一天没一天的，但是没有压力，不会感到博文必须要很长才能发的压力。同时这也是一个重要的笔记，可以供以后参考。

刚好最近一个月我都在断断续续的重写 [Track Awesome List](https://www.trackawesomelist.com), 这是一个追踪 Github 上好几百个[Awesome](https://github.com/topics/awesome)
列表更新的网站。为什么会有这个需求呢？因为所有的 awesome list 都是按照分类组织的，当你 star 之后，它的更新其实很难被追踪，除非你愿意去对比 commit 的历史记录，我相信这不是一个愉快的工作。所以，我在 2 年前就做了一个简单的网站，通过分析那些 awesome 项目的历史提交记录，然后生成一个按照日/周倒序的页面，比如我经常查看[Free for Dev](https://www.trackawesomelist.com/ripienaar/free-for-dev/) 和 [Awesome self-hosted](https://www.trackawesomelist.com/awesome-selfhosted/awesome-selfhosted/)的最新项目。

<!-- more -->

这个项目目前的状态就是 90%的程度，由于要面对一系列上线前的任务，比如持续部署，验证 rss，重新调整自动推文机器人，以及 UI 方面我也不喜欢，等等一些琐碎的事情，导致最近我一直在拖延进入这个项目，然后就刷到那个推，当即决定，fuck it，先上线再说，反正只是一个免费项目。所以[Track Awesome List](https://www.trackawesomelist.com/)的新版现在已经在线上了。

为什么要重写呢？简单来讲就是之前写的东西太混乱了，运行一次经常要 2 小时以上，包括克隆 600 多个 awesome 库，分析文件的历史修改记录，最后还有构建一个超大的静态网站，而且，要命的是我还是用[Gatsby](https://www.gatsbyjs.com/)作为框架构建的网站，光是 build 和发布静态网站就要 40 多分钟。我一直很佩服建筑师们，为什么我建造一个网站，至少需要来回重写 3 次才能让自己满意，建筑师们是怎么造房子的？造完就能住 70 年。可能这就是人家行业要考证的原因吧。

我在之前用 Deno[成功重写](https://www.owenyoung.com/blog/new-buzzing/)了[Buzzing](https://www.buzzing.cc), 这让我对用 deno 重写 trackawesomelist 产生了信心，我决定重新设计 trackawesomelist 的更新和构建步骤，让整个静态网站能够增量构建，而不是像之前一样每次都全量构建，我决定自己用数据库（我用的是 json 文件）储存项目的更新时间，而不是像之前那样，每次都克隆整个项目分析时间，有一些项目是也是自动化生成的，像之前那样，我是无法追踪他的更新的，因为他是自动生成的，条目内容每天都变，所以每个条目都是最新的。这一次我选择自己维护项目的更新时间，这样就能把那些自动生成的项目也纳入进来了,数据结构长这样：

```json
{
  "1d7e8a1b66a19880f5d9f1001a3fd9d794632d27": {
    "category": "Subjects / Computer Science",
    "category_html": "<p>Subjects / Computer Science</p>\n",
    "updated_at": "2015-05-16T04:16:50.000Z",
    "source_identifier": "44bits/awesome-opensource-documents",
    "file": "README.md",
    "markdown": "*   [Crypto 101 (⭐2.8k)](https://github.com/crypto101/book) ([Site](https://www.crypto101.io/), cc-nc) - the introductory book on cryptography",
    "html": "<ul>\n<li><a href=\"https://github.com/crypto101/book\" rel=\"noopener noreferrer\">Crypto 101 (⭐2.8k)</a> (<a href=\"https://www.crypto101.io/\" rel=\"noopener noreferrer\">Site</a>, cc-nc) - the introductory book on cryptography</li>\n</ul>\n",
    "sha1": "1d7e8a1b66a19880f5d9f1001a3fd9d794632d27",
    "checked_at": "2022-10-24T22:56:46.641Z",
    "updated_day": 20150516,
    "updated_week": 201520
  }
}
```

`sha1`是每一条 awesome 项目的 list item 里的链接，用这个作为唯一值去监控后续的更新。更多源码，我已经放在[Github](https://github.com/trackawesomelist/trackawesomelist-source)上了，感兴趣可以查看。

本次更新一个是全面优化了构建过程，现在构建全站需要 10 分钟左右，对比之前用 Gatsby 要 40 多分钟，大概 13000 多页面，我生成了每个项目[按日](https://www.trackawesomelist.com/ripienaar/free-for-dev/)，[按周](https://www.trackawesomelist.com/ripienaar/free-for-dev/week/)，以及 [Overview 页面](https://www.trackawesomelist.com/ripienaar/free-for-dev/readme/)，以及[每一天更新的项目内容页面](https://www.trackawesomelist.com/2022/10/17/)，还有[每周的项目更新页面](https://www.trackawesomelist.com/2022/39/),以及每个项目都有一个自己的[rss](https://www.trackawesomelist.com/ripienaar/free-for-dev/rss.xml)源，还有[jsonfeed](https://www.trackawesomelist.com/dustinspecker/awesome-eslint/feed.json)源，并且全部页面都生成了[Markdown](https://github.com/trackawesomelist/trackawesomelist)源文件，这让 Track Awesome List 项目与其他 awesome list 风格更接近。

第二是增加了[搜索页面](https://www.trackawesomelist.com/search/), 最近发现了一个[本地 wasm 搜索的库 Morsels](https://github.com/ang-zeyu/morsels)，就在这里试用上了，全站的索引文件压缩后大概 4M 左右，并且只在[搜索页面](https://www.trackawesomelist.com/search/)里加载，我觉得接入体验挺好的,主要就是在构建完网站后，根据这个[配置文件](https://github.com/trackawesomelist/trackawesomelist-source/blob/main/morsels_config.json)重新 build 搜索索引，然后在页面里引入相关文件即可，现在可以 trackawesomelist 里搜索它包含的全部条目了。

网站是发布在 Cloudfalre Page 上，我几乎已经把我常用的所有网站（包括博客和 buzzing 的 30 多个站点）都已经迁移到 cloudflare pages 上了，简单好用，我预计未来所有的静态网站都会在其上面构建。和 Github Actions 配合简直天衣无缝，基本上用以下命令就把网站发布出去了：

```yaml
- name: Publish pages
  if: true
  run: wrangler pages publish prod-db/public --project-name trackawesomelist
  env:
    CLOUDFLARE_ACCOUNT_ID: ${{secrets.CLOUDFLARE_ACCOUNT_ID}}
    CLOUDFLARE_API_TOKEN: ${{secrets.CLOUDFLARE_API_TOKEN}}
```

你可以查看[trackaweosmlist 的构建流程](https://github.com/trackawesomelist/trackawesomelist-source/blob/main/.github/workflows/cron.yml)。

## 总结

Fuck it, 真的不要再执着于完美了，直接上线，心情好多了。
