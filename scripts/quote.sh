#!/bin/bash
set -e
my_dir="$(dirname "$0")"
source "$my_dir/common.sh"
template_path="$my_dir/templates/quote.md.tmpl"
target_path="$my_dir/../content/blog/journals/$(date +%Y-%m-%d-%H-%M).md"

template $template_path $target_path
# $TMUX_EDITOR $target_path;
printf "$target_path"
