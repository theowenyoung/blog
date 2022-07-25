#!/bin/bash
source ./scripts/common.sh
filename=$1
template_path="./scripts/templates/random.md.tmpl"

# if filename not provided, then ask for it
if [ -z "$filename" ]; then
    echo "Please input the filename:(without .md extension)"
    read filename
fi

target_path="./content/blog/$filename.md"

template $template_path $target_path;

code $target_path;