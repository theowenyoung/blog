---
title: 把博客变成一本可离线下载的电子书
date: 2022-10-14T16:21:29+08:00
updated: 2022-10-14
draft: false
taxonomies:
  categories:
    - Random
  tags:
    - Random Book
    - Blog
---

记得之前看到过一篇文章，讲的是如何在死后保持自己的个人网站一直在线，文章地址我忘记存了，只记得文章里分析了各种选项，比如靠死后的信托基金什么的，都是些让我听的一愣一愣的选项，因为既不懂什么是信托，也不懂什么是基金。不过即使如此，那篇文章的最终结论依然是很难保证个人网站在死后长期在线。因为单就域名来说，每次续期的最长期限就是10年，如果我死了，并且我有子女，幸运的话他们可以帮我续费几十年，之后的子孙后代就很难说。整个互联网发明也才不过几十年，还没有人有足够的经验能预测这件事，而且照人类这个活法，指不定哪一天就先毁灭了自己。

<!-- more -->

再说回网站，如果你的个人网站还不幸是个动态网站的话，那死后的可维护性就更难了。不能指望自己的孙子刚好也懂PHP吧。

所以一个相对比较可行的办法，至少是使用静态网站，因为静态网页的托管足够简单，成本低，很多大公司都有免费方案。假如我相信 Github
在我死后不会倒闭，那我可以选择把静态网站免费托管到Github上，然后祈祷Github静态网站托管的免费政策不要发生变化，同时也希望我不要意外死亡，以便我可以在死前几个月将我的个人网站的域名，301永久跳转到`theowenyoung.github.io`的子域名上，同时把旧的个人域名续期10年，以便所有（机器）人有充足的时间切换到新的子域名。

上述方案的核心就是寄希望于 Github 不要倒闭，如果我死后有在天之灵的话，我当然会保佑Github
基业长青，但是如果我的修行不够，那也许死后在另一世界自身都难保呢，何谈保佑 Github 呐。

所以啊，想要不依赖第三方服务，还是得能做到离线化才行。按理说目前的博客已经是离线化的了，比如你可以`git clone git@github.com:theowenyoung/blog.git`这个博客的源文件到本地，然后执行`make install`,
`make serve`就可以本地离线查看了，但是这就引入了额外的复杂性，很少有人真的乐意做这件事。一个折衷的办法是在构建静态博客的时候，同时也把整个博客打包成一本电子书供读者下载，这样的话，别人本地就有了一个很方便的备份，相当于是一种去中心化的分发。epub和pdf格式是其中两种很方便、也很通用的格式，甚至可以嘱咐家人在我死后把这本书放在区块链上（如果他们会的话！），甚至可以打印出来，装订成册，埋在北极的冻土层里，比区块链还保险。

听前面这段话，会感觉我这人真是天大的自恋狂，我的破博客能有多么的重要以至于死后都要保持在线。其实不然，真实情况恰恰相反，我博客的内容十分肤浅，我要是死了，我恨不得永久抹除这些让人尴尬的文字呢，所以我怎么会想让这种东西永久在线呢！

所以这只是概念验证，也许能提醒某个真正有东西的博主开始考虑用持续集成把自己的博客打包成一本电子书。而我明天则要找时间研究下，如何让谷歌在我死后删除有关我的所有结果。

## 具体方案

**注意：我的最终方案和与我的博客本身非常耦合，并不具备普遍性，所以这不是一个教程，只是一个实现的参考。**

