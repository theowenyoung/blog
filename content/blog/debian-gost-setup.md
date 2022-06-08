---
title: Debian 安装 Gost
date: 2022-06-09T00:31:11+08:00
updated: 2022-06-09
taxonomies:
  categories:
    - Random
  tags:
    - Proxy
---

[Gost](https://github.com/ginuerzh/gost) 是一个灵活的代理转发工具，可以转发 HTTP、HTTPS、SOCKS5 等协议，可以配置反嗅探策略等等。

本文记录在 Debian 上使用 Systemctl 配置 Gost 代理，以及使用 acme.sh 配置 https 证书。

<!-- more -->

## 1. 下载并解压最新的 Gost 压缩包

去[Gost Release](https://github.com/ginuerzh/gost/releases/)找到最新版本的压缩包，比如 我的服务器系统是 Debian，amd64 架构，所以对应的是`https://github.com/ginuerzh/gost/releases/download/v2.11.2/gost-linux-amd64-2.11.2.gz`

```bash
# create gost directory
mkdir gost
# download to current directory
wget https://github.com/ginuerzh/gost/releases/download/v2.11.2/gost-linux-amd64-2.11.2.gz
# unzip
gzip -d gost-linux-amd64-2.11.2.gz
mv gost-linux-amd64-2.11.2.gz gost
# Add execute permission
chmod +x gost
```

## 2. 申请 https 证书并自动续期

我使用[acme.sh](https://github.com/acmesh-official/acme.sh)来管理证书，并且使用 Cloudflare 作为 DNS 管理，因为 Cloudflare 提供了 API 来验证域名所属权限，这样签发证书更方便。

1. 下载 acme 工具:

```bash
wget -O - https://get.acme.sh | sh -s email=my@example.com
```

1. 把域名在 [Cloudflare](https://www.cloudflare.com/zh-cn/) 添加解析，解析到你的服务器 IP

1. 在某个域名的 dashboard 面板右侧找到 `Account ID`, 记录下备用。

1. 进入<https://dash.cloudflare.com/profile/api-tokens>，生成一个 API Token,选择`Edit Zone` 模版，Zone Resources 选择 `All Zones`,生成，

把以下的信息保存到 `~/.bashrc`

```bash

export CF_Token="sdfsdfsdfljlbjkljlkjsdfoiwje"

export CF_Account_ID="xxxxxxxxxxxxx"

```

使之生效：

```bash

source ~/.bashrc

```

> 如果还有什么不清楚的，可以参考文档： <https://github.com/acmesh-official/acme.sh/wiki/dnsapi>

### 签发证书

> 修改 `example.com` 为你的域名

运行 `acme.sh --issue --dns dns_cf -d example.com`

> Note: 默认的签发机构是[Zerossl](https://zerossl.com/), 也可以使用 letsencrypt , `acme.sh --issue --dns dns_cf -d example.com --server letsencrypt`

> 运行之后他就会自动续期该域名，你可以检查 crontab 任务是否添加成功: `crontab -e`

## 3. 使用 Systemctl 启动

```bash
sudo vim /etc/systemd/system/gost.service
```

写入以下文件：

> 修改 `/home/green/gost/` 为你的 gost 文件夹

```bash
[Unit]
Description=Gost
After=syslog.target network.target
[Service]
WorkingDirectory=/home/green/gost/
User=green
Group=admin
UMask=0002
Restart=on-failure
RestartSec=5
Type=simple
ExecStart=/home/green/gost/start.sh
KillSignal=SIGINT
TimeoutStopSec=20
SyslogIdentifier=gost
[Install]
WantedBy=multi-user.target
```

使之生效：

```bash
sudo systemctl daemon-reload
sudo systemctl enable gost

```

## 4. 安装证书

### 安装证书到 gost 目录

> 修改 `~/gost/`为你的文件夹， `example.com` 为你的域名

```bash
acme.sh --install-cert -d example.com \
--cert-file ~/gost/cert.pem  \
--key-file ~/gost/key.pem  \
--ca-file ~/gost/ca.pem \
--reloadcmd "sudo systemctl restart gost"
```

## 3. 启动服务

Gost 的命令还挺长的，所以可以写的简单的脚本，以后启动方便点：

```bash
vim start.sh
```

```bash
#!/bin/bash
# 下面的3个参数需要改成你的
USER="xxxx"
PASS="xxxxxxxx"
PORT=8443
BIND_IP=0.0.0.0
sudo ./gost \
    -L "http2://${USER}:${PASS}@${BIND_IP}:${PORT}?probe_resist=web:www.baidu.com:443&knock=example.com"
```

添加执行权限

```bash
chmod +x ./start.sh
```

## 5. 查看日志

```bash
# 查看状态
sudo systemctl status gost
# 查看日志
sudo journalctl -u gost -f
```

## 6. 客户端配置

参见[这里](https://github.com/haoel/haoel.github.io#4-%E5%AE%A2%E6%88%B7%E7%AB%AF%E8%AE%BE%E7%BD%AE)

clash 配置参考：

```yaml
- name: h8443
  password: xxxxxxxx
  port: 8443
  server: example.com
  tls: true
  skip-cert-verify: true
  type: http
  username: xxxx
```

## 参考

- <https://github.com/haoel/haoel.github.io>
