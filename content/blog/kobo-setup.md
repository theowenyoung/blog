---
title: 我的 Kobo 电子书阅读器设置
date: 2023-12-03T19:59:07+08:00
updated: 2023-12-03
taxonomies:
  categories:
    - Random
  tags:
    - Ebook
---

双11的时候入手了一个 [Kobo Libra2](https://us.kobobooks.com/products/kobo-libra-2), 一直没找到时间鼓捣，这周终于有时间自定义了一下了，毕竟我购买这个设备就是为了更方便的使用 epub 格式的电子书，以及能比 Kindle 多一点可以 Hack 的部分。这篇文章记录一下我的设置，以防下次需要重置。

我目前还没有深入使用，所以还不确定这个墨水屏电子书阅读器值不值得推荐，所以本文只记录我的设置过程。

<!-- more -->

Kobo 的 Hack 过程比较好做，因为官方留了一个口子给第三方插件，基本上安装任何第三方插件，都只需要连接 usb （你的电脑文件夹要能显示隐藏文件，也就是`.` 开头的文件）。一般来说，第三方插件会提供一个名字是`KoboRoot.tgz`的安装包，你需要把它拖到 kobo 存储盘里的 `.kobo`文件夹，然后安全弹出 Kobo USB 设备，再等待几秒就可以了。

Kobo 会自动检测 `KoboRoot.tgz` 文件，然后运行里面的安装程序。一般来说，第三方程序并不会影响 Kobo 的主系统，他们只是额外安装了自己，和主系统完美共存。

目前比较热门的第三方程序有：

- [koreader](https://github.com/koreader/koreader) - 可以高度定制的一个阅读器客户端，还有安卓版。有非常多的功能，比如支持 calibre 无线传输，RSS，[Wallbag](https://github.com/wallabag/wallabagger) 等等等等
- [Plato](https://github.com/baskerville/plato) - 一个简约的阅读器，性能好，用Rust编写，功能相对较少，但够用，还附带有一个计算器和涂写的小工具。还有一个选中高亮便捷自动调整范围的小特性，（经常用墨水屏阅读器的人应该深有体会，很难精确的选中一个段落，所以这个特性我特别喜欢）
- [kobocloud](https://github.com/fsantini/KoboCloud) 可以自动同步 Dropbox, Google Drive, Next Cloud 的书籍到 Kobo 上。

这三个我都试用了一下，最后还是放弃了 koreader, 功能真的太多了...所以使用起来几乎是一头雾水，界面也有点一言难尽，性能也没有 Plato 好，所以我决定只安装 KoboCloud 和 Plato.

下面记录下我的安装和设置过程：

## 1. 打开开发者模式

这不是必须的，但是我建议一开始就开启，这样可以通过 `telnet` 进系统里四处看看已熟悉整个文件夹构造。

开启这个，会让我们的【设置】【测试版功能】里多一些功能，甚至还有一些小游戏。

只需要在 Kobo 的搜索框里输入 `devmodeon`, 即可自动打开。注意，kobo不会给你任何提示，我当时也一直疑惑怎么输入这个对我无效，原来是只要输入，按下回车键就好了，具体可以去【设置】【测试版功能】里面查看有没有数独小游戏入口来确认有没有开启成功。实验功能里面还有一个 Sketchpad 很实用，可以用手指写写画画，我打算把这个添加到我的 NickelMenu 菜单里。

同时在【设置】【设备信息】里面会多出来一个选项 【Developer options】 里面有很多选项可以用。

[这个教程](https://www.mobileread.com/forums/showthread.php?t=336175) 有更多关于开发的信息。

最常用的是用 telnet 连接到该机器，这样就能远程操控了，（可以在【设置】【设备信息】里获取当前的kobo ip），点击【wiki】图标，并保持菜单打开，可以让网络不断开。

```
telnet 192.168.50.212
```

输入 `root` 用户即可，没有密码

## 2. 调整 Kobo 的自动扫描设置

由于最新版本的 Kobo 会自动扫描所有隐藏文件夹，但是我们即将要安装的插件都是放在 `.` 开头的隐藏文件夹里，会让主屏幕识别出很多无效的图片文件，所以我们需要编辑设置文件，禁止这个行为。

重新插拔 USB 连接Kobo 之后，打开主目录，找到 `.kobo/Kobo/Kobo\ eReader.conf` 文件，用你喜欢的编辑器，在最后一行添加如下设置：

```
[FeatureSettings]
ExcludeSyncFolders=(\\.(?!kobo|adobe).+|([^.][^/]*/)+\\..+)
```

编辑完成之后，安全弹出设备，耐心等待几秒，等待系统应用该配置文件。

> 不知道是错觉，还是什么，因为我尝试的次数比较多，似乎某些时候更改配置不生效，所以你可以重新插拔一下USB，再次打开该配置文件，确实是否生效。
>
> Kobo 会重新排序配置，所以虽然你刚刚在最后一行添加的配置，Kobo 会重新格式化到 字母顺序排列。

## 3. 安装 [Kobo Cloud](https://github.com/fsantini/KoboCloud)

这个工具用于同步 Google Drive 文件夹里的图书到 kobo 设备里，因为我很不喜欢每次都需要用 USB 连接才能传输书，这个方案来同步书是最方便的。这样以后只需要把图书上传到 Google Drive 里面的指定文件夹，Kobo就能自动同步图书了。

重新插拔USB，按照项目文档里的[说明](https://github.com/fsantini/KoboCloud)安装即可。

我使用Google Drive 来同步，下面是我的设置：

```
# Add your URLs to this file

https://drive.google.com/drive/folders/your-unique-link?usp=sharing

# Remove the # from the following line to uninstall KoboCloud
#UNINSTALL
# Remove the # from the following line to delete files when they are no longer on the remote server
REMOVE_DELETED
```

然后，安全弹出 Kobo 设备，此时 Kobo 会自动安装该插件。

**安装之后如何使用？**

当上传新的 epub 到Google Drive 之后，开关一下 Wifi 即可触发同步和导入。

## 4. 安装 [Plato](https://github.com/baskerville/plato)

> 目前发现 Plato 在渲染 Epub 方面还是有点问题，我在沉浸式翻译里翻译的 epub 的换行符没法正确显示，我在 [issue](https://github.com/baskerville/plato/issues/180#issuecomment-1837883563) 里贴了相关代码, 所以目前还是官方的阅读器比较爽，但是官方的阅读器打开epub特别慢，我要想办法把 epub 自动转为 kepub 才行。

重新插拔一下 USB，在设备上允许连接到电脑。

使用官方安装说明中给出的这个[一键安装脚本](https://www.mobileread.com/forums/showthread.php?t=314220) 来安装plato

1. 下载帖子1 里面的 Plato 压缩包
2. 下载帖子2 里面的一键安装脚本到同一个目录，解压到当前目录
3. 在命令行里运行该脚本，mac是 `./install.command`

选择 安装 plato 即可（0）。

该安装包会同时帮你安装另外两个必须的插件，一个[kfmon](https://github.com/NiLuJe/kfmon), 另一个是 [NickelMenu](https://github.com/pgaskin/NickelMenu)

> 这个安装脚本里，会自动帮我们执行我上面步骤2里手动的修改的配置，就是忽略`.`文件夹的扫描。但是我实践操作过程中发现似乎有时序问题，有的时候会失败，所以我才在第 2 步里手动修改，并确认配置生效。

安全弹出设备，耐心等几秒，就会自动开始安装。

安装成功之后，右下角会出现一个新的菜单，点击，选择【Plato】就可以进入了。

进入之后，点击左下角，选择【Library】，可以切换不同的仓库，以显示不同目录下的书籍。

在 Kobocloud 里同步的书籍在这里的【Removable】书架里。

如图：

![](https://files.owenyoung.com/file/owen-blog/2023-12-03-telegram-cloud-photo-size-1-5145563038030605534-y.jpg)

## 6. 配置 NickelMenu, 添加一些快捷入口

为 Nicket Menu 添加一个 sketch 快速打开白板，和快速打开浏览器，还有就是快速打开 在线wifi传书(<https://send.djazz.se/>)的选项，

[文档](https://github.com/pgaskin/NickelMenu/blob/master/res/doc)

新建文件 `.adds/nm/config`

配置如下：

```
menu_item :main    :Sketch Pad         :nickel_extras      :sketch_pad
menu_item :main :Buzzing        :nickel_browser     :modal:https://www.buzzing.cc/lite/
menu_item :main :Receive Books Online        :nickel_browser     :modal:https://send.djazz.se
menu_item:browser:Quit:nickel_misc:home
menu_item :selection_search :Search DuckDuckGo :nickel_browser :modal:https://duckduckgo.com/?q={1|S|%}
menu_item :selection_search :Search Youdao :nickel_browser :modal:https://www.youdao.com/result?word={1|S|%}&lang=en
menu_item :main    :IP Address         :cmd_output         :500:/sbin/ifconfig | /usr/bin/awk '/inet addr/{print substr($2,6)}'
menu_item :main    :FTP                :cmd_spawn          :quiet:/usr/bin/pkill -f "^/usr/bin/tcpsvd -E 0.0.0.0 1021" || true && exec /usr/bin/tcpsvd -E 0.0.0.0 1021 /usr/sbin/ftpd -w -t 30 /mnt/onboard
  chain_success                        :dbg_toast          :Started FTP server for KOBOeReader partition on port 1021.
menu_item :main    :Telnet (toggle)    :cmd_output         :500:quiet :/usr/bin/pkill -f "^/usr/bin/tcpsvd -E 0.0.0.0 2023"
  chain_success:skip:5
    chain_failure                      :cmd_spawn          :quiet :/bin/mount -t devpts | /bin/grep -q /dev/pts || { /bin/mkdir -p /dev/pts && /bin/mount -t devpts devpts /dev/pts; }
    chain_success                      :cmd_spawn          :quiet :exec /usr/bin/tcpsvd -E 0.0.0.0 2023 /usr/sbin/telnetd -i -l /bin/login
    chain_success                      :dbg_toast          :Started Telnet server on port 2023
    chain_failure                      :dbg_toast          :Error starting Telnet server on port 2023
    chain_always:skip:-1
  chain_success                        :dbg_toast          :Stopped Telnet server on port 2023


```

效果如下：

![](https://files.owenyoung.com/file/owen-blog/2023-12-03-telegram-cloud-photo-size-1-5145650556579195833-y.jpg)

## 7. 其他

有的时候，如果没有扫描到你添加的图书，可能需要重启一下。

目前就只探索到这么多，未来如果有新发现，再补充进来。
