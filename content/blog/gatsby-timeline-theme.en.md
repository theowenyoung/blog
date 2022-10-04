---
title: A new Gatsby theme [Timeline] - Show your all posts, tweets, instagram posts into one
date: 2021-01-29
updated: 2022-03-29
taxonomies:
  categories:
    - Random
  tags:
    - Theme
extra:
  image: https://i.imgur.com/LI3xVu0.png
---

Don't you think there are too many different personal profile for us? Like twitter, instagram, facebook, blog, etc, So do I, I suppose there is an elegant site to show all my creative work, that's the new gatsby theme [Timeline](https://github.com/theowenyoung/gatsby-theme-timeline), a [Gatsby](https://www.gatsbyjs.com/) theme, you can use it to show your all posts, tweets, instagram posts etc into one blog. In my opinion, this is a real personal home.

Checkout my blog: https://blog.owenyoung.com/

[Source Repo](https://github.com/theowenyoung/gatsby-theme-timeline)

[Live Demo](https://gatsby-theme-timeline.owenyoung.com/)

<!-- more -->

![Screen](https://camo.githubusercontent.com/b3a1a92a41a81707b6690eb4710194e5d6e79895082e329d9d3bfe35944c0207/68747470733a2f2f692e696d6775722e636f6d2f367949544934452e706e67)

Here are the features for now:

- Support markdown, tweet, instagram posts, youtube videos, hacker news, reddit post
- Support i18n by [gatsby-theme-i18n](https://www.gatsbyjs.com/plugins/gatsby-theme-i18n/), you can choose your own [i18n library](https://github.com/gatsbyjs/themes/tree/master/packages)
- Support comments platform [disqus](https://disqus.com/) or [utterances](https://utteranc.es/)
- Support Tags
- Pagination, even tag pages support pagination
- SEO Optimization

Just start a new blog for yourself:

```bash
gatsby new my-themed-blog https://github.com/theowenyoung/gatsby-starter-timeline
```

> For more about installation please see [here](https://github.com/theowenyoung/gatsby-theme-timeline/tree/main/packages/gatsby-theme-timeline#installation)

## Note

In the starter demo, I use two gatsby plugins [gatsby-source-twitter](https://github.com/G100g/gatsby-source-twitter) and [gatsby-source-instagram](https://github.com/theowenyoung/gatsby-source-instagram) as the blog's sources. But in [my blog](https://blog.owenyoung.com), I use [Actionsflow](https://github.com/actionsflow/actionsflow) to get my tweets, instagram data, sync the JSON file to [my content source repository](https://github.com/theowenyoung/story) ((Why Actionsflow? For more stably, and I can store all my creative work into one)), and [site repository](https://github.com/theowenyoung/theowenyoung.github.io) use plugin [gatsby-source-git](https://github.com/theowenyoung/gatsby-source-git) to sync those data, and my markdown posts, for more tech stack, you can see [How I Built my Blog?](https://blog.owenyoung.com/en/posts/how-i-built-my-blog/)

> Disclaimer: I made the [Actionsflow](https://github.com/actionsflow/actionsflow) :)
