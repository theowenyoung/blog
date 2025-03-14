---
title: Zola 博客的中文阅读时间预估误差很大，所以我做了一个修复
date: 2022-07-12T21:11:21+08:00
updated: 2022-07-12
draft: false
taxonomies:
  categories:
    - Random
  tags:
    - Zola
    - About
---

我发现 Zola 给中文文章的阅读时间预估特别高，比如我刚发布的这篇[给 Zola 博客增加搜索功能](@/blog/add-search/index.md), 显示要 20 分钟才能阅读完:

> 发布于: 2022-07-12 · 最后更新时间: 2022-07-12 · 阅读时间: 20 min

我就纳闷我这是写了一篇 essay 吗，于是就是查它的[实现](https://github.com/getzola/zola/blob/39cf436b1174a3d5f2fbe4bac20e942795005f05/components/content/src/utils.rs#L55-L61), 发现实现很简单，就是基于 unicode 字符除以了一个数：

<!-- more -->

```rust
/// Get word count and estimated reading time
pub fn get_reading_analytics(content: &str) -> (usize, usize) {
    let word_count: usize = content.unicode_words().count();
    (word_count, ((word_count + 199) / 200))
}
```

然后他在注释里链接了这个数字的[来源](https://help.medium.com/hc/en-us/articles/214991667-Read-time)，证明它不是拍脑袋决定的, 来源是 [Medium](https://medium.com/) 的文档：

> Read time is based on the average reading speed of an adult (roughly 265 WPM). We take the total word count of a post and translate it into minutes, with an adjustment made for images. For posts in Chinese, Japanese and Korean, it's a function of number of characters (500 characters/min) with an adjustment made for images.

这篇文档说英文这类字符大约是 265 个单词每分钟，中日韩这类文字是 500 个字符每分钟，所以对于中文来讲，zola 这个计算是有大约 1 倍的误差的，所以我加了一个判断：

```html
{% macro get_reading_time(minutes) %} {% if lang=="zh" %} {{ minutes/1.88 |
round }} {% else %} {{ minutes }} {% endif %} {% endmacro get_reading_time %}
```

然后在`page.html`里可以这样调用：

```html
{{ macro::get_reading_time(minutes=page.reading_time) }}
```

这样应该就能修正中文的预估时间了。修正后，开头提到的文章现在预估时间大约是 11 分钟，比较合理了。
