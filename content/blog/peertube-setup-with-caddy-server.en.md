---
title: Peertube Setup with Caddy Server
date: 2020-03-26
updated: 2022-03-26
taxonomies:
  categories:
    - Dev
  tags:
    - Self-hosted
---

Peertube is an activityPub-federated video streaming platform using P2P directly in your web browser.

<!-- more -->

Also see [here](https://github.com/Chocobozzz/PeerTube/blob/develop/support/doc/production.md)

## Pre Requirement

1. [Debian Server Setup](@/blog/debian-server-setup.en.md)
2. [Caddy2 Setup for Debian](@/blog/caddy2-setup-for-debian.en.md)
3. [Nodejs Setup for Debian](@/blog/nodejs-setup-for-debian.en.md)
4. Install yarn, and be sure to have [a recent version](https://github.com/yarnpkg/yarn/releases/latest):
   [https://yarnpkg.com/en/docs/install#linux-tab](https://yarnpkg.com/en/docs/install#linux-tab)

```bash
sudo npm i -g yarn
```

4. Install Python:

On Ubuntu <= bionic (18.04 LTS) or Debian <= Buster:

```
sudo apt update
sudo apt install python-dev
python --version # Should be >= 2.x or >= 3.x
```

On Ubuntu >= focal (20.04 LTS) or Debian >= Bullseye:

```
sudo apt update
sudo apt install python3-dev python-is-python3 # python-is-python2 should also work
python --version # Should be >= 2.x or >= 3.x
```

## Install

1. Install common dependencies:

```
sudo apt update
sudo apt install certbot nginx ffmpeg postgresql postgresql-contrib openssl g++ make redis-server git cron wget
ffmpeg -version # Should be >= 4.1
g++ -v # Should be >= 5.x
```

Now that dependencies are installed, before running PeerTube you should start PostgreSQL and Redis:

```
sudo systemctl start redis postgresql
```

### PeerTube user

Create a `peertube` user with `/var/www/peertube` home:

```
$ sudo useradd -m -d /var/www/peertube -s /bin/bash -p peertube peertube
```

Set its password:

```
$ sudo passwd peertube
```

### Database

Create the production database and a peertube user inside PostgreSQL:

```
$ cd /var/www/peertube
$ sudo -u postgres createuser -P peertube
```

For password you can use `peertube` from the default config yaml.

Here you should enter a password for PostgreSQL `peertube` user, that should be copied in `production.yaml` file.
Don't just hit enter else it will be empty.

```
$ sudo -u postgres createdb -O peertube -E UTF8 -T template0 peertube_prod
```

Then enable extensions PeerTube needs:

```
$ sudo -u postgres psql -c "CREATE EXTENSION pg_trgm;" peertube_prod
$ sudo -u postgres psql -c "CREATE EXTENSION unaccent;" peertube_prod
```

### Prepare PeerTube directory

Fetch the latest tagged version of Peertube

```
$ VERSION=$(curl -s https://api.github.com/repos/chocobozzz/peertube/releases/latest | grep tag_name | cut -d '"' -f 4) && echo "Latest Peertube version is $VERSION"
```

Open the peertube directory, create a few required directories

```
$ cd /var/www/peertube
$ sudo -u peertube mkdir config storage versions
$ sudo -u peertube chmod 750 config/
```

Download the latest version of the Peertube client, unzip it and remove the zip

```
$ cd /var/www/peertube/versions
$ sudo -u peertube wget -q "https://github.com/Chocobozzz/PeerTube/releases/download/${VERSION}/peertube-${VERSION}.zip"
$ sudo -u peertube unzip -q peertube-${VERSION}.zip && sudo -u peertube rm peertube-${VERSION}.zip
```

Install Peertube:

```
cd /var/www/peertube
sudo -u peertube ln -s versions/peertube-${VERSION} ./peertube-latest
cd ./peertube-latest
sudo -H -u peertube yarn install --production --pure-lockfile
```

### PeerTube configuration

Copy the default configuration file that contains the default configuration provided by PeerTube.
You **must not** update this file.

```
$ cd /var/www/peertube
$ sudo -u peertube cp peertube-latest/config/default.yaml config/default.yaml
```

Now copy the production example configuration:

```
$ cd /var/www/peertube
$ sudo -u peertube cp peertube-latest/config/production.yaml.example config/production.yaml
```

Then edit the `config/production.yaml` file according to your webserver
and database configuration (`webserver`, `database`, `redis`, `smtp` and `admin.email` sections in particular).
Keys defined in `config/production.yaml` will override keys defined in `config/default.yaml`.

**PeerTube does not support webserver host change**. Even though [PeerTube CLI can help you to switch hostname](https://docs.joinpeertube.org/maintain-tools?id=update-hostjs) there's no official support for that since it is a risky operation that might result in unforeseen errors.

### Webserver

We only provide official configuration files for Nginx.

Copy the nginx configuration template:

```
$ sudo /etc/nginx/sites-available/peertube
```

with the following config:

```conf
# Minimum Nginx version required:  1.13.0 (released Apr 25, 2017)
# Please check your Nginx installation features the following modules via 'nginx -V':
# STANDARD HTTP MODULES: Core, Proxy, Rewrite, Access, Gzip, Headers, HTTP/2, Log, Real IP, SSL, Thread Pool, Upstream, AIO Multithreading.
# THIRD PARTY MODULES:   None.

upstream backend {
  server 127.0.0.1:9000;
}

server {
  listen 8880;
  listen [::]:8880;
  access_log /var/log/nginx/peertube.access.log; # reduce I/0 with buffer=10m flush=5m
  error_log  /var/log/nginx/peertube.error.log;

  ##
  # Certificates
  # you need a certificate to run in production. see https://letsencrypt.org/
  ##

  location @api {
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header Host  $host;
    proxy_set_header X-Real-IP       $remote_addr;

    client_max_body_size  100k; # default is 1M

    proxy_connect_timeout 10m;
    proxy_send_timeout    10m;
    proxy_read_timeout    10m;
    send_timeout          10m;

    proxy_pass http://backend;
  }

  location / {
    try_files /dev/null @api;
  }

  location = /api/v1/videos/upload-resumable {
    client_max_body_size    0;
    proxy_request_buffering off;

    try_files /dev/null @api;
  }

  location = /api/v1/videos/upload {
    limit_except POST HEAD { deny all; }

    # This is the maximum upload size, which roughly matches the maximum size of a video file.
    # Note that temporary space is needed equal to the total size of all concurrent uploads.
    # This data gets stored in /var/lib/nginx by default, so you may want to put this directory
    # on a dedicated filesystem.
    client_max_body_size                      12G; # default is 1M
    add_header            X-File-Maximum-Size 8G always; # inform backend of the set value in bytes before mime-encoding (x * 1.4 >= client_max_body_size)

    try_files /dev/null @api;
  }

  location ~ ^/api/v1/(videos|video-playlists|video-channels|users/me) {
    client_max_body_size                      6M; # default is 1M
    add_header            X-File-Maximum-Size 4M always; # inform backend of the set value in bytes before mime-encoding (x * 1.4 >= client_max_body_size)

    try_files /dev/null @api;
  }

  ##
  # Websocket
  ##

  location @api_websocket {
    proxy_http_version 1.1;
    proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header   Host            $host;
    proxy_set_header   X-Real-IP       $remote_addr;
    proxy_set_header   Upgrade         $http_upgrade;
    proxy_set_header   Connection      "upgrade";

    proxy_pass http://backend;
  }

  location /socket.io {
    try_files /dev/null @api_websocket;
  }

  location /tracker/socket {
    # Peers send a message to the tracker every 15 minutes
    # Don't close the websocket before then
    proxy_read_timeout 15m; # default is 60s

    try_files /dev/null @api_websocket;
  }

  ##
  # Performance optimizations
  # For extra performance please refer to https://github.com/denji/nginx-tuning
  ##

  root /var/www/peertube/storage;

  # Enable compression for JS/CSS/HTML, for improved client load times.
  # It might be nice to compress JSON/XML as returned by the API, but
  # leaving that out to protect against potential BREACH attack.
  gzip              on;
  gzip_vary         on;
  gzip_types        # text/html is always compressed by HttpGzipModule
                    text/css
                    application/javascript
                    font/truetype
                    font/opentype
                    application/vnd.ms-fontobject
                    image/svg+xml;
  gzip_min_length   1000; # default is 20 bytes
  gzip_buffers      16 8k;
  gzip_comp_level   2; # default is 1

  client_body_timeout       30s; # default is 60
  client_header_timeout     10s; # default is 60
  send_timeout              10s; # default is 60
  keepalive_timeout         10s; # default is 75
  resolver_timeout          10s; # default is 30
  reset_timedout_connection on;
  proxy_ignore_client_abort on;

  tcp_nopush                on; # send headers in one piece
  tcp_nodelay               on; # don't buffer data sent, good for small data bursts in real time

  # If you have a small /var/lib partition, it could be interesting to store temp nginx uploads in a different place
  # See https://nginx.org/en/docs/http/ngx_http_core_module.html#client_body_temp_path
  #client_body_temp_path /var/www/peertube/storage/nginx/;

  # Bypass PeerTube for performance reasons. Optional.
  # Should be consistent with client-overrides assets list in /server/controllers/client.ts
  location ~ ^/client/(assets/images/(icons/icon-36x36\.png|icons/icon-48x48\.png|icons/icon-72x72\.png|icons/icon-96x96\.png|icons/icon-144x144\.png|icons/icon-192x192\.png|icons/icon-512x512\.png|logo\.svg|favicon\.png))$ {
    add_header Cache-Control "public, max-age=31536000, immutable"; # Cache 1 year

    root /var/www/peertube;

    try_files /storage/client-overrides/$1 /peertube-latest/client/dist/$1 @api;
  }

  # Bypass PeerTube for performance reasons. Optional.
  location ~ ^/client/(.*\.(js|css|png|svg|woff2|otf|ttf|woff|eot))$ {
    add_header Cache-Control "public, max-age=31536000, immutable"; # Cache 1 year

    alias /var/www/peertube/peertube-latest/client/dist/$1;
  }

  # Bypass PeerTube for performance reasons. Optional.
  location ~ ^/static/(thumbnails|avatars)/ {
    if ($request_method = 'OPTIONS') {
      add_header Access-Control-Allow-Origin  '*';
      add_header Access-Control-Allow-Methods 'GET, OPTIONS';
      add_header Access-Control-Allow-Headers 'Range,DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type';
      add_header Access-Control-Max-Age       1728000; # Preflight request can be cached 20 days
      add_header Content-Type                 'text/plain charset=UTF-8';
      add_header Content-Length               0;
      return 204;
    }

    add_header Access-Control-Allow-Origin    '*';
    add_header Access-Control-Allow-Methods   'GET, OPTIONS';
    add_header Access-Control-Allow-Headers   'Range,DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type';
    add_header Cache-Control                  "public, max-age=7200"; # Cache response 2 hours

    rewrite ^/static/(.*)$ /$1 break;

    try_files $uri @api;
  }

  # Bypass PeerTube for performance reasons. Optional.
  location ~ ^/static/(webseed|redundancy|streaming-playlists)/ {
    limit_rate_after            5M;

    # Clients usually have 4 simultaneous webseed connections, so the real limit is 3MB/s per client
    set $peertube_limit_rate    800k;

    # Increase rate limit in HLS mode, because we don't have multiple simultaneous connections
    if ($request_uri ~ -fragmented.mp4$) {
      set $peertube_limit_rate  5M;
    }

    # Use this line with nginx >= 1.17.0
    #limit_rate $peertube_limit_rate;
    # Or this line if your nginx < 1.17.0
    set $limit_rate $peertube_limit_rate;

    if ($request_method = 'OPTIONS') {
      add_header Access-Control-Allow-Origin  '*';
      add_header Access-Control-Allow-Methods 'GET, OPTIONS';
      add_header Access-Control-Allow-Headers 'Range,DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type';
      add_header Access-Control-Max-Age       1728000; # Preflight request can be cached 20 days
      add_header Content-Type                 'text/plain charset=UTF-8';
      add_header Content-Length               0;
      return 204;
    }

    if ($request_method = 'GET') {
      add_header Access-Control-Allow-Origin  '*';
      add_header Access-Control-Allow-Methods 'GET, OPTIONS';
      add_header Access-Control-Allow-Headers 'Range,DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type';

      # Don't spam access log file with byte range requests
      access_log off;
    }

    # Enabling the sendfile directive eliminates the step of copying the data into the buffer
    # and enables direct copying data from one file descriptor to another.
    sendfile on;
    sendfile_max_chunk 1M; # prevent one fast connection from entirely occupying the worker process. should be > 800k.
    aio threads;

    rewrite ^/static/webseed/(.*)$ /videos/$1 break;
    rewrite ^/static/(.*)$         /$1        break;

    try_files $uri @api;
  }
}
```

Add caddy config:

```conf
example.com {
	reverse_proxy 127.0.0.1:8880
}
```

Then modify the webserver configuration file. Please pay attention to the `alias` keys of the static locations.
It should correspond to the paths of your storage directories (set in the configuration file inside the `storage` key).

```
$ sudo vim /etc/nginx/sites-available/peertube
```

Activate the configuration file:

```
$ sudo ln -s /etc/nginx/sites-available/peertube /etc/nginx/sites-enabled/peertube
```

To generate the certificate for your domain as required to make https work you can use [Let's Encrypt](https://letsencrypt.org/):

```
$ sudo systemctl stop nginx
$ sudo certbot certonly --standalone --post-hook "systemctl restart nginx"
$ sudo systemctl reload nginx
```

Now you have the certificates you can reload nginx:

```
$ sudo systemctl reload nginx
```

Certbot should have installed a cron to automatically renew your certificate.
Since our nginx template supports webroot renewal, we suggest you to update the renewal config file to use the `webroot` authenticator:

```
$ # Replace authenticator = standalone by authenticator = webroot
$ # Add webroot_path = /var/www/certbot
$ sudo vim /etc/letsencrypt/renewal/your-domain.com.conf
```

### TCP/IP Tuning

**On Linux**

```
$ sudo cp /var/www/peertube/peertube-latest/support/sysctl.d/30-peertube-tcp.conf /etc/sysctl.d/
$ sudo sysctl -p /etc/sysctl.d/30-peertube-tcp.conf
```

Your distro may enable this by default, but at least Debian 9 does not, and the default FIFO
scheduler is quite prone to "Buffer Bloat" and extreme latency when dealing with slower client
links as we often encounter in a video server.

### systemd

If your OS uses systemd, copy the configuration template:

```
$ sudo cp /var/www/peertube/peertube-latest/support/systemd/peertube.service /etc/systemd/system/
```

Check the service file (PeerTube paths and security directives):

```
$ sudo vim /etc/systemd/system/peertube.service
```

Tell systemd to reload its config:

```
$ sudo systemctl daemon-reload
```

If you want to start PeerTube on boot:

```
$ sudo systemctl enable peertube
```

Run:

```
$ sudo systemctl start peertube
$ sudo journalctl -feu peertube
```

Run:

```
$ sudo service peertube start
```

### Administrator

The administrator password is automatically generated and can be found in the PeerTube
logs (path defined in `production.yaml`). You can also set another password with:

```
$ cd /var/www/peertube/peertube-latest && NODE_CONFIG_DIR=/var/www/peertube/config NODE_ENV=production npm run reset-password -- -u root
```

Alternatively you can set the environment variable `PT_INITIAL_ROOT_PASSWORD`,
to your own administrator password, although it must be 6 characters or more.

### What now?

Now your instance is up you can:

- Add your instance to the public PeerTube instances index if you want to: https://instances.joinpeertube.org/
- Check [available CLI tools](/support/doc/tools.md)

## Upgrade

### PeerTube instance

**Check the changelog (in particular BREAKING CHANGES!):** https://github.com/Chocobozzz/PeerTube/blob/develop/CHANGELOG.md

#### Auto

The password it asks is PeerTube's database user password.

```
$ cd /var/www/peertube/peertube-latest/scripts && sudo -H -u peertube ./upgrade.sh
$ sudo systemctl restart peertube # Or use your OS command to restart PeerTube if you don't use systemd
```

#### Manually

Make a SQL backup

```
$ SQL_BACKUP_PATH="backup/sql-peertube_prod-$(date -Im).bak" && \
    cd /var/www/peertube && sudo -u peertube mkdir -p backup && \
    sudo -u postgres pg_dump -F c peertube_prod | sudo -u peertube tee "$SQL_BACKUP_PATH" >/dev/null
```

Fetch the latest tagged version of Peertube:

```
$ VERSION=$(curl -s https://api.github.com/repos/chocobozzz/peertube/releases/latest | grep tag_name | cut -d '"' -f 4) && echo "Latest Peertube version is $VERSION"
```

Download the new version and unzip it:

```
$ cd /var/www/peertube/versions && \
    sudo -u peertube wget -q "https://github.com/Chocobozzz/PeerTube/releases/download/${VERSION}/peertube-${VERSION}.zip" && \
    sudo -u peertube unzip -o peertube-${VERSION}.zip && \
    sudo -u peertube rm peertube-${VERSION}.zip
```

Install node dependencies:

```
$ cd /var/www/peertube/versions/peertube-${VERSION} && \
    sudo -H -u peertube yarn install --production --pure-lockfile
```

Copy new configuration defaults values and update your configuration file:

```
$ sudo -u peertube cp /var/www/peertube/versions/peertube-${VERSION}/config/default.yaml /var/www/peertube/config/default.yaml
$ diff /var/www/peertube/versions/peertube-${VERSION}/config/production.yaml.example /var/www/peertube/config/production.yaml
```

Change the link to point to the latest version:

```
$ cd /var/www/peertube && \
    sudo unlink ./peertube-latest && \
    sudo -u peertube ln -s versions/peertube-${VERSION} ./peertube-latest
```

### nginx

Check changes in nginx configuration:

```
$ cd /var/www/peertube/versions
$ diff "$(ls --sort=t | head -2 | tail -1)/support/nginx/peertube" "$(ls --sort=t | head -1)/support/nginx/peertube"
```

### systemd

Check changes in systemd configuration:

```
$ cd /var/www/peertube/versions
$ diff "$(ls --sort=t | head -2 | tail -1)/support/systemd/peertube.service" "$(ls --sort=t | head -1)/support/systemd/peertube.service"
```

### Restart PeerTube

If you changed your nginx configuration:

```
$ sudo systemctl reload nginx
```

If you changed your systemd configuration:

```
$ sudo systemctl daemon-reload
```

Restart PeerTube and check the logs:

```
$ sudo systemctl restart peertube && sudo journalctl -fu peertube
```

### Things went wrong?

Change `peertube-latest` destination to the previous version and restore your SQL backup:

```
$ OLD_VERSION="v0.42.42" && SQL_BACKUP_PATH="backup/sql-peertube_prod-2018-01-19T10:18+01:00.bak" && \
    cd /var/www/peertube && sudo -u peertube unlink ./peertube-latest && \
    sudo -u peertube ln -s "versions/peertube-$OLD_VERSION" peertube-latest && \
    sudo -u postgres pg_restore -c -C -d postgres "$SQL_BACKUP_PATH" && \
    sudo systemctl restart peertube
```
