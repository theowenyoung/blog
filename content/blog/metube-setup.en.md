---
title: Metube Setup
date: 2020-03-26
updated: 2022-03-26
taxonomies:
  categories:
    - Dev
  tags:
    - Self-hosted
---

## List

- [GitHub - alexta69/metube: youtube-dl web UI](https://github.com/alexta69/metube)
- [Metube chrome extension](https://chrome.google.com/webstore/detail/metube-downloader/fbmkmdnlhacefjljljlbhkodfmfkijdh)

## Setup

[Docker Install](https://docs.docker.com/engine/install/)

## Config

```yaml
version: "3"
services:
  metube:
    image: alexta69/

    container_name: metube
    restart: unless-stopped
    ports:
      - "10005:8081"
    volumes:
      - /data/youtube:/downloads
```
