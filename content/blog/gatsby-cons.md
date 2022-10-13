---
title: Gatsby框架的缺点
date: 2022-03-08
updated: 2022-03-10
taxonomies:
  categories:
    - Random
  tags:
    - Javascript
    - Gastby
    - Random Book
---

[Gatsby.js](https://www.gatsbyjs.com/)是一个基于 React 生成静态网站的工具链，也称为静态网站生成器(SSG),
旨在让开发人员使用基于 [React](https://reactjs.org/) 的框架和基于 [Gaphql](https://graphql.org/)
的数据层去构建快速、安全且功能强大的网站，从而将不同的内容、API 和服务生成一个体验良好的静态网站。

<!-- more -->

我第一眼看到它的时候就被它简单的思想和丰富的社区生态给吸引了。总体来讲，他是一切皆 source，source 生成一个 graphql 的 API，然后在
react 组件里按需使用 graphql 的数据以生成对应的页面。

目前我的 [Wiki](https://wiki.owenyoung.com/), [Blog](https://blog.owenyoung.com/),
包括 [Buzzing](https://www.buzzing.cc/)里面的所有子攒点,
[Track Awesome List](https://www.trackawesomelist.com/)，其实都是用 Gatsby 构建的。

随着内容越来越多，以及 Gatsby 的升级，我发现在维护 Gatsby 的时候开始有点不喜欢它了。这主要是由于：

1. Gatsby 的大多数功能都是通过插件提供，导致项目有大量的第三方依赖（也有很多是官方维护的插件），而 Nodejs
   的`package-lock.json`总是在升级的时候搞错一些版本，让我很抓狂（我不确定这个问题有没有得到解决），对于多依赖项目，我经常需要删掉整个
   lock 文件，然后重新生成新的 lock 索引。
2. 大量的第三方插件维护的质量参差不齐，维护不足。这其实很正常，我自己也维护了一个[国际化翻译的 Gatsby 插件](https://github.com/theowenyoung/gatsby-plugin-intl),
   但是由于后面我自己都没在用了，所以我就失去了继续维护和更新的动力了，至今还有用户在提 Issue，我只能在 Readme 里面写这个项目已经不在维护了。
3. Gatsby 目前还不支持`.mjs`,然而 gatsby
   强依赖的[unist](https://github.com/syntax-tree/unist)全生态系统都拥抱了`.mjs`,所以导致大量的
   gatsby 第三方插件只能使用旧版的 unist 生态链。升级的时候会有很多依赖只能依赖旧版本。这导致了很多的混乱。
4. Gatsby 的底层设计导致多内容处理的性能问题。Gatsby 把所有的内容都加载到 graphql
   的内存数据里，这导致了庞大的开销。在内容很多的时候，比如[Track Awesome List](https://www.trackawesomelist.com/)，每次构建需要
   40 分钟左右的时间，好在这个网站每天只需要更新 2 次。
5. Gatsby 虽然思想简单，但是其 API 现在已经变得非常庞大和复杂了，有点类似
   Webpack，一个东西只要变得如此复杂，那么后期维护一定会很痛苦。与之相对的是[11ty](https://www.11ty.dev/)的 API
   就很简单，但是也很强大。

最后，来体会一下我的项目中 Gatsby 的依赖：

```json
{
  "@emotion/react": "^11.7.1",
  "@emotion/styled": "^11.6.0",
  "@mdx-js/mdx": "^1.6.22",
  "@mdx-js/react": "^1.6.22",
  "@theme-ui/prism": "^0.13.0",
  "date-fns": "^2.28.0",
  "disqus-react": "^1.1.2",
  "gatsby-core-utils": "^3.4.0",
  "gatsby-plugin-emotion": "^7.4.0",
  "gatsby-plugin-feed": "^4.4.0",
  "gatsby-plugin-hn": "^1.0.0",
  "gatsby-plugin-image": "^2.4.0",
  "gatsby-plugin-instagram": "^1.0.0",
  "gatsby-plugin-mdx": "^3.4.0",
  "gatsby-plugin-react-helmet": "^5.4.0",
  "gatsby-plugin-sharp": "^4.4.0",
  "gatsby-plugin-theme-ui": "^0.13.0",
  "gatsby-plugin-twitter": "^4.4.0",
  "gatsby-remark-copy-linked-files": "^5.4.0",
  "gatsby-remark-images": "^6.4.0",
  "gatsby-remark-smartypants": "^5.4.0",
  "gatsby-theme-i18n": "^3.0.0",
  "gatsby-theme-ui-preset": "^3.0.0",
  "gatsby-theme-ui-timeline-preset": "^3.0.1",
  "gatsby-transformer-json": "^4.4.0",
  "gatsby-transformer-sharp": "^4.4.0",
  "html-to-text": "^8.1.0",
  "mdx-utils": "^0.2.0",
  "path-browserify": "^1.0.1",
  "react-helmet": "^6.1.0",
  "react-player": "^2.9.0",
  "react-process-string": "^1.2.0",
  "react-twemoji": "^0.3.0",
  "react-ultimate-pagination": "^1.2.0",
  "remark-slug": "^5.1.2",
  "theme-ui": "^0.13.0",
  "url-join": "^4.0.1"
}
```
