---
title: Nginx Setup for Debian
date: 2020-03-26
updated: 2022-03-26
taxonomies:
  categories:
    - Dev
  tags:
    - Self-hosted
---

Install latest stable nginx for debian

> Also see [here](https://www.nginx.com/resources/wiki/start/topics/tutorials/install/)

<!-- more -->

```bash
sudo su
cat <<EOF >> /etc/apt/sources.list.d/nginx.list
deb http://nginx.org/packages/debian/ buster nginx
deb-src http://nginx.org/packages/debian/ buster nginx
EOF
exit
curl -L https://nginx.org/keys/nginx_signing.key | sudo apt-key add -
sudo apt update
sudo apt install nginx
```

## Optional generate nginx conf online

Generate a nginx conf online at [here](https://www.digitalocean.com/community/tools/nginx)

If nginx conf need dhparam.pem, run :`cd /etc/nginx sudo openssl dhparam -dsaparam -out dhparam.pem 4096`

## Optional install acme.sh

```bash
sudo su
wget -O -  https://get.acme.sh | sh -s email=my@example.com
```

```bash
source ~/.bashrc
acme.sh --issue -d example.com --nginx
```

## Optional Install certbot

### Install snap

> https://snapcraft.io/docs/installing-snapd

```bash
sudo apt -y install snapd
sudo snap install core; sudo snap refresh core

```

> https://certbot.eff.org/lets-encrypt/debianbuster-nginx

```bash
sudo snap install --classic certbot
sudo snap install certbot-dns-cloudflare
sudo ln -s /snap/bin/certbot /usr/bin/certbot
```

## Generate SSL

```bash
sudo certbot --nginx
```
