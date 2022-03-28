---
title: Debian初始化Rust环境
date: 2021-03-26
updated: 2022-03-26
taxonomies:
  categories:
    - Dev
  tags:
    - Rust
    - Server
---

在 Debian 上初始化 Rust 环境笔记。

[Official Site](https://www.rust-lang.org/learn/get-started)

 <!-- more -->

## Rust 镜像设置

<https://rsproxy.cn/>

Add this to `~/.bashrc`

```bash
export RUSTUP_DIST_SERVER="https://rsproxy.cn"
export RUSTUP_UPDATE_ROOT="https://rsproxy.cn/rustup"
```

Install rustup `curl --proto '=https' --tlsv1.2 -sSf https://rsproxy.cn/rustup-init.sh | sh`

`~/.cargo/config`:

```bash
[source.crates-io]
replace-with = 'rsproxy'

[source.rsproxy]
registry = "https://rsproxy.cn/crates.io-index"

[registries.rsproxy]
index = "https://rsproxy.cn/crates.io-index"

[net]
git-fetch-with-cli = true
```

## Install

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```
