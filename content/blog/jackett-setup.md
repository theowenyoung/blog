---
title: Jackett 安装指南
date: 2021-03-26
updated: 2022-03-26
taxonomies:
  categories:
    - Dev
  tags:
    - Self-hosted
---

Jackett 是一款开源的种子聚合搜索服务，常用来和 BT 下载器配合使用。

Read more at [here](https://github.com/Jackett/Jackett#install-as-service)

<!-- more -->

## Install

1. Download and extract the latest `Jackett.Binaries.LinuxAMDx64.tar.gz` release from the [releases page](https://github.com/Jackett/Jackett/releases)

```bash
wget https://github.com/Jackett/Jackett/releases/download/v0.18.545/Jackett.Binaries.LinuxAMDx64.tar.gz
# tar to a directory you want
tar -xf Jackett.Binaries.LinuxAMDx64.tar.gz
```

2. To install Jackett as a service, open a Terminal, cd to the jackett folder and run `sudo ./install_service_systemd.sh` You need root permissions to install the service. The service will start on each logon. You can always stop it by running `systemctl stop jackett.service` from Terminal. You can start it again it using `systemctl start jackett.service`. Logs are stored as usual under `~/.config/Jackett/log.txt` and also in `journalctl -u jackett.service`.

`http://your-ip:9117`

You can set password, or port by UI.

## Jackett 索引推荐

- EZTV
- RARBG
- YTS
