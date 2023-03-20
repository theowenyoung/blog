#!/bin/bash

SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)
BIN_DIR="$SCRIPT_DIR/../bin"
mkdir -p $BIN_DIR
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    cd -- /tmp
    curl -OL https://github.com/theowenyoung/zola/releases/download/v0.16.100-20220726/zola-x86_64-unknown-linux-gnu.tar.gz
    tar -xf /tmp/zola-x86_64-unknown-linux-gnu.tar.gz -C $BIN_DIR
elif [[ "$OSTYPE" == "darwin"* ]]; then
    # Mac OSX
    cd -- /tmp/
    curl -OL https://github.com/theowenyoung/zola/releases/download/v0.16.100-20220726/zola-x86_64-apple-darwin.zip
    unzip -o /tmp/zola-x86_64-apple-darwin.zip -d $BIN_DIR
fi

echo Install Success.
echo Run \`make serve\` to serve local

echo Run \`make build\` to build to public folder
