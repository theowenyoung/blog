---
title: 对“假开源”事件的反省
date: 2023-08-06T00:26:25+08:00
updated: 2023-08-06
taxonomies:
  categories:
    - Random
  tags:
    - 反省
---

前几天我从沉浸式翻译用户群得知，有一则 V2EX 上的帖子指控[沉浸式翻译](https://immersivetranslate.com/)假开源：[《10k+ star 的项目也搞假开源》](https://www.v2ex.com/t/961178)，虽然这则帖子里面也有一些情绪化发言，但是我不得不承认这是一个很有价值的帖子，实际上我从中学到了很多关于开源和各种 License 的新知识，我也很庆幸是现在学到这些，而不是更晚。

再者，当我完成这篇回应后，我突然意识到博客是一个回应此类事件的绝佳平台，博文的长度可以让你不受限制地，完整地表达你的想法，包括很多复杂，曲折的心路历程。但是如果在论坛上进行一来一回的辩论，很可能会陷入无休止的争执甚至升级为攻击。博客就不一样了，我在这里写东西非常有安全感，我愿意在这里剖析自己的问题，我会在写的时候反省自己，即使本文又臭又长，阅读时长可能超过 15 分钟，但是在这里写下的文字的确不会让我感到有压力。

我也意识到要说服一个对你持有反对观点的人非常之难，再加上帖子里用户的各种关切，又都有其合理性，所以这样就更加无法说服别人了。所以我写下这篇文章主要是做一些记录，给关心此事的人提供更多的细节，反省，解决社区里的关切，以及分享我从中学到关于开源的新认识。

<!-- more -->

> Note: 本文可能包含只有程序员才能看的懂的术语。

由于读者里可能有对开源或闭源不了解的朋友，所以我想先介绍几个概念，有些概念不同的人理解的不一样，所以我尝试询问 GPT：什么是假开源？以下是 GPT 的回答：

![](https://files.owenyoung.com/file/owen-blog/2023-08-05-163201.png)

接着我再问，如何区分开源和闭源？

![](https://files.owenyoung.com/file/owen-blog/2023-08-05-163353.png)

注意，GPT 是从理论层面回答了这两个问题， 但是 V2EX 上原帖里质疑者的主要观点是：虽然在理论层面上沉浸式翻译没有假开源（比如从未宣称自己是开源项目），但是从实际观感上，却做的“不体面”，“不道德”，容易误导不深入了解的用户，让他们以为这是开源项目。

更进一步，当我看到推上有互关好友也误以为沉浸式翻译是开源项目时，我认识到帖子里的关切是合理的。

原帖已经盖到了 [400 多楼](https://www.v2ex.com/t/961178)，全部读完会有点辛苦，但是如果你想完整地了解上下文，我建议还是[全部读完](https://www.v2ex.com/t/961178)。

在这篇文章里，我想以我的视角，对用户关切的某些操作提供更详细的细节和历史原因说明，并且对发帖人所关切的问题采用最佳实践作为解决方案。

**以下是我总结的原帖里主要关切的问题**：

> 1\. 项目的结构看起来像一个完整的开源项目，因为包括了 `Makefile` 等文件。

下图是[项目](https://github.com/immersive-translate/immersive-translate/tree/67d93220980943280288781eef7ed49ac305b7be)的目录结构：

![](https://files.owenyoung.com/file/owen-blog/2023-08-05-050734.png)

我发现好像不止一个人会用这个来判断一个项目是否为开源项目，那我觉得如果对此有争议，我很乐意移除这个`Makefile`文件或者精简这个项目的目录结构。

此外还有一些网友也补充了其他流行的闭源项目如[Obsidian](https://github.com/obsidianmd/obsidian-releases), [Clash for windows](https://github.com/Fndroid/clash_for_windows_pkg)的目录结构。我会参照这些项目重新修改 Repo 以减少任何可能的疑问。

同时我也想在这里分享一下为什么这个项目会有`Makefile`文件？

因为该项目一直以来都是沉浸式翻译官网文档的 Repo，`Makefile` 里的几个快捷命令被用于生成官网：

![](https://files.owenyoung.com/file/owen-blog/2023-08-05-051550.png)

我本人是`Makefile` 的狂热爱好者，所以我[几乎所有的项目](https://github.com/theowenyoung)都会用到`Makefile`文件，而不是 `npm run`，我甚至专门在博客里存了一份[Makfile 的初始化模版](https://www.owenyoung.com/en/blog/makefile-template/)，用于方便的为新项目创建`Makefile`文件。

所以该项目的`Makefile`文件被用于创建下图的[沉浸式翻译官网](https://web.archive.org/web/20230529012541/https://immersive-translate.owenyoung.com/)：

![](https://files.owenyoung.com/file/owen-blog/2023-08-05-052714.png)

所以，以我的视角来看，整个项目结构其实是为了服务这个官网的生成， `README.md`文件渲染的其实就是官网的首页。我用了 Rust 的 [mdbook 工具](https://rust-lang.github.io/mdBook/format/configuration/general.html)来生成官网，所以你会看到有 `book.toml`,`theme`,`custom.css` 等典型的`mdbook`文件。

但是该文档其实存放在别的 repo 也可以，很容易就能迁移走。为了减少这里的疑问，我会把整个文档迁出，然后参考其他流行闭源项目的最佳实践，只留下`README`, `dist` 等必要文件。

进度：✅ 已完成，[点此查看最新项目结构](https://github.com/immersive-translate/immersive-translate/)

> 2\. 项目的 `README` 文档，看起来像开源项目，容易造成误导

下图是项目的 `README` 截图：

![](https://files.owenyoung.com/file/owen-blog/2023-08-05-045538.png)

这个的原因同上， `README.md` 文件渲染的是官网的主页，所以写了一大堆文字和图片介绍沉浸式翻译这个产品。既然我已将整个文档项目迁出，那么这个 `README.md` 文件也可以按照闭源最佳的实践，改为简单介绍这个 Repo 即可。

进度：✅ 已完成，[点此查看最新项目结构](https://github.com/immersive-translate/immersive-translate/)

![](https://files.owenyoung.com/file/owen-blog/2023-08-06-045156.png)

> 3\. 当重写后的新项目改为闭源后，没有在显著位置提醒用户该新项目是一个闭源项目

这个操作发生在项目的早期，（有点复杂和绕脑，我尽量尝试解释清楚）。

沉浸式翻译最早（2022 年 11 月 5 日）基于开源项目[TPW](https://github.com/FilipePS/Traduzir-paginas-web)之上开发，这对于程序员来说很常见，因为这样可以快速进行[概念验证](https://twitter.com/OwenYoungZh/status/1588790629647405057)。我当时也是，在该开源项目基础上尝试修改以支持双语网页翻译。

最后，在这个开源项目上开发了 20 多天后，发现再也改不动了。。原项目的代码架构实在是太老了，增减功能非常麻烦，再加上我当时又很迷另一个很新的语言 [Deno](https://deno.com/)，所以就计划从零开始，重写一个非常干净的双语网页翻译扩展,这是当时（2022 年 11 月 29 日，此时旧版项目开发了 20 多天）我在用户群里的讨论：

![](https://files.owenyoung.com/file/owen-blog/2023-08-04-115754.png)

![](https://files.owenyoung.com/file/owen-blog/2023-08-04-115658.jpg)

所以大概从 22 年 11 月 28 日开始，我着手重写整个项目，我建立了一个私有项目`next-translator`用于托管新版项目的源代码，同时建立了`next-immersive-translate`的公开项目，用于存放新版项目的文档（这就是后来改名为`immersive-translate`的 10k+项目）

当时沉浸式翻译的用户还很少很少，几乎都在我建立的[Telegram 用户群](https://t.me/+rq848Z09nehlOTgx)里，新版开发期间，群里喜欢尝鲜的用户还一直都帮我测试新版的各种问题。最终，新版从开始到开发完成，大概花了全职的 50 天时间，经原帖评论区网友提醒，在那期间，新版`next-immersive-translate/README` 的[README 说明](https://github.com/immersive-translate/immersive-translate/tree/v0.0.41)就很规范，明确说明了这个 repo 只是用来存放 release 版本：

![](https://files.owenyoung.com/file/owen-blog/2023-08-05-081546.jpg)

终于，在重写新版 50 天后， 23 年 1 月 18 日，沉浸式翻译新版在 Chrome 商店上架了，由此，正式取代了 50 天前提交的旧版沉浸式翻译。

既然新版已上架商店，我就想，next 是不是可以变成 current 了，此前新版的公开文档项目`next-immersive-translate`可不可以改名为`immersive-translate`，然后旧项目改名为`old-immersive-translate`。所以当时我做了以下操作：

在新版上架当天，我把旧版的`immersive-translate`项目在 Github 上存档，并且改名为`old-immersive-translate`。

同时将新版的文档项目`next-immersive-translate`改名为`immersive-translate`，由此完成了新旧交替。

接着我在[旧版项目](https://github.com/immersive-translate/old-immersive-translate/tree/6df13da22664bea2f51efe5db64c63aca59c4e79)加了一行说明：

> 说明：新版的沉浸式翻译扩展已经迁移到[这里](https://github.com/immersive-translate/immersive-translate)，新版全新架构，性能更好，支持更多的翻译引擎和浏览器平台（包括 iOS Safari），以及拥有更好的 pdf 翻译体验，欢迎移步[新版](https://github.com/immersive-translate/immersive-translate)。旧版代码将存档。

这行说明，对于不了解我的人来说，可以理解为作者恶意不提到新项目已经是闭源项目。但我回想起当初的操作，只能说当时真的没想那么多，因为当时项目实在是太小了，所有操作就很随意，很难预料到“命运的齿轮”还会转到我这。。。

不过，有一个好消息是：沉浸式翻译 99.9 %以上的用户都是在新版发布后获取的，这些用户实际上并不知道以前还有个所谓的旧版开源项目（因为当时旧版项目只开发了 20 来天，用户数很少很少），所以这个操作的影响范围算是比较小。

但是这里的关切是很合理，但是由于原项目已存档，无法再做出修改，所以我会在链接过去的新项目里正文最前面进行说明。

> 本仓库用于发布沉浸式双语网页翻译扩展的 [Release 版本](https://github.com/immersive-translate/immersive-translate/releases)以及使用 [Github Issues](https://github.com/immersive-translate/immersive-translate/issues)收集和跟进用户反馈。
>
> [沉浸式翻译](https://immersivetranslate.com/) 并非开源软件，这个仓库并 **不包含** 沉浸式翻译的源代码。旧版的[沉浸式翻译开源项目](https://github.com/immersive-translate/old-immersive-translate)已于 2023 年 1 月 17 日被归档。

进度：✅ 已完成，[点此查看](https://github.com/immersive-translate/immersive-translate/)

> 4\. 新项目的许可证变更有问题

这里帖子的主要疑问其实已经没有了，由于新版的项目只是一个文档项目，它本身没必要绑定任何 License 文件，原有的终端用户协议应放置在`EULA`文件。

进度：✅ 已完成，点此查看[新版](https://github.com/immersive-translate/immersive-translate/)

> 5\. 沉浸式翻译用开源来宣传自己，因为有部分第三方文章（怀疑是软文）提到了沉浸式翻译是开源的

评论区提到的几个链接，这些文章的作者确实提到了沉浸式翻译开源的，这也间接说明上面的 1，2 表达的关切是合理的。

随后我在微信上尝试搜索更多推荐沉浸式翻译的文章，粗略估计有 95% 的文章并没有提到沉浸式翻译是开源的，大概有 5% 的文章用开源来形容沉浸式翻译。

还有一点，就是帖子里关于软文的指控是明确不符合事实的，因为沉浸式翻译截止目前（2023 年 08 月 05 日）还没有请任何人写过推广，这件事很好证伪，因为随便找到任何一篇推广沉浸式翻译的文章，如果作者说那是软文，这件事就证伪了。

这件事我可以改进的是，尝试联系这些链接里的作者，告诉他们沉浸式翻译实际上是闭源项目，如果可以的话，请他们删掉开源的说法。

![](https://files.owenyoung.com/file/owen-blog/2023-08-05-214508.png)

![](https://files.owenyoung.com/file/owen-blog/2023-08-05-214752.png)

![](https://files.owenyoung.com/file/owen-blog/2023-08-05-215200.png)

![](https://files.owenyoung.com/file/owen-blog/2023-08-05-215348.png)

进度：正在进行中

> 6\. 沉浸式翻译的官网中，有一个 Github 链接，容易给人开源的印象

指的是沉浸式官网最下方的 Github 链接：

![](https://files.owenyoung.com/file/owen-blog/2023-08-04-154126.jpg)

我觉得这也是合理的关切，我计划用[Release](https://github.com/immersive-translate/immersive-translate/releases) 来代替原 Github 的描述。

进度：✅ 已完成，点此查看[官网](https://immersivetranslate.com)

> 7\. 在沉浸式翻译的帮助文档里，邀请其用户在商店评价，并且邀请用户给 Github 项目点赞

这一点指的是沉浸式的帮助文档里有一个可选项呼吁用户帮忙给 Github 项目 star：

![](https://files.owenyoung.com/file/owen-blog/2023-08-05-110419.jpg)

这里的历史原因是，从当时独立开发者的视角来看，我想努力扩大沉浸式翻译的影响力。但是以现在的视角来看，我觉得这也是合理的关切，我计划移除这个呼吁。

进度：✅ 已完成，点此查看[该文档](https://immersivetranslate.com/docs/)

> 8\. 沉浸式翻译的新版文档项目，一直在继续提交 build 之后的更新

这里的历史原因是由于这个项目既是官网的文档项目，又是托管构建产物的项目，然后沉浸式翻译发版还很频繁，平均每 2 天一个版本，所以这个项目确实一直都有持续的提交。

但是我觉得在完成上述变动之后，整个文档项目已迁移到其他地方，之后理论上就只有机器人在变更了，变更频率也会小很多。

进度：✅ 已完成迁移，[点此查看](https://github.com/immersive-translate/immersive-translate/)

以上是我总结的 8 点主要的关切，以及我为此补充的细节和解决方案。

我希望这些改进措施能够解决原帖里用户的关切。同时，我也想向那些被误导以为沉浸式翻译项目是开源的，但后来发现不是后，产生受骗感觉的朋友表示歉意。我从中学到了很多东西，我也很庆幸是现在学到，而不是更晚。

如果你需要替代方案的话，我推荐以下两个开源的沉浸式翻译双语网页翻译扩展替代品：

1. [可可翻译](https://github.com/chunibyocola/sc-translator-crx)， GPL3 许可证，已上架商店。
2. [简约翻译](https://github.com/fishjar/kiss-translator),GPL3 许可证，暂未上架商店。

或者你也可以选择使用 MPL2.0 协议下的[旧版沉浸式翻译](https://github.com/immersive-translate/old-immersive-translate)，我测试过，在大多数场景下依然可以使用，而且由于它是开源项目，任何人都可以继续修改它。

我也想对那些在原帖中对沉浸式翻译表示理解的朋友们说声谢谢，接下来沉浸式翻译也会推出更多的开源计划，比如：

1. [AI 翻译模型](https://github.com/immersive-translate/immersiveL)
2. PDF 文件解析引擎
3. ePub 翻译
4. ...

我会继续打磨产品，不断的提升所有人外语信息阅读的效率。

**最后，再分享一下我在原帖中学到的以前比较模糊的开源知识，希望能帮到有需要的同学：**

> 1\. “源代码可用”[并不代表“开源”](https://www.v2ex.com/t/961178?p=2#r_13432781)，

“源代码可用”只是指源代码可以被公众查看。但这并不意味着公众可以自由地使用、修改或分发这些代码。这种情况下，代码的版权所有者可能仍然保留所有权利，并可能对代码的使用施加严格的限制。

另一方面，“开源”通常指的是任何人都可以自由地查看、使用、修改和分发源代码，但前提是他们需要遵循相应的开源许可证。开源许可证（例如 MIT、GPL、Apache 等）为用户提供了使用、修改和分发代码的明确指南，并且保护了原始作者的权利。

总的来说，所有的开源代码都是源代码可用的，但并非所有源代码可用的代码都是开源的。是否真正开源，关键在于其许可证如何规定其使用、修改和分发的条款。

> 2\. 不管你的公开项目采用什么开源协议（包括 MIT），只要你接受过别人的贡献，并且你和贡献着之间没有签署过《贡献者许可协议（CLA）》的话，那么理论上你只能对你编写的部分变更协议。

对于这一点，大公司是怎么做的呢？

如果你提交 pull request 给大公司的话，他们会强制要求你签署《贡献者许可协议（CLA）》，该许可协议会授予**项目所有者永久性、全球性、非专属性、免费的、可转让的许可，用于使用、复制、修改、创建衍生作品、公开展示和分发您的贡献及其衍生作品，并且项目所有者有权在必要时改变许可证。**

对于个人开发者来说，如果你也想对自己的项目有更大的掌控权的话，你可以使用[这个](https://github.com/contributor-assistant/github-action) Github Action, 它会帮你在新的 pull request 合并之前，要求贡献者签署《贡献者许可协议》

> 3\. 如果你还没想好要采用什么许可证的话，建议不要建立任何 License，这样的话，即使你的项目是公开源代码的，但是法律上并不算开源。你可以在比较了解许可证的情况下再决定使用什么类型的许可证。

以下是一些常见许可证的简单分类：

1. 宽松许可证：

- MIT License：最简洁和最宽松的许可证之一，只需要在复制或分发的时候保留原有的版权声明和许可证。
- BSD 2-Clause 和 3-Clause License：同样非常简洁和宽松，和 MIT 类似，但是 3-Clause 版本多了一个不得使用原软件作者名义进行推广的条款。
- Apache License 2.0：比 MIT 和 BSD 稍微复杂一点，但是多了一些对专利权的明确规定。

2. 严格许可证：

- GPL v2/v3 (GNU General Public License)：GPL 是最严格的许可证之一，要求所有的衍生软件也必须采用 GPL 许可证。
- AGPL (GNU Affero General Public License)：在 GPL 的基础上，进一步要求即使在网络上提供服务（不分发软件），也需要开源代码。
- LGPL (GNU Lesser General Public License)：比 GPL 稍微宽松一点，对库或框架更友好，只要求对修改的部分开源，可以和商业软件链接。

最后，我还想感谢 ChatGPT 给了我鼓励。虽然从公关角度上来说，目前原帖的热度已经下去了，此时保持沉默似乎是最好的选择。

![](https://files.owenyoung.com/file/owen-blog/2023-08-05-192439.png)

我随口问了 ChatGPT 一句， 它的回答极大的鼓励了我，让我在这个时间做了我觉得对的事，感谢 ChatGPT 呀。
