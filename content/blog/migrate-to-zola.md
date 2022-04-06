---
title: 迁移博客和Wiki到 Zola
date: 2022-04-06
updated: 2022-04-06
draft: false
taxonomies:
  categories:
    - Misc
---

我在之前建立了一个个人的公开 [Wiki](https://wiki.owenyoung.com/)和 [Blog](https://blog.owenyoung.com/)，这让我养成了记笔记，多写东西的习惯。但是随着时间的增长，我感到维护 2 个 repo 实在有点麻烦，并且由于 Wiki 和博客都是基于[Gatsby 框架](/content/blog/gatsby-cons.md)的，更新，维护，还有编译都挺花时间的。

总的来说就是太复杂了，而由于我对自己的[笔记/博客系统](/content/blog/about-notes/index.md)是以一生的尺度去设计和维护的，所以我想让它保持简单。

<!-- more -->

**所以这个博客现在拥有了以下特性：**

## 特性

- 由[单一的二进制文件](https://github.com/theowenyoung/blog/tree/main/bin)驱动（为了更简单，我把那个二进制文件直接放在这个 [repo](https://github.com/theowenyoung/blog) 里了，所以这个博客相当于是自运行的，不依赖任何外部环境）
- 所以这个博客实际上是由[Zola](https://www.getzola.org/)驱动的，Zola 是用 Rust 写的，非常快，目前我的博客在 Github Actions 里从开始到部署完成只需要[14s](https://github.com/theowenyoung/blog/runs/5845460900?check_suite_focus=true)，实际构建时间只需要 2s。对比之前的 Wiki 站点总共需要[4 分钟](https://github.com/theowenyoung/wiki/runs/5684155852?check_suite_focus=true),Blog 站点总共要[3m 37s](https://github.com/theowenyoung/theowenyoung.github.io/runs/5845524376?check_suite_focus=true)
- 所有的样式都是[一个简单的 CSS 文件里](https://github.com/theowenyoung/blog/blob/main/static/site/styles/site.css)，全是手写的。保持样式文件的简单有助于后续的持续维护。
- [同时支持](https://www.owenyoung.com/) [普通文章](https://www.owenyoung.com/blog/)，[笔记](https://www.owenyoung.com/categories/notes/)，和[短想法](https://www.owenyoung.com/thoughts/)，但是也都只是[一个个的 Markdown 文件](https://github.com/theowenyoung/blog/tree/main/content)

## 对 Zola 不满意的点

Zola 有一些约束和约定俗成的东西，大多数是比较深思熟虑的限制，我最苦恼的一点就是他不支持把 Markdown 里的相对链接转成 html 的链接。相对链接这一点的限制其实是合理的，我以前写过[Gatsby 的插件](https://github.com/theowenyoung/gatsby-theme-primer-wiki/tree/main/gatsby-relative-path-to-slug)去分析相对链接，但是逻辑其实很恶心，而且并不能满足所有情况。所以，[Zola 的办法简单粗暴](https://www.getzola.org/documentation/content/linking/#internal-links)，就是只替换包换特殊符号的链接`@/xxx.md`，把这类链接统一替换成`/xxx/`.

但是这样的话，本地文件系统的相互链接就不工作了,这很令人苦恼。我就这个问题在 Zola 的论坛提了[一个替代办法](https://zola.discourse.group/t/custom-content-dir-or-support-absolute-internal-link/1242)，主要就是不用`@`做为特殊符号，直接用`/content`作为特殊符号，这样本地链接里是内部绝对链接，大概是这样：`/content/xxx.md`，Zola 还没接受我的请求，所以我[改动了 Zola 的代码，改动很少，就几行](https://github.com/theowenyoung/zola), 现在我可以用 `/content/xxx.md`的形式作为内部链接。

## 如何编辑

在编辑方面，我在使用[VSCode](https://code.visualstudio.com/)配合我开发的[Markdown 输入插件 Foam Lite](https://marketplace.visualstudio.com/items?itemName=theowenyoung.foam-lite-vscode)来编辑这个博客的所有内容。我更喜欢文本辅助输入工具，而不希望软件修改我的原文数据格式。这让我更有掌控感以及不被运营商锁定。

试过[Obsidian](https://obsidian.md/)几次，很喜欢他的一些实用的功能，但是发现他的性能还是和 VS Code 差很多的。所以还是用回了 VSCode，然后把最需要的 Obsidian 功能：快捷输入内部文档的 Markdown 链接，改写了一个 VSCode 插件[Foam Lite](https://marketplace.visualstudio.com/items?itemName=theowenyoung.foam-lite-vscode)解决了。

这个插件目前只拥有 2 个功能，一个是快捷生成内部链接的地址：

![](https://i.imgur.com/sYmKeKO.gif)

另一个就是快速从模版生成初始文章。
