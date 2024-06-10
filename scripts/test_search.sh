#!/bin/sh

curl \
	-X GET 'https://meilisearch.k3s.owenyoung.com/indexes/owen-blog/documents?limit=50&offset=50' \
	-H "Authorization: Bearer $TEMP_MEILISEARCH_API_KEY" |
	json_pp
