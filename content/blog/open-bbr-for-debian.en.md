---
title: Open BBR for Debian
date: 2021-01-26
updated: 2022-03-26
taxonomies:
  categories:
    - Dev
  tags:
    - Self-hosted
    - Server
---

Enable TCP BBR on Debian.

<!-- more -->

## Steps

1. Open the following configuration file to enable TCP BBR.

```bash
vi /etc/sysctl.conf
```

2. At the end of the config file, add the following lines.

```bash
net.core.default_qdisc=fq
net.ipv4.tcp_congestion_control=bbr
```

3. reload

```bash
sysctl -p
```

Now, Verify if BBR is enabled in your system,

```bash
sysctl net.ipv4.tcp_congestion_control
```

Output:

```bash
root@vps:~# sysctl net.ipv4.tcp_congestion_control
net.ipv4.tcp_congestion_control = bbr
```
