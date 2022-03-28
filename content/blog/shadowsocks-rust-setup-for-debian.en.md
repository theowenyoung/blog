---
title: Shadowsocks Rust Setup for Debian
date: 2021-03-10
updated: 2022-03-22
taxonomies:
  categories:
    - Dev
  tags:
    - Tools
---

Shadowsocks Repo: <https://github.com/shadowsocks/shadowsocks-rust>

Setup rust first: [Debian 初始化 Rust 环境](/content/blog/rust-environment-setup-for-debian.md)

## Install

```bash
rustup default nightly
cargo install shadowsocks-rust
```

## Configure

```bash
mkdir ss
```

Server config sample:

```json
{
  "servers": [
    {
      "address": "::",
      "port": 9982,
      "method": "chacha20-ietf-poly1305",
      "password": "strong-password",
      "mode": "tcp_and_udp",
      "fast_open": false,
      "timeout": 7200
    }
  ]
}
```

## Add as a system service

```bash
sudo vim /etc/systemd/system/ss.service
```

> Note: Change `username` to your own username

```bash
[Unit]
Description=ssserver service
After=network.target

[Service]
ExecStart=/home/username/.cargo/bin/ssserver -c /home/username/ss/config.json
ExecStop=/usr/bin/killall ssserver
Restart=on-failure
StandardOutput=syslog               # Output to syslog
StandardError=syslog                # Output to syslog
SyslogIdentifier=ss
User=username
Group=admin

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now ss
```

## Run

## Status

```bash
sudo systemctl status ss
```

## Stop

```bash
sudo systemctl stop ss
```

## Update

```bash
cargo install shadowsocks-rust
```
