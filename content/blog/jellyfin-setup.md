---
title: Jellyfin安装指南
date: 2021-03-26
updated: 2022-03-26
taxonomies:
  categories:
    - Dev
  tags:
    - Self-hosted
---

Jellyfin 是一款开源的，拥有前后端服务的视频播放器和服务端程序。

<!-- more -->

## Install

See [Installing Jellyfin | Documentation - Jellyfin Project](https://jellyfin.org/docs/general/administration/installing.html#debian)

## Usage

```bash
sudo systemctl restart jellyfin
```

## 中文字体

1. Download google noto fonts:
   This [repo](https://github.com/CodePlayer/webfont-noto) compiled noto fonts, so you can just download it and use it.

   ```bash
   wget https://github.com/CodePlayer/webfont-noto/raw/master/dist/NotoSans/NotoSansCJKsc-hinted/subset/NotoSansCJKsc-hinted-standard/NotoSansCJKsc-Regular.woff2
   ```

   At Jellyfin Admin dashboard, player, open back font, add the font path

## FAQ

- [Jellyfin 中文字体问题](https://github.com/jellyfin/jellyfin-web/issues/934)
