#!/bin/bash

SCRIPT_DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd );
BIN_DIR="$SCRIPT_DIR/../bin"
binname="mdbook-epub"
mkdir -p $BIN_DIR
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
  cd -- /tmp
  curl -OL https://github.com/theowenyoung/$binname/releases/latest/download/$binname-x86_64-unknown-linux-gnu.tar.gz
  tar -xf /tmp/$binname-x86_64-unknown-linux-gnu.tar.gz -C $BIN_DIR
elif [[ "$OSTYPE" == "darwin"* ]]; then
# Mac OSX
  cd -- /tmp/
  curl -OL https://github.com/theowenyoung/$binname/releases/latest/download/$binname-x86_64-apple-darwin.zip
  unzip -o /tmp/$binname-x86_64-apple-darwin.zip -d $BIN_DIR
fi;

echo Install Success.

echo Run \`make buildbook\` to build to book-dist folder
