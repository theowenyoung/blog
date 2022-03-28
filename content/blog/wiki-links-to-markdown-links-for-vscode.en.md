---
title: Wiki Links to Markdown Links for VSCode
date: 2022-03-27
updated: 2022-03-27
taxonomies:
  categories:
    - Misc
---

Recently, I migrated my [Wiki](https://wiki.owenyoung.com) to [Zola](https://www.getzola.org/). Zola does not support relative internal links, it only support `@/xxx.md` internal link format. This is a bit painful, I posted a [feature request](https://zola.discourse.group/t/custom-content-dir-or-support-absolute-internal-link/1242/2) to Zola. But for now, I will use my own edited version of Zola, this change will allow me to use `/content/xxx.md` internal link format.

<!-- more -->

So, the second thing is to input absolute internal link quickly, [Obsidian](https://obsidian.md/) does have a feature that allows you type wiki links, then they will be converted to markdown links. I like this feature, but when I tried [Obsidian](https://obsidian.md/) seconds time, I still can't use to it, and it's also a bit slow compared to VSCode. [Foam](https://github.com/foambubble/foam) can only auto generate markdown reference link, but that feature not a one-time task, it sometimes makes mistakes, like add multiple `"` at the end of reference zone. So, I decided to fork foam extension, and turn off the most features that I don't need, only keep creating notes from template, and convert wiki links to markdown links.

![Wiki Links to Markdown Links](https://i.imgur.com/sYmKeKO.gif)

I'm so lucky, Foam's code structure is very clean, so I just changed a little bit to achieve what I wanted. Here is my final result: [Foam](https://github.com/theowenyoung/foam), if you need this, I also publish it on [VSCode marketplace](https://marketplace.visualstudio.com/items?itemName=theowenyoung.foam-lite-vscode).
