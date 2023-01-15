---
title: Radarr Setup
date: 2020-03-26
updated: 2022-03-26
taxonomies:
  categories:
    - Dev
  tags:
    - Self-hosted
---

[repo](https://github.com/Radarr/Radarr)

<!-- more -->

## Install

See also [here](https://wiki.servarr.com/radarr/installation#linux)

[Latest Release](https://github.com/Radarr/Radarr/releases)

### Systemd

```bash
cat << EOF | sudo tee /etc/systemd/system/radarr.service > /dev/null
[Unit]
Description=Radarr Daemon
After=syslog.target network.target
[Service]
User=green
Group=admin
Type=simple

ExecStart=/home/green/radarr/Radarr -nobrowser -data=/home/green/.config/radarr/
TimeoutStopSec=20
KillMode=process
Restart=always
[Install]
WantedBy=multi-user.target
EOF
```
