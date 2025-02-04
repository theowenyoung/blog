---
title: qBittorrent setup for Debian
date: 2021-03-26
updated: 2022-03-26
taxonomies:
  categories:
    - Dev
  tags:
    - Self-hosted
---

Because there is no official ppa of qBittorrent for debian, so we use a [third party service - qbittorrent-nox-static](https://github.com/userdocs/qbittorrent-nox-static) to compile qb.

<!-- more -->

## Install

1. Download script

```bash
wget -qO ~/qbittorrent-nox-static.sh https://git.io/qbstatic
chmod +x ~/qbittorrent-nox-static.sh
# pre
sudo ~/qbittorrent-nox-static.sh
# build
~/qbittorrent-nox-static.sh all
# install
sudo ~/qbittorrent-nox-static.sh install
```

## Configure

Read more at [qbittorrent-nox configure](https://userdocs.github.io/qbittorrent-nox-static/#/install-qbittorrent?id=configuring-qbittorrent)

```bash
vim ~/.config/qBittorrent/qBittorrent.conf
```

With follow config:

```ini
[LegalNotice]
Accepted=true

[Preferences]
WebUI\Port=8080
WebUI\HostHeaderValidation=false
```

## Systemd service

Reference at [here](https://userdocs.github.io/qbittorrent-nox-static/#/systemd)

```bash
# create a user
sudo vim /etc/systemd/system/qbittorrent.service
```

Config:

```bash
[Unit]
Description=qBittorrent-nox service
Wants=network-online.target
After=network-online.target nss-lookup.target

[Service]
Type=exec
User=qbtuser
ExecStart=/usr/local/bin/qbittorrent-nox
Restart=on-failure
SyslogIdentifier=qbittorrent-nox

[Install]
WantedBy=multi-user.target
```

After any changes to the services reload using this command.

```bash
sudo systemctl daemon-reload
```

Now you can enable the service

```bash
sudo systemctl enable --now qbittorrent.service
```

Now you can use these commands

```bash
systemctl stop qbittorrent
systemctl start qbittorrent
systemctl restart qbittorrent
systemctl status qbittorrent

```

## Reverse Proxy (Optional)

Use Caddy to access qBittorrent with domain. This should install [Caddy2 Setup for Debian](@content/blog/caddy2-setup-for-debian.en.md)

Config:

```bash
example.com {
   push
   reverse_proxy 127.0.0.1:8080
}

```

Now, you can access your qBittorrent web UI at: example.com, the default username and password is : admin/adminadmin

> Note, you should change the default username/password

## Config

- Download directory, `/data/Downloads`
- Settings, auto add [China](https://github.com/XIU2/TrackersListCollection) <https://trackerslist.com/best.txt> , [US](https://github.com/ngosang/trackerslist) <https://ngosang.github.io/trackerslist/trackers_best.txt>
- Open `announce_to_all_trackers` at settings.

## Install Search Plugin Jackett

[Jackett](https://github.com/Jackett/Jackett) is a server program that provides support for more than 400 torrent sites (public and private).

### Install Jackett

See [Jackett Setup](@content/blog/jackett-setup.md)

### Install Jackett Plugin

See also at [here](https://github.com/qbittorrent/search-plugins/wiki/How-to-configure-Jackett-plugin)

Open qBittorrent Web UI, In the Search tab, click the Search plugins... button (bottom-right) -> add new plugin -> `https://raw.githubusercontent.com/qbittorrent/search-plugins/master/nova3/engines/jackett.py`

Change API key settings, You can get it from Jackett UI

```bash
vim ~/.local/share/qBittorrent/nova3/engines/jackett.json
```

## Resource

[高阶教程-追剧全流程自动化](https://sleele.com/2020/03/16/高阶教程-追剧全流程自动化/)
