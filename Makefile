.Phony: serve build build-linux test webmention

serve:
	./bin/zola serve

build:
	./bin/zola build

build-linux:
	./bin/linux-zola build

test:
	deno test

webmention:
	deno run -A https://deno.land/x/denoflow/cli.ts run
dev-webmention:
	deno run -A ../denoflow/denoflow/cli.ts run --force