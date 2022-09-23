#!/bin/bash
my_dir="$(dirname "$0")"

source ${my_dir}/common.sh
filename=$1
template_path="${my_dir}/templates/random.md.tmpl"

# if filename not provided, then ask for it
if [ -z "$filename" ]; then
    echo "Please input the filename:(without .md extension)"
    read filename
fi

target_path="${my_dir}/../content/blog/$filename.md"

template $template_path $target_path;

$TMUX_EDITOR $target_path;
