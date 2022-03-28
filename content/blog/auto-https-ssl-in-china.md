---
title: 在中国自动生成免费HTTPS证书的最佳方案
date: 2022-03-25
updated: 2022-03-25
taxonomies:
  categories:
    - Dev
  tags:
    - HTTPS
---

Certbot 自动生成 Lets encrypt 的方案已经被墙了，经过各种尝试之后，发现基于 [`amce.sh+cloudflare`](https://github.com/acmesh-official/acme.sh) 的 dns 解析是最方便无痛的.

<!-- more -->

1. 下载 acme 工具:

```bash

# 用root用户权限，因为涉及到操作nginx

sudo su

wget -O - https://get.acme.sh | sh -s email=my@example.com

```

1. 域名在 [Cloudflare](https://www.cloudflare.com/zh-cn/) 解析

1. 在某个域名的 dashboard 面板右侧找到 `Account ID`, 记录下备用。

1. 进入<https://dash.cloudflare.com/profile/api-tokens>，生成一个 API Token,选择`Edit Zone` 模版，Zone Resources 选择 `All Zones`,生成，

把以下的信息保存到 `~/.bashrc`

```bash

export CF_Token="sdfsdfsdfljlbjkljlkjsdfoiwje"

export CF_Account_ID="xxxxxxxxxxxxx"

```

```bash

source ~/.bashrc

```

> 如果有什么不清楚的，可以参考文档： <https://github.com/acmesh-official/acme.sh/wiki/dnsapi>

1. 签发证书，运行 `acme.sh --issue --dns dns_cf -d example.com --server letsencrypt`

1. 安装证书到指定目录：

```bash

acme.sh --install-cert -d example.com \

--key-file /etc/nginx/ssl/example.com.key \

--fullchain-file /etc/nginx/ssl/example.com.crt \

--reloadcmd "service nginx force-reload"

```

之后 acme 会自动添加 cron 任务，自动续期期限

1. nginx 配置参考

可以在[这里](https://www.digitalocean.com/community/tools/nginx?domains.0.https.certType=custom&domains.0.php.php=false&domains.0.reverseProxy.reverseProxy=true&domains.0.routing.root=false&global.app.lang=zhCN) 在线生成一份合适的 ssl 配置

生成后，首次需要初始化 Diffie-Hellman keys:`openssl dhparam -out /etc/nginx/dhparam.pem 2048`

然后运行 `sudo nginx -t && sudo systemctl reload nginx`
