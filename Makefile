.Phony: serve build build-linux

serve:
	./bin/zola serve

build:
	./bin/zola build

build-linux:
	./bin/linux-zola build