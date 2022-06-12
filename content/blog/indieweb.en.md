---
title: Now, I'm in IndieWeb?
date: 2022-06-12T03:40:31+08:00
updated: 2022-06-12
draft: false
taxonomies:
  categories:
    - Random
  tags:
    - IndieWeb
    - Zola
    - Webmention
---

Since I saw the concept of [IndieWeb](https://indieweb.org/IndieWeb) last year, I've been wanting to support it on [my Zola blog](https://github.com/theowenyoung/blog). Before that my blog had never had a commenting system, and this time with Webmention I was finally able to get a static blog to display responses to articles on the web in plain html. I will document how I did it in this article.

<!-- more -->

> The [IndieWeb](https://indieweb.org/IndieWeb) **IndieWeb** is a community of independent & personal websites connected by simple standards, based on the **[principles](https://indieweb.org/principles "principles")** of: **[owning your domain](https://indieweb.org/personal-domain "personal-domain")** & using it as **[your primary identity](https://indieweb.org/How_to_set_up_web_sign-in_on_your_own_domain "How to set up web sign-in on your own domain")**, **[publishing on your own site (optionally syndicating elsewhere)](https://indieweb.org/POSSE "POSSE")**, and **[owning your data](https://indieweb.org/ownyourdata "ownyourdata")**.

## 1. Support IndieWeb Auth

IndieAuth is a federated login protocol for Web sign-in, so by enabling this, we can use our own domain to sign in to other sites and services which support [IndieAuth](https://indieauth.net/). Learn more about [why IndieAuth](https://indieweb.org/IndieAuth) and [how to IndieAuth](https://indielogin.com/setup), here's how I enabled it:

1. By editing [my index template file](https://github.com/theowenyoung/blog/blob/a8b3cb3c13077b28cbcf7503518f6ed6cb8bb773/templates/base.html#L31-L33), add this to the head:

```html
<link rel="me" href="https://twitter.com/TheOwenYoung" />
<link rel="me" href="https://github.com/theowenyoung" />
<link rel="me" href="mailto:owen@owenyoung.com" />
```

2. Editing Twitter/GitHub profile bio, add my website URL `https://www.owenyoung.com`

3. Test it at <https://indielogin.com/>

## 2. Add Profile Info

When you sign in with IndieAuth or using [web mention](https://indieweb.org/Webmention), some sites will try to get your profile info, like name, image, and bio. So we can add this to our homepage, you can learn more about [h-card](https://indieweb.org/h-card) here. Here's how I added it:

By editing [my index template file](https://github.com/theowenyoung/blog/blob/a8b3cb3c13077b28cbcf7503518f6ed6cb8bb773/templates/base.html#L181-L187), add this in the `aside` (Cause I don't want this to affect the layout of my site, so use css `display: none` to hide it for human, but the bot will see it):

```html
<div class="display-none h-card pt">
  <img class="u-photo icon" alt="Owen"
  src="{{/*get_url(path="site/images/favicon-96x96.png",cachebust=true)*/}}" />
  <a class="p-name u-url" href="{{ config.base_url }}"
    >{{ config.extra.author }}</a
  >
  <p class="p-note">{{ config.extra.bio }}</p>
</div>
```

## 3. Joining [IndieWeb Webring](https://xn--sr8hvo.ws/)

> A webring (or web ring) is a collection of websites linked together in a circular structure, and usually organized around a specific theme, often educational or social. They were popular in the 1990s and early 2000s, particularly among amateur websites.

Now, IndieWeb has one [IndieWeb Webring](https://xn--sr8hvo.ws/)! by adding webring in our sites, so people can find (and be found by) other folks with IndieWeb building blocks on their sites!

So, I'm in it! By joining this, my blog has been listed in the [IndieWeb Webring Directory](https://xn--sr8hvo.ws/directory), you can see I already have [a profile](https://xn--sr8hvo.ws/%F0%9F%93%AE%F0%9F%86%99%F0%9F%93%A9) there.

It's easy to join the webring, just click the [link](https://xn--sr8hvo.ws/), and login with my domain `www.owenyoung.com`, then I can get my webring code, my webring code like this:

```html
<a href="https://xn--sr8hvo.ws/%F0%9F%93%AE%F0%9F%86%99%F0%9F%93%A9/previous"
  >←</a
>
An IndieWeb Webring 🕸💍
<a href="https://xn--sr8hvo.ws/%F0%9F%93%AE%F0%9F%86%99%F0%9F%93%A9/next">→</a>
```

Then, I add this code to [my homepage aside](https://github.com/theowenyoung/blog/blob/a8b3cb3c13077b28cbcf7503518f6ed6cb8bb773/templates/base.html#L216-L218), you can see it on the [aside footer](https://www.owenyoung.com/#bottom)

## 4. Adding [Webmention](https://indieweb.org/Webmention) Response to articles

[Webmention](https://www.w3.org/TR/webmention/) is a web standard for mentions and conversations across the web, a powerful building block that is used for a growing federated network of comments, likes, reposts, and other rich interactions across the decentralized social web.

> "An @ mention that works across websites; so that you don't feel immovable from Twitter or Fb.” — [Rony Ngala](https://twitter.com/rngala/status/852354426983591937)

Learn more about [Webmention](https://indieweb.org/Webmention) and [How to support webmention](https://indieweb.org/Webmention-developer)

Basically, I use [Webmention.io](https://webmention.io) to collect all webmentions about this blog, and then I use [Denoflow](https://github.com/denoflow/denoflow) to cache them to [my blog repo](https://github.com/theowenyoung/blog/tree/main/webmentions), and then I use [Zola](https://www.getzola.org/documentation/templates/overview/#load-data) `load_data` function to load them, and render them.

1. First, go [webmention.io](https://webmention.io) and create a new account with my domain `www.owenyoung.com`, then I can get my webmention endpoint, and I connected my twitter and github account to the service.

2. Second, let other services know your webmention endpoint. Add this to the head:

```html
<link
  rel="webmention"
  href="https://webmention.io/www.owenyoung.com/webmention"
/>
```

3. Use [Denoflow](https://github.com/denoflow/denoflow) to cache all webmentions to [my blog repo](https://github.com/theowenyoung/blog/tree/main/webmentions)

Workflow file([`workflows/fetch-webmention.yml`](https://github.com/theowenyoung/blog/blob/main/workflows/fetch-webmention.yml)):

> Fetch webmention [API](https://github.com/aaronpk/webmention.io#api) to get updates, then save to `webmentions` directory.

```yaml
sources:
  - use: fetch
    args:
      - https://webmention.io/api/mentions.jf2?domain=www.owenyoung.com&per-page=999&token=${{env.WEBMENTION_TOKEN}}
    run: return ctx.result.json()
    itemsPath: children
    key: "wm-id"
filter:
  run: |
    const {ensureDir} = await import("https://deno.land/std@0.121.0/fs/mod.ts");
    const { dirname } = await import("https://deno.land/std@0.121.0/path/mod.ts");
    for(const item of ctx.items){
      const id = item["wm-id"];
      const target = new URL(item["wm-target"]);
      const pathname = target.pathname;
      const filename = pathname.slice(1).replace(/\/$/, "");
      const filepath = "webmentions/"+filename+".json";
      await ensureDir(dirname(filepath));
      let webmentionData = {};
      try {
        const dataString = await Deno.readTextFile(filepath);
        webmentionData = JSON.parse(dataString);
      } catch (_e) {
        // ignore
      }
      webmentionData[id] = item;
      console.log("write file:", filepath);
      await Deno.writeTextFile(filepath, JSON.stringify(webmentionData,null,2));
    }
    return ctx.items.map(()=>true);
```

Github Workflow file([`.github/workflows/denoflow.yml`](https://github.com/theowenyoung/blog/blob/main/.github/workflows/denoflow.yml)):

> Run denoflow every day at midnight, if there are any new updates, it will create a new pull request.

```yaml
name: Denoflow
on:
  repository_dispatch:
  workflow_dispatch:
  # push:
  #   branches:
  #     - main
  schedule:
    - cron: "1 0 * * *"
jobs:
  denoflow:
    runs-on: ubuntu-latest
    concurrency: denoflow
    steps:
      - name: Check out repository code
        uses: actions/checkout@v2
      - uses: denoland/setup-deno@v1
        with:
          deno-version: v1.x
      - run: make webmention
        env:
          WEBMENTION_TOKEN: ${{secrets.WEBMENTION_TOKEN}}
        continue-on-error: true
      - name: chown
        run: sudo chown -R $USER:$USER ./
      - name: git config
        run: git config --global user.name "github-actions[bot]" && git config --global user.email github-actions-bot@users.noreply.github.com
      - name: git add
        run: git add data && git add sources
      - run: git status
      - id: isChanged
        run: git diff-index --cached --quiet HEAD || echo '::set-output name=changed::true'
      - name: Create pull request
        uses: peter-evans/create-pull-request@v3
        if: ${{ steps.isChanged.outputs.changed == 'true' }}
        with:
          token: ${{ secrets.PERSONAL_TOKEN }}
          labels: automerge
          add-paths: data,sources
          commit-message: "chore: new item"
          committer: "github-actions[bot] <github-actions-bot@users.noreply.github.com>"
          author: "github-actions[bot] <github-actions-bot@users.noreply.github.com>"
          branch: new-item
          delete-branch: true
          title: New item update
```

Github auto merge workflow file([`.github/workflows/auto-merge.yml`](https://github.com/theowenyoung/blog/blob/main/.github/workflows/auto-merge.yml)):

> When a pull request is created, the workflow will automatically merge it if the pull request is from the same author

```yaml
name: Auto merge
on:
  workflow_dispatch:
  pull_request_target:
jobs:
  auto-approve:
    runs-on: ubuntu-latest
    steps:
      - name: Merge
        if: (github.actor=='theowenyoung') && (startsWith(github.head_ref,'new-item'))
        uses: "pascalgn/automerge-action@v0.14.3"
        env:
          GITHUB_TOKEN: "${{ secrets.PERSONAL_TOKEN }}"
          MERGE_DELETE_BRANCH: true
          MERGE_LABELS: ""
```

> Cause I don't have too many mentions, so I use [sebastiandedeyne's](https://github.com/sebastiandedeyne/sebastiandedeyne.com/tree/master/data/webmentions) mention data as this article's webmention data.

## 5. Send webmention when you publish a new article

When we publish a new article, we want to send a webmention to the mentioned links. We can do this by using [Denoflow](https://github.com/denoflow/denoflow) and the [Webmention.app](https://webmention.app/) API. [Webmention.app](https://webmention.app/) can check all the mentioned links in the new article and send all webmentions to them.

Before [Webmention.app](https://webmention.app/) can recognize the mentioned links, we need to add some extra [microformats2](https://indieweb.org/microformats2) to our article html. Basically, it's some html tag class names. These took me quite a few time to update my templates, so now I have supported [h-card](https://indieweb.org/h-card), [h-entry](https://indieweb.org/h-entry) and [h-feed](https://indieweb.org/h-feed). It looks like this:

```html
<article class="h-entry">
  <h1 class="p-name">Microformats are amazing</h1>
  <p>
    Published by
    <a class="p-author h-card" href="http://example.com">W. Developer</a> on
    <time class="dt-published" datetime="2013-06-13 12:00:00"
      >13<sup>th</sup> June 2013</time
    >
  </p>
  <p class="p-summary">In which I extoll the virtues of using microformats.</p>
  <div class="e-content">
    <p>Blah blah blah</p>
  </div>
</article>
```

I have updated [page.html](https://github.com/theowenyoung/blog/blob/main/templates/page.html), [index.html](https://github.com/theowenyoung/blog/blob/main/templates/index.html), [taxonomy_single.html](https://github.com/theowenyoung/blog/blob/main/templates/taxonomy_single.html) and [section.html](https://github.com/theowenyoung/blog/blob/main/templates/section.html) to support these new microformats. I have to say this is the most demanding job, good luck!

Once finished, I went to [indiewebify](https://indiewebify.me/) to test if it can recognize my new microformats. It works!

Next, I went to [webmention.app](https://webmention.app/token) to apply for a token. Then I can add a denoflow workflow file to fetch it's service every day.

Here is the workflow file([`workflows/send-webmention.yml`](https://github.com/theowenyoung/blog/blob/main/workflows/send-webmention.yml)):

```yaml
sources:
  - from: https://deno.land/x/denoflow@0.0.35/sources/rss.ts
    args:
      - https://www.owenyoung.com/blog/atom.xml
  - from: https://deno.land/x/denoflow@0.0.35/sources/rss.ts
    args:
      - https://www.owenyoung.com/en/blog/atom.xml
steps:
  - use: fetch
    args:
      - https://webmention.app/check?token=${{ctx.env.WEBMENTION_APP_TOKEN}}&url=${{encodeURIComponent(ctx.item.links[0].href)}}
      - method: GET
        headers:
          Content-Type: application/json
    run: |
      console.log(ctx.item.links[0].href);
      const json = await ctx.result.json();
      console.log(json);
```

Don't forget to add enviroment variables `WEBMENTION_APP_TOKEN` to your denoflow workflow file(`.github/workflows/denoflow.yml`).

```yaml
- run: deno run -A https://deno.land/x/denoflow/cli.ts run
  env:
    WEBMENTION_TOKEN: ${{secrets.WEBMENTION_TOKEN}}
    WEBMENTION_APP_TOKEN: ${{secrets.WEBMENTION_APP_TOKEN}}
```

## Conclusion

I really like the concept of IndieWeb and their API design philosophy, it took some time but I still think it was worth it. It gave me renewed confidence in the Internet.

You can find the all source code of this blog on [Github](https://github.com/theowenyoung/blog)

## Resources

- [Bird.gy](https://brid.gy/) - Bridgy connects your web site to social media.
  Likes, retweets, mentions, cross-posting
- [Indie Webring](https://xn--sr8hvo.ws/)
- [Telegraph](https://telegraph.p3k.io/) - Easily send Webmentions from your website
- [Webmention.app](https://webmention.app/) - Automate your outgoing webmentions
- [Webmention.io](https://webmention.io/) - Webmention.io is a hosted service created to easily receive webmentions on any web page.
- [Fediring](https://fediring.net/)
- [Webmentions on a static site with GitHub Actions](https://sebastiandedeyne.com/webmentions-on-a-static-site-with-github-actions/)
