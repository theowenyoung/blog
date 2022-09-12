#!/bin/bash
source ./scripts/common.sh
template_path="./scripts/templates/daily.md.tmpl"
target_path="./content/blog/journals/$(date +%Y-%m-%d).en.md"

template $template_path $target_path;
kakproject $target_path;
