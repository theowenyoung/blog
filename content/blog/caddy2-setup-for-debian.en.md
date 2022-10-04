---
title: Caddy2 Setup for Debian
date: 2021-03-26
updated: 2022-03-26
taxonomies:
  categories:
    - Dev
  tags:
    - Self-hosted
---

[Official Site](https://caddyserver.com/v2)

<!-- more -->

## Install

```bash
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo tee /etc/apt/trusted.gpg.d/caddy-stable.asc
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update
sudo apt install caddy
```

Once installed, caddy is running.

The default config file at `/etc/caddy/Caddyfile`

## Resources

- [GitHub - greenpau/caddy-auth-portal: Authentication Plugin for Caddy v2 implementing Form-Based, Basic, Local, LDAP, OpenID Connect, OAuth 2.0 (Github, Google, Facebook, Okta, etc.), SAML Authentication](https://github.com/greenpau/caddy-auth-portal)
- [GitHub - greenpau/caddy-auth-jwt: JWT Authorization Plugin for Caddy v2](https://github.com/greenpau/caddy-auth-jwt)
- [basicauth (Caddyfile directive) — Caddy Documentation](https://caddyserver.com/docs/caddyfile/directives/basicauth#basicauth)
