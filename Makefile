.Phony: serve build build-linux test webmention send dev-webmention win

serve:
	./bin/zola serve

win:
	./bin/win-zola.exe serve
build:
	./bin/zola build

build-linux:
	./bin/linux-zola build

test:
	deno test

webmention:
	deno run -A https://deno.land/x/denoflow/cli.ts run
send:
	deno run -A https://deno.land/x/denoflow/cli.ts run send-webmention.yml
dev-webmention:
	deno run -A ../denoflow/denoflow/cli.ts run --force