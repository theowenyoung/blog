ifneq (,$(wildcard ./.env))
    include .env
    export
endif
.Phon: serve build test webmention send dev-webmention win prod-serve

serve:
	./bin/zola serve -p 8000 --drafts

prod-serve:
	./bin/zola serve -p 8000

build:
	./bin/zola build

.Phony: buildbook
buildbook:
	deno run -A ./book/build.ts

.Phony: servebook
servebook:
	deno run -A ./book/build.ts --serve

.Phony: installbook
installbook:
	./scripts/install_mdbook-epub.sh


test:
	deno test

webmention:
	deno run -A https://deno.land/x/denoflow/cli.ts run
send:
	deno run -A https://deno.land/x/denoflow/cli.ts run send-webmention.yml
dev-webmention:
	deno run -A ../denoflow/denoflow/cli.ts run --force

.Phony: install
install:
	./scripts/install_zola.sh

.Phony: daily
daily:
	./scripts/daily.sh

.Phony: random
random:
	./scripts/random.sh $(name)

.Phony: book
book:
	./scripts/book.sh $(name)

.Phony: notes
notes:
	./scripts/notes.sh $(name)
.Phony: tt
tt:
	echo tt "${NVIM}"

.Phony: prod-upload
prod-upload:
	make prod-zipdb && aws s3 cp ./prod-db.zip  s3://blog/prod-db.zip --endpoint-url $(AWS_ENDPOINT) 

.Phony: prod-load
prod-load:
	aws s3 cp s3://blog/prod-db.zip ./prod-db.zip --endpoint-url $(AWS_ENDPOINT) && make prod-unzipdb

.Phony: prod-zipdb
prod-zipdb:
	zip -r -q -FS prod-db.zip ./data ./webmentions -x "*/.*"

.Phony: prod-unzipdb
prod-unzipdb:
	unzip -q -o prod-db.zip

.Phony: tag
tag:
	git tag -a v$(v) -m "tag v$(v)" && git push
