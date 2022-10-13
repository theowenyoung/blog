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

有一次看到一篇文章探讨如何在死后保持自己的个人网站一直在线，我记得文章里分析了各种选项，什么信托基金什么的，总之，最后的结论是很难保证个人网站在死后长期在线。因为单就域名来说，每次续期最长期限是10年，如果我死了，再假设我有子女，再假设我的子女愿意帮我续费几十年，那我的孙子，或者更后面的子孙还愿意一直帮我续费域名吗？如果再加上网站的维护就更难了。

<!-- more -->

一个相对比较可行的办法是使用静态网站，因为托管足够简单，有很多大公司的免费方案可以使用。假如我相信 Github
在我死后不会倒闭，那我可以把静态网站免费托管到Github上，然后祈祷Github静态网站托管的免费政策不要变化，同时我也希望我不要意外死亡，以便我可以在死前几个月将我的个人域名301永久跳转到`theowenyoung.github.io`的子域名上，同时原个人域名在10年内保持在线。

上述方案就是把全部希望寄予 Github 上，如果我死后有在天之灵的话，我当然会保佑Github
不要倒闭，但是如果我的修行不够，死后无力庇佑Github的繁荣呢？

我能想到一个替代办法是构建静态博客的时候，同时也构建一本电子书，包括 epub版本和pdf版本，这样的话，也许在死后还能打印成一本实体书，成为真正的遗产呢。

我以为能很快找到方案，但是竟然没找到特别成熟的方案，最后用[mdbook](https://github.com/rust-lang/mdBook),
[mdbook-epub](https://github.com/Michael-F-Bryan/mdbook-epub),
[mdbook-pdf](https://github.com/HollowMan6/mdbook-pdf),以及自己写了一个[deno 脚本](https://github.com/theowenyoung/blog/blob/main/book/build.ts)去过滤博客的文档，以及替换内部链接等,然后当博客更新的时候，用[github workflow](https://github.com/theowenyoung/blog/blob/main/.github/workflows/build-book.yml)去构建最新的电子书并上传。

最终的成果我放在<https://book.owenyoung.com/>了，我对收录的文章做了一些筛选，电子书不适合放大量图片，所以就没有收录包括有多张图片的文章。

你可以下载这本电子书的[epub版本](https://book.owenyoung.com/owen-blog.epub)，[pdf版本](https://book.owenyoung.com/owen-blog.pdf)或者[html压缩包](https://book.owenyoung.com/owen-blog-html.zip)
