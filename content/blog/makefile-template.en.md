---
title: Makefile Template
date: 2022-03-26
updated: 2022-03-26
taxonomies:
  categories:
    - Dev
---


```Makefile
.PHONY: start reload stop
start:
	systemctl start caddy
stop:
	systemctl stop caddy
reload:
	systemctl reload caddy
```
