---
title: 开发技巧收藏
date: 2022-03-25
updated: 2022-03-25
taxonomies:
  categories:
    - Notes
  tags:
    - Dev
    - Tips
---

收集开发相关的技巧，比如中国需要的镜像服务等。

<!-- more -->

## 镜像服务

### Github

- [Fastgit](https://doc.fastgit.org/zh-cn/) - Github 国内镜像

- Download: `https://download.fastgit.org/org/repo/xxx`
- Clone `git clone https://github.com/org/repo`
- Clone with ssh `git clone git@ssh.fastgit.org:theowenyoung/gatsby-theme-primer-wiki.git`

### Rust

- [rsproxy cn](https://rsproxy.cn/) - rust 国内镜像

### Docker

- 阿里云公网: `https://registry.cn-hangzhou.aliyuncs.com`
- 腾讯云： `https://mirror.ccs.tencentyun.com`
  - [使用说明](https://cloud.tencent.com/document/product/1207/45596)

`sudo vim /etc/docker/daemon.json`

```json
{ "registry-mirrors": ["https://mirror.ccs.tencentyun.com"] }
```

```bash
sudo systemctl restart docker
```

## 解决方案

- [阿里云函数计算 php 环境如何自定义内置扩展，覆盖系统自带扩展](https://developer.aliyun.com/article/645670?spm=5176.smartservice_service_chat.0.0.6a33709aQ2zFPh)

## Bash Tips

### Get bash script parent dir absolute path

```bash
workspace="$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )/../" &> /dev/null && pwd )"
```

### Get bash script dir path

```bash
workspace="$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
```

### Bash Dotenv

> 导出.env 文件到当前执行环境

```bash
set -o allexport; source .env; set +o allexport
```

## Deno Tips

### Dirname

```ts
const __dirname = new URL(".", import.meta.url).pathname;
```

## Docker Tips

### Docker compose exec bin

```bash
docker-compose exec service-name /bin/sh
```

### Stop All contains and remove

```bash
sudo docker stop $(sudo docker ps -a -q)
sudo docker rm $(sudo docker ps -a -q)
```

### Clean all

```bash
sudo docker system prune --volumes
sudo docker image prune -a
```

## Git Tips

### Generate ssh key

Reference: [Generating a new SSH key and adding it to the ssh-agent - GitHub Docs](https://docs.github.com/en/github/authenticating-to-github/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent)

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
# Start the ssh-agent in the background.
eval "$(ssh-agent -s)"
# Add your SSH private key to the ssh-agent
ssh-add ~/.ssh/id_ed25519
```

Add ssh key to Github:

```bash
cat .ssh/id_ed25519.pub
```

[SSH Keys Setting](https://github.com/settings/keys)

### 获取首次提交时间

- [Finding the date/time a file was first added to a Git repository - Stack Overflow](https://stackoverflow.com/questions/2390199/finding-the-date-time-a-file-was-first-added-to-a-git-repository/25633731) - 获取首次提交时间

### 提交消息的模版

- [Git Semantic Commit Messages](https://gist.github.com/joshbuchea/6f47e86d2510bce28f8e7f42ae84c716) - git 语义化提交消息模版

### 合并上游的时候不弹出确认框

```bash
git pull upstream main --commit --no-edit
```

### 对所有的冲突上游的更新

```bash
git checkout --theirs .
```

### 首次更新子 repo submodule

```bash
git submodule update --init --recursive
```

Later

```bash
git submodule update --recursive
```

### Gitignore 忽略所有，除了文件夹

```bash
folder/*
!folder/.gitkeep
```

## Go Template Tips

- Parent Variable, `{{$.XX}}`
- URL encode, `urlquery "https://test.com"`

## 开源许可证

![License Comparison](./license-comparision.png)

> By [如何选择开源许可证？](https://www.ruanyifeng.com/blog/2011/05/how_to_choose_free_software_licenses.html)

## Linux Common Commands

### View current system info

```bash
lsb_release -a
```

Output:

```bash
Distributor ID:	Debian
Description:	Debian GNU/Linux 10 (buster)
Release:	10
Codename:	buster
```

### View all users

```bash
cat /etc/passwd | grep -v nologin|grep -v halt|grep -v shutdown|awk -F":" '{ print $1"|"$3"|"$4 }'|more
```

### Get Publish IP

```bash
hostname -I
```

### Change user group

```bash
usermod -g groupname username
```

### Get user group

```bash
id -g -n
```

### Remove apt ppa

```bash
sudo add-apt-repository --remove ppa:qbittorrent-team/qbittorrent-stable
```

### Get current shell

```bash
echo "$SHELL"
```

### Get current cpu arch

```bash
arch
```

or

```bash
dpkg --print-architecture
```

### Unzip tar.gz

```bash
tar -xf x.tar.gz
```

See also [here](https://linuxize.com/post/how-to-extract-unzip-tar-gz-file/)

Tar to specific directory

```bash
tar -xf x.tar.gz -C ./xxx
```

### Stdout to File

```bash
command &> file
```

Overwrite:

```bash
command >| file.txt 2>&1
```

### Download/Upload file by SSH SCP

Download to local:

```bash
scp root@ip:/path ~/Downloads
```

### Remove node_modules

```bash
find . -name 'node_modules' -type d -prune -exec rm -rf '{}' +
```

### Remove target

```bash
find . -name 'target' -type d -prune -exec rm -rf '{}' +
```

### Find and replace string

```bash
sed -i 's/old-text/new-text/g' input.txt
```

### Soft Link

```bash
ln -s source_file target_file
```

### Create User

```bash
useradd -m USERNAME
```

> Note: with home directory

### Get all shells

```bash
cat /etc/shells
```

### Last n lines in file

```bash
tail -3 file.txt
```

### Linux find a biggest directory in ./

```bash
sudo du -a ./ 2>/dev/null | sort -n -r | head -n 20
```

### Linux find a biggest file in ./

```bash
find ./ -type f -printf '%s %p\n' | sort -nr | head -10
```

### Linux view systemctl log:

```bash
sudo journalctl -f -u service-name.service
```

### See who connect with Me

See: [here](https://www.linuxshelltips.com/find-ip-addresses-are-connected-to-linux/)

```bash
ss -tun state connected
```

### Sort by ip connect with 443

```bash
netstat -tn 2>/dev/null | grep -E '\s[0-9.]+:443\s' | awk '{print $5}' | cut -d : -f 1 | sort | uniq -c | sort -nr
```

### Ban

See [here](https://docs.rackspace.com/support/how-to/block-an-ip-address-on-a-Linux-server/)

```bash
sudo systemctl status firewalld
sudo firewall-cmd --permanent --add-rich-rule="rule family='ipv4' source address='202.61.254.136' reject"
sudo firewall-cmd --reload
sudo firewall-cmd --list-all
```

### Kill tcp

```bash
tcpkill host <ip>
```

## Nodejs Tips

### Delete node_modules folder recursively from a specified path using command line

> [Delete node_modules folder recursively from a specified path using command line - Stack Overflow](https://stackoverflow.com/questions/42950501/delete-node-modules-folder-recursively-from-a-specified-path-using-command-line)

```bash
find . -name 'node_modules' -type d -prune -exec rm -rf '{}' +
```

### Get NPM Token

```bash
npm token create
```

### Check NPM modules updates

```bash
npx npm-check-updates
```

Update to the latest version:

```bash
npx npm-check-updates -u
```

## Postgresql Tips

### 0. Enter psql

```bash
psql
```

### Show all databases

```bash
\l
```

### Enter Database

```bash
\c database_name
```

### Show all Tables

```bash
\d
```

### Show Table structure

```bash
\d table_name
```

### Pretty print table

```bash
\x on
```

### Alter table

See <https://www.postgresql.org/docs/current/sql-altertable.html>

### Upsert

See <https://stackoverflow.com/questions/61494958/postgres-on-conflict-do-update-only-non-null-values-in-python>

### Export Schema

```bash
 pg_dump database_name -s --no-owner > schema.sql
```

### Export Only data

```bash
 pg_dump database_name -a --no-owner > data.sql
```

### Delete or Drop or Remove Database

```bash
psql
drop database database_name;
```

### Create Database

```bash
psql
CREATE DATABASE name;
```

### Import Database

```bash
psql database_name < data.sql
```

## CSS

### Smart word break in CSS

> From [Smarter word break in CSS? - Stack Overflow](https://stackoverflow.com/a/48830291)

```css
body {
  overflow-wrap: break-word;
  word-wrap: break-word;
  -ms-word-break: break-all;
  word-break: break-word;
  -ms-hyphens: auto;
  -moz-hyphens: auto;
  -webkit-hyphens: auto;
  hyphens: auto;
}
```

## Vim Tips

### Resources

- [Vim online exercises](https://www.vim.so/) - help you master vim with interactive exercises.

### Tips

- Delete all words: `1,$d`

- Current line end: `$`

- Replace all string: `s/string/replace_string/g`

## VS Code Tips

### Open command palette: `⇧⌘P`

### Select current line: `cmd+L`

### Quick Switch Windows

Also see [here](https://stackoverflow.com/questions/37371739/os-x-cycle-between-windows-in-visual-studio-code)

Added the following shortcut to `keybindings.json`

```json
{
  "key": "alt+tab",
  "command": "workbench.action.quickSwitchWindow"
}
```

### Read more:

- [Visual Studio Code Tips and Tricks](https://code.visualstudio.com/docs/getstarted/tips-and-tricks)
- [GitHub - microsoft/vscode-tips-and-tricks: Collection of helpful tips and tricks for VS Code.](https://github.com/microsoft/vscode-tips-and-tricks)
