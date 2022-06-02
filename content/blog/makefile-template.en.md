---
title: Makefile Template
date: 2022-03-26
updated: 2022-04-30
taxonomies:
  categories:
    - Dev
---

Common Makefile Template.

<!-- more -->

```Makefile
.PHONY: start reload stop
start:
	systemctl start caddy
stop:
	systemctl stop caddy
reload:
	systemctl reload caddy
```

## Replace some line

`make set count=5

```bash
set:
	@test $(count)
	@sed -i -e '$(LINE)s/.*/      POST_WEIBO_COUNT: $(count)/' docker-compose.yaml
	@echo Change Count to $(count) Success! Now ready to restart!
	docker-compose up -d
```
