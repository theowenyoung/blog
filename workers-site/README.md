# Cloudflare Workers

尝试在 Cloudflare 里部署静态网站，相当于把网页的 html 存储到 cloudflare 的 kv 里。

因为我不想在前端注入统计之类的 js 骚扰用户，cloudflare 的 workers 可以提供一种更轻量的办法，基本上拥有静态博客的所有好处，同时可以在里面添加一点点基本的统计逻辑。

但是我现在还没找到可用的轻量 cloudflare 统计库，所以暂时先不搞。
