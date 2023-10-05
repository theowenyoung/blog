---
title: NixOS
date: 2023-10-02T19:26:02+08:00
updated: 2023-10-02
draft: true
taxonomies:
  categories:
    - Random
  tags:
    -
---

<!-- more -->

## 教程

- [nix 入门教程](https://nix.dev/)
- [flake 入门](https://tonyfinn.com/blog/nix-from-first-principles-flake-edition/nix-7-what-about-flakes-then/)

## Tips

1. 打印当前nix flake文件的输出：

```
nix flake show
```

2. 打印当前nix 文件的输出：

```
nix-instantiate --eval --strict file.nix
```