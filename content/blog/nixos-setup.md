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

- [nixos & flake 中文](https://nixos-and-flakes.thiscute.world/zh/preface)
- [nix 入门教程](https://nix.dev/)
- [flake 入门](https://tonyfinn.com/blog/nix-from-first-principles-flake-edition/nix-7-what-about-flakes-then/)
- [探索macos上的nix配置](https://www.mathiaspolligkeit.com/dev/exploring-nix-on-macos/)
- [使用 Nix 和 Home Manager 对 dotfile 进行声明式管理](https://www.bekk.christmas/post/2021/16/dotfiles-with-nix-and-home-manager)

## 示例repo

- [minimal demo](https://github.com/ryan4yin/nix-darwin-kickstarter/tree/main/minimal)
- [starter configs](https://github.com/Misterio77/nix-starter-configs)
- [home](https://github.com/andreykaipov/home)

## 问答

- 不要太追求完美主义，有些动作可以接受手动完成
- 我不想把事情搞复杂，
- 不要软链来配置，直接原生配置
- 我不想学两遍配置格式，尤其是网上找到的大多数答案都是原生的教程，如果你要超过来，又要重新查看 home-manager 的教程
- nix 和其他的软件管理器不一样的是，他是0依赖的，他所有的依赖都是自己处理的，并且是可重现的
- nix 不适合什么？
  - 不适合作为多版本管理器，所以它适合管理你的全局环境，多版本管理器还是应该交给具体语言的版本管理器，
  - 也有一些工具来实现这个，但是我觉得有点拧巴，多版本应该作为非全局，临时的方案，而不是全局的。

## 好处

- 声明的

## 密钥管理

我发现不管我用什么加密，我最终都需要把一个用来解密的密钥放在我的服务器上，如果我用一个永久的PGP Key, 或者永久的 ssh key 来做这个事，那么我势必需要把ssh key 不断的复制到每一台服务器，这样大大降低 ssh key的安全性。

所以我需要有一种方式，最好是一个不需要我维护的线上身份管理，类似 AWS 的KMS 之类的系统。

1. 生成age keys，

```
age-keygen -o key.txt
```

2. 移动 age 到 sops

```
mkdir -p "$HOME/Library/Application Support/sops/age/"
```

保存私钥到 [infisical](https://app.infisical.com/)

## 更新软件

先吧 sha256 清空

## home

## 我的流程

1.

```
xcode-select --install
```

2. 下载[keepassxc](https://keepassxc.org/download/) GUI 软件，用于恢复我的 ssh 文件，随后用于 github repo下载，加密解密密钥等。

3. 在浏览器打开 Github 上存放 keepassxc 加密文件的repo，下载密钥文件 `main.kdbx`, 用 keepassxc 打开，找到我之前保存的 ssh 条目，下载该条目下的附件到 `~/.ssh/`, （finder 无法直接选中 `~/.ssh`文件夹，需要`cmd+shift+g` 手动输入该文件夹，选择后，keepassxc软件就会帮我把我的主ssh 下载到本机电脑了，之后各种需要密钥的操作都依赖这个）

4. 下载我的配置repo和密钥repo 到 `~/my-nix`, `~/private`

```
cd ~
git clone http://github.com/theowenyoung/my-nix
```

```
cd ~
git clone http://github.com/theowenyoung/private
```

5. 安装 [nix](https://nixos.org/download.html#nix-install-macos)

```
sh <(curl -L https://nixos.org/nix/install)
```

一路确认就ok，nix 很详细的描述了它具体都做了啥，可以观察学习一下。 我更推荐使用官方的安装脚本，很多人喜欢用第三方的，他们觉得更干净，默认的配置更友好，但是我觉得好像也没差多少，用原生的，可以顺便学习一下。另外就是我昨天测试的时候，发现第三方安装的nix版本不是最新的，并且在我的osx 14 电脑上有权限错误，但是nix官方的脚本是正常的。

6. 安装 homebrew

(用于安装 casks)

```
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

## GUI 软件配置

8. 打开 iterm2:

1. Profile -> Window -> Style[Full Screen]
1. Profile -> Keys -> Left Option Key -> Esc+
1. Profile -> Keys -> Right Option Key -> Esc+
1. Profile -> Terminal -> Enable Mouse report Event -> checked.
1. General -> Selections -> Applications in terminal may access clipboard.
1. General -> Selections -> double click performs smart selections
1. Profile -> Text -> Font -> FiraCode Nerd Font

## Python 临时项目测试

```
nix-shell -p python3 python3Packages.virtualenv
virtualenv venv
source ./venv/bin/activate
```

## Tips

1. 打印当前nix flake文件的输出：

```
nix flake show
```

2. 打印当前nix 文件的输出：

```
nix-instantiate --eval --strict file.nix
```

3. nix 不能省略分号

这是我犯过最多的错误。
