---
title: Caddy File Server Browser with URL Scheme
date: 2022-03-26
updated: 2022-03-26
taxonomies:
  categories:
    - Dev
  tags:
    - Self-hosted
---

Copy the [Template](https://gist.github.com/theowenyoung/e09cb6e2c59f247fdc3f4e6fe4401481) to your local caddy config folder.

This template will display the follow page:
![screenshot](./caddy-file-template-screenshot.png)

```bash
localhost {
  root * /root
  encode gzip
  file_server {
    browse ./file-browser-template-for-caddy.html
    hide .*
  }
}
```
