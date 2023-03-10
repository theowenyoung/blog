#!/bin/bash
my_dir="$(dirname "$0")"

source ${my_dir}/common.sh
filename=$1
template_path="${my_dir}/templates/dev.md.tmpl"

# if filename not provided, then ask for it
if [ -z "$filename" ]; then
    echo "Please input the filename:(without .md extension)"
    read filename
fi

# if filename is empty, exit
if [ -z "$filename" ]; then
    echo "Filename cannot be empty"
    exit 0
fi

# title case to kebab case
# check is gsed command exists , if not then use sed
sedcmd="gsed"
if [ ! -x "$(command -v gsed)" ]; then
    sedcmd="sed"
fi
filename=$(echo $filename | $sedcmd "s/ /-/g" | $sedcmd 's/[A-Z]/\L&/g')
target_path="${my_dir}/../content/blog/$filename.md"

template $template_path $target_path

# $TMUX_EDITOR $target_path;
printf "$target_path"
