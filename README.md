# Owen's Blog

The blog is built with [Zola](https://www.getzola.org/), for my personal need, I've use [my forked version](https://github.com/theowenyoung/zola) to build it.

The only change is that I use `/content/xxx.md` instead of `@/xxx.md` to refer the inter markdown files, so that the editor can also go to the linked file.

>[Related docments](https://www.getzola.org/documentation/content/linking/)
> 
> [Related Issue 1](https://github.com/getzola/zola/issues/686)


[Visit it Online](https://www.owenyoung.com)


## Local Serve

```bash
make serve
```

## Local Build

```bash
make build
```


## 中文说明


> 已内置了 Zola 二进制 mac,ubuntu 程序在[`bin`](/bin/)目录中，所以可以直接 Clone 这个 Repo 在本地运行。


推荐使用 VSCode 进行编辑，我使用我修改的[Foam Lite 插件](https://marketplace.visualstudio.com/items?itemName=theowenyoung.foam-lite-vscode)进行辅助输入。主要是方便插入内部链接，和用模版生成初始文章。
