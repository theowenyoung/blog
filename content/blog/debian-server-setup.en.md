---
title: Debian Server Setup
date: 2021-03-26
updated: 2022-03-26
taxonomies:
  categories:
    - Dev
  tags:
    - Debian
---

> For linux common commands, see [开发技巧收藏](@/dev-tips/index.md#linux-common-commands)

<!-- more -->

1. Update Source

   ```bash
   apt update --yes && apt upgrade --yes
   ```

2. Install sudo package

   ```bash
   apt install -y sudo
   ```

3. Open BBR: [Open BBR for Debian](@/blog/open-bbr-for-debian.en.md)

4. Use ssh key login instead of password, for more details see [How To Configure SSH Key-Based Authentication on a Linux Server](https://www.digitalocean.com/community/tutorials/how-to-configure-ssh-key-based-authentication-on-a-linux-server)

5. In your local machine:

```bash
ssh-copy-id -i ~/.ssh/id_rsa.pub username@remote_host
```

> This will copy your id_rsa.pub to remote machine `~/.ssh/authorized_keys`

3. Change the default password

   1. `passwd`

4. Create an admin group
   1. `groupadd admin`
   2. Give admin group root access, and no password sudo
      1. Backup sudo files `cp /etc/sudoers /root/sudoers.bak`
      2. Edit the `/etc/sudoers` file by typing the command: `visudo`
      3. Add `%admin ALL=(ALL:ALL) NOPASSWD:ALL` after `sudo` group
5. Create a admin group user
   1. `useradd username -g admin`
6. Use ssh key login instead of password for normal user
   1. `ssh-copy-id -i ~/.ssh/id_rsa.pub username@remote_host`
7. Login with new normal user `ssh username@ip`
8. Install common utils:
   1. `sudo apt install build-essential software-properties-common curl vim unzip git pkg-config libssl-dev --yes`
9. Create `/data` for store data files with `777` permissions, avoid to use `/home` directory

You might want to read also:

- [Shadowsocks Rust Setup for Debian](@/blog/shadowsocks-rust-setup-for-debian.en.md)
- [Caddy2 Setup for Debian](@/blog/caddy2-setup-for-debian.en.md)
