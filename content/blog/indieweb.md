---
title: Now, I'm in IndieWeb?
date: 2022-06-12T03:40:31+08:00
updated: 2022-06-12
draft: true
taxonomies:
  categories:
    - Random
  tags:
    - IndieWeb
    - Zola
---

[IndieWeb](https://indieweb.org/IndieWeb)

Zola,

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
  <img class="u-photo icon" alt="Owen" src="{{
  get_url(path="site/images/favicon-96x96.png",cachebust=true) }}" />
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

## 4. Adding [Webmention](https://indieweb.org/Webmention)

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

Workflow file:

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

## Resources

- [Telegraph](https://telegraph.p3k.io/) - Easily send Webmentions from your website
- [Webmentions on a static site with GitHub Actions](https://sebastiandedeyne.com/webmentions-on-a-static-site-with-github-actions/)
