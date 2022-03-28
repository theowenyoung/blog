---
title: Bazarr Setup
date: 2021-03-26
updated: 2022-03-26
taxonomies:
  categories:
    - Dev
  tags:
    - Self-hosted
    - Media
---


## Install

See also [here](https://wiki.bazarr.media/Getting-Started/Installation/Linux/linux/)

```bash
sudo apt-get install python3-pip python3-distutils -y
wget https://github.com/morpheus65535/bazarr/releases/latest/download/bazarr.zip
unzip bazarr.zip -d ~/bazarr
cd bazarr
python3 -m pip install -r requirements.txt
```

### Setup as system service

Reference at [here](https://wiki.bazarr.media/Getting-Started/Autostart/Linux/linux/)

You have to create a `bazarr.service` file in `/etc/systemd/system` that would contain the following text:

```bash
sudo vim /etc/systemd/system/bazarr.service
```

```bash
[Unit]
Description=Bazarr Daemon
After=syslog.target network.target

# After=syslog.target network.target sonarr.service radarr.service

[Service]
WorkingDirectory=/home/green/bazarr/
User=green
Group=admin
UMask=0002
Restart=on-failure
RestartSec=5
Type=simple
ExecStart=/usr/bin/python3 /home/green/bazarr/bazarr.py
KillSignal=SIGINT
TimeoutStopSec=20
SyslogIdentifier=bazarr
ExecStartPre=/bin/sleep 30

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now bazarr
sudo systemctl status bazarr
sudo systemctl restart bazarr

```

## Configure

You can set your password at the UI.

### Sonarr

Enabled, See [here](https://wiki.bazarr.media/Getting-Started/Setup-Guide/#sonarr)

### Provider

Add Zimuku, assrt, Opensubtitle

### Language

See [here](https://wiki.bazarr.media/Getting-Started/Setup-Guide/#languages)

Add default settings, see [here](https://wiki.bazarr.media/Getting-Started/Setup-Guide/#default-settings)