我以为这种需求很常见，应该能很快找到成熟方案，但是竟然没找到什么特别成熟的方案，看到一个[bookdown](https://github.com/rstudio/bookdown)的方案，但是真的看不懂，不懂什么是RMarkdown,
然后还被[它的说明](https://bookdown.org/yihui/bookdown/get-started.html)
里让我下载个IDE才能运行的要求吓到。

最后我用了 rust 的 [mdbook](https://github.com/rust-lang/mdBook) ,同时配合插件
[mdbook-epub](https://github.com/Michael-F-Bryan/mdbook-epub),
[mdbook-pdf](https://github.com/HollowMan6/mdbook-pdf)生成epub和pdf，再加上自己写了一个[deno 脚本](https://github.com/theowenyoung/blog/blob/main/book/build.ts)去过滤/组织博客的文档，以及替换markdown的内部链接等等。当博客更新的时候，用[github workflow](https://github.com/theowenyoung/blog/blob/main/.github/workflows/build-book.yml)去打包最新的电子书并上传。

最终的成果是生成2本电子书：

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

第二本电子书由于包含全站文章（以及图片），size有点大，epub版本目前是30M，pdf版本是38M，所以没有上传到我的静态网站上（cloudflare最多允许25MB的静态资源文件），而是用[Github Actions](https://github.com/theowenyoung/blog/blob/6e033fff7bd4f23418b9502106d226e2a2306d6f/.github/workflows/build-book.yml#L50-L61)
生成了一个Github的[release 资源](https://github.com/theowenyoung/blog/releases/tag/book)。

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

一套弄下来，比我想象的工作量要大，主要是要处理一些边缘情况，但是我最喜欢deno的一点，就是我能在一个[脚本文件](https://github.com/theowenyoung/blog/blob/main/book/build.ts)内完成所有的处理。

[mdbook](https://github.com/rust-lang/mdBook) 要求markdown的文件为如下格式：

```
# Title

Body.
```

本质就是纯markdown文件，而[zola](https://www.getzola.org/)的markdown格式是有frontmatter的：

```
---
title: Title
date: 2022-10-11
---

Body.
```

这个在Deno里比较好处理，官方的std直接就提供了frontmatter的解析：

```typescript
import { extract } from "https://deno.land/std@0.159.0/encoding/front_matter.ts";
```

另外一个要处理的是内部链接问题。各种静态网站生成器对于内部链接的处理都有微小的差别，有的支持相对链接，有的支持project内的绝对链接，我觉得这种差异对我们迁移到不同的静态博客生成器很麻烦，最理想的情况是使用相对链接，在markdown文件内通过相对链接引用`../xxx.md`,转化成html后，再由引擎转化为对应的网页链接。对于图片资源，理想的方案是都放在markdown文件的同级目录下，假如markdonw文件位于
`xxxx/index.md`,
那这篇文章引用的图片资源就应该位于`xxxx/xxx.png`,这样对程序处理起来更简单，同时作者也能在一个文件夹内维护相关的东西。还有一种边缘情况是，假如一篇文章，我一开始没有图片资源，所以我新建了`foo.md`来存放它。但是后来我想把链接一些图片，那我会希望把md文件的路径改为`foo/index.md`，然后图片资源就可以放在这个文件夹下，同时网页地址保持不变。

mdbook对内部链接的处理是直接替换`.md` 到 `.html`， 比如对于`foo.md`文件,生成后的html网页地址就是`foo.html`,
这样对于生成器来说简化了很多复杂性，缺点是生成的html网页地址用户不友好，用户必须键入`foo.html`来访问该网页，而不是更友好的`/foo/`.
但是mdbook的目标用户不是静态博客，而是网络小书，所以其中章节的链接友好不友好并不是很重要。

Zola对于[内部链接](https://www.getzola.org/documentation/content/linking/)的处理是引入`@`特殊标记，用`@/xxx.md`来表示内部链接，这种做法的优点是简化内部链接逻辑的复杂性，但是缺点是在本地文件编辑的时候很难导航到引用的文件，我真的很不喜欢zola的这一点（但我喜欢其他所有），所以我使用自己fork的[zola版本](https://github.com/theowenyoung/zola)，把`@`标识改为`/content`,
这样本地编辑器和github都都能在markdown文件之间正常跳转了。同时这种统一的内部链接风格也让我比较好处理各种边缘情况，我只需要把它转化为mdbook的链接风格即可，也就是从`/content/xxx.md`转为`./xxx.html`.

我很喜欢用 [mdast](https://github.com/syntax-tree/mdast) 相关的工具去处理 markdown
的解析和修改，mdast 相关的工具链对 Deno 也有良好的支持。主要就是引入以下lib：

```typescript
import { toMarkdown } from "https://esm.sh/mdast-util-to-markdown@1.3.0";
import { fromMarkdown } from "https://esm.sh/mdast-util-from-markdown@1.2.0";
import { visit } from "https://esm.sh/unist-util-visit@4.1.1";
```

链接处理的代码部分见[这里](https://github.com/theowenyoung/blog/blob/6e033fff7bd4f23418b9502106d226e2a2306d6f/book/build.ts#L576-L619)

处理完后就可以生成mdbook需要的markdown文件了，然后就可以调用mdbook的相关命令来生成对应的 html, epub,
pdf了，具体的mdbook配置如下：

```toml
[book]
title = "Owen博客节选"
description = "Owen的博客节选电子书版"
src = "content"
language = "zh"
authors = ["Owen Young"]

[output.html]
git-repository-url = "https://github.com/theowenyoung/blog"
edit-url-template = "https://github.com/theowenyoung/blog/edit/main/{path}"

[output.html.search]
enable = false

[output.markdown]
enable = true

[output.epub]
cover-image = "cover.jpg"
use-default-css = false

[output.pdf]
enable = true
```

可以在<https://orly.nanmu.me/>中生成一个 o'rly 风格的封面。

dist构建完毕后，再使用Github Workflow把生成的东西上传到release的附件里，同时也把生成的html版本发布到Cloudflare
的page里：

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
- name: Publish
  uses: cloudflare/pages-action@1
  with:
    apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
    accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
    projectName: book # e.g. 'my-project'
    directory: ./owen-blog-dist # e.g. 'dist'
    gitHubToken: ${{ secrets.GITHUB_TOKEN }}
- name: Publish Archive
  uses: cloudflare/pages-action@1
  with:
    apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
    accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
    projectName: archive-book # e.g. 'my-project'
    directory: ./book-dist/owen-blog-archive/book/html # e.g. 'dist'
    gitHubToken: ${{ secrets.GITHUB_TOKEN }}
```

至此，此博客的电子书版就会实时生成了。而我也终于能放下担子，不用担心死后保佑Github基业长青的问题了。

你可以使用如下链接体验：

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
