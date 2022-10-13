---
title: 把博客变成一本可离线下载的电子书
date: 2022-10-13T21:21:29+08:00
updated: 2022-10-13
draft: true
taxonomies:
  categories:
    - Random
  tags:
    - Random Book
    - Blog
---

记得之前看到过一篇文章，讲的是如何在死后保持自己的个人网站一直在线，文章地址我忘记存了，只记得文章里分析了各种选项，比如靠死后的信托基金什么的，都是写让我听的一愣一愣的选项，而我既不懂什么是信托，也不懂什么是基金。不过，即使如此，那篇文章最后的结论依然是很难保证个人网站在死后长期在线。因为单就域名来说，每次续期的最长期限是10年，如果我死了，并且我有子女，并且我的子女愿意帮我续费几十年，那我的孙子，以及更后面的子孙后代还愿意一直帮我续费域名吗？整个互联网发明也才不过几十年，还没有人有足够的经验能预测这件事，而且照人类这个活法，指不定哪一天就先毁灭了自己。

<!-- more -->

说回网站，如果你的个人网站不幸还是个动态网站，那死后的可维护性就更难了。

一个相对比较可行的办法至少是使用静态网站，因为静态网页的托管足够简单，成本低，很多大公司都有免费方案。假如我相信 Github
在我死后不会倒闭，那我可以选择把静态网站免费托管到Github上，然后祈祷Github静态网站托管的免费政策不要变化，同时也希望我不要意外死亡，以便我可以在死前几个月将我的个人网站的域名，301永久跳转到`theowenyoung.github.io`的子域名上，同时旧的个人域名续期10年，给所有人足够的时候切换到新的子域名。

上述方案的核心就是寄希望于 Github 不要倒闭，如果我死后有在天之灵的话，我当然会保佑Github
基业长青，但是如果我的修行不够，也许死后在另一世界都自身难保呢，何谈保佑 Github 呐。

想要不依赖第三方变量？那我们可以在构建静态博客的时候，同时把整个博客打包成一本电子书供读者下载，这样的话，别人本地就有了备份，相当于是一种去中心化的分发，我们可以把博客打包成epub和pdf格式，这是两种很方便、很通用的格式，甚至可以嘱咐家人在我死后把这本书放在区块链上（如果他们会的话！），甚至可以打印出来，装订成册，埋在北极的冻土层里，比区块链还保险。

听前面这段话，仿佛我的博客有多么的重要以至于死后都要保持在线。其实不然，实际情况恰恰相反，我博客的内容十分肤浅，我其实恨不得死后永久抹除掉这些让人尴尬的文字，我明天要找时间研究下如何让谷歌在我死后删除有关我的所有结果。所以我怎么会想让这种东西永久在线呢！

所以这只是概念验证，也许能提醒某个真正有东西的博主开始考虑持续集成，打包自己的博客。

## 具体方案

我以为这种需求很常见，应该能很快找到成熟方案，但是竟然没找到什么特别成熟的方案，看到一个[bookdown](https://github.com/rstudio/bookdown)的方案，但是真的看不懂，不懂什么是RMarkdown,
然后在[说明里](https://bookdown.org/yihui/bookdown/get-started.html) 让我下载个IDE? 有被吓到。

最后我用了rust的[mdbook](https://github.com/rust-lang/mdBook),配合插件
[mdbook-epub](https://github.com/Michael-F-Bryan/mdbook-epub),
[mdbook-pdf](https://github.com/HollowMan6/mdbook-pdf)，再加上自己写了一个[deno 脚本](https://github.com/theowenyoung/blog/blob/main/book/build.ts)去过滤/组织博客的文档，以及替换markdown的内部链接等等。当博客更新的时候，用[github workflow](https://github.com/theowenyoung/blog/blob/main/.github/workflows/build-book.yml)去打包最新的电子书并上传。

最终的成果：

- <https://book.owenyoung.com/> - 只收录了我指定的文章
  - epub版本: <https://book.owenyoung.com/owen-blog.epub>
  - pdf版本: <https://book.owenyoung.com/owen-blog.pdf>
  - html压缩包 <https://book.owenyoung.com/owen-blog-html.zip>
- <https://archive.owenyoung.com/> - 按年份打包所有的文章
  - epub版本：<https://github.com/theowenyoung/blog/releases/download/book/owen-blog-archive.epub>
  - pdf版本:
    <https://github.com/theowenyoung/blog/releases/download/book/owen-blog-archive.pdf>
  - html压缩包
    <https://github.com/theowenyoung/blog/releases/download/book/owen-blog-archive-html.zip>

全站文章大小有点大，所以没有上传到我的静态网站上，而是用Github
Actions生成了一个Github的[release 资源](https://github.com/theowenyoung/blog/releases/tag/book)。

```yaml
- name: Update release
  uses: johnwbyrd/update-release@v1.0.0
  with:
    token: ${{ secrets.GITHUB_TOKEN }}
    release: book
    files: |
      ./owen-blog-dist/owen-blog.pdf
      ./owen-blog-dist/owen-blog-html.zip
      ./owen-blog-dist/owen-blog.epub
      ./owen-blog-archive-dist/owen-blog-archive-html.zip
      ./owen-blog-archive-dist/owen-blog-archive.pdf
      ./owen-blog-archive-dist/owen-blog-archive.epub
```

// TODO mdast，内部链接转换
