---
title: Sonarr Setup
date: 2020-03-26
updated: 2022-03-26
taxonomies:
  categories:
    - Dev
  tags:
    - Self-hosted
---

Before setup sonarr, you should setup [qBittorrent setup for Debian](@/blog/qbittorrent-setup-for-debian.en.md)

<!-- more -->

## Install

See [here](https://sonarr.tv/#downloads-v3-linux)

Once installed, visit <http://ip:8989>

## Restart

```bash
sudo systemctl restart sonarr
```

## Setup

See also [Sonarr Quick Start Guide | WikiArr](https://wiki.servarr.com/sonarr/quick-start-guide)

1. Click on `Settings => Media Management` on the left menu.

   Check `Rename Episodes`

2. Check left top `Show Advanced`

   `Importing` -> `Import Extra Files` `.srt,.ass,.sub`

3. Add `/data/TV` to `Root Folders`

4. Indexers, Add `eztv`, `RARBG` as Indexers, see jackett home page.

### Add qBittorrent Client:

`Setting` -> `Download Clients ` -> `qBittorrent`

## Resource

- [高阶教程-追剧全流程自动化](https://sleele.com/2020/03/16/高阶教程-追剧全流程自动化/)
