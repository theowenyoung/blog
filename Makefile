.Phony: serve build build-linux test

serve:
	./bin/zola serve

build:
	./bin/zola build

build-linux:
	./bin/linux-zola build

test:
	Deno test