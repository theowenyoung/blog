#!/bin/bash
export CURRENT_YEAR=$(date +%Y)
export CURRENT_MONTH=$(date +%m)
export CURRENT_DATE=$(date +%d)
export CURRENT_HOUR=$(date +%H)
export CURRENT_MINUTE=$(date +%M)
export CURRENT_SECOND=$(date +%S)


# template functions
function template() {
  template_path="$1"
  target_path="$2"
  target_dir="$(dirname $target_path)"
  # check target dir is exist, if not, create it
  if [ ! -d "$target_dir" ]; then
      mkdir -p $target_dir
  fi

  # check target file is exists
  if [ -f $target_path ]; then
      echo "$target_path file exists"
      exit 1
  fi
  cat $template_path | ./scripts/mo.sh > $target_path
  echo "$target_path created!"
}