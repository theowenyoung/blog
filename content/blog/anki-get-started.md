---
title: Anki背单词必备的3个插件
date: 2020-11-10
updated: 2020-11-10
taxonomies:
  categories:
    - Misc
  tags:
    - English
---

用了那么多背单词软件，发现还是[Anki](https://ankiweb.net/)好用，我觉得其中最好用是 Anki 提供的强大的 Tag 功能，你可以给每个单词打上一个 Tag ，这样方便你日后归类来复习这些单词，比如你可以有一个「hard」的 Tag。

<!-- more -->

Tag 是 Anki 官方提供的功能，你可以直接在 Anki 上管理 tag，但是默认的 tag 管理比较不够便捷，所以如果配合以下插件，就能更方便的添加，查看 Tag。

这里纪录下我的 Anki 配置，希望你也能用得着。最终效果如下：

![](https://i.imgur.com/WF5posJ.png)

## 预先准备

- [下载 Anki 桌面版](https://apps.ankiweb.net/)
- [下载一个词库][https://ankiweb.net/shared/decks/] - 可选，我初学的时候用的是这个排名第一的[4000 Essential English Words 英英](https://ankiweb.net/shared/info/1104981491)

## 必备插件

下载插件是在「Tools->Add-ons->Get Add-ons」,输入插件的 Code，插件的 Code 在插件主页上找到，[点击这里](https://ankiweb.net/shared/addons/ 2.1)可以浏览所有的插件。

> Note: 每次安装完插件后，重启才能生效。

### 1. [Quick tagging](https://ankiweb.net/shared/info/304770511)

Code: `304770511`

这个插件用来在 review 时，用快捷键快速添加 tag，默认是「q」键，你可以配置自己常用的 tag，比如「h」键添加一个「hard」标签。

以下是我的配置(其实就只是加了一个 hard 快捷键)：

```json
{
  "add tag shortcut": "q",
  "edit tag shortcut": "w",
  "quick tags": {
    "Ctrl+Shift+B": {
      "action": "bury note",
      "tags": "burynote"
    },
    "Shift+B": {
      "action": "bury card",
      "tags": "burycard"
    },
    "Shift+S": {
      "action": "suspend card",
      "tags": "suspend"
    },
    "h": {
      "action": "again card",
      "tags": "hard"
    }
  }
}
```

### 2. [Clickable Tags ](https://ankiweb.net/shared/info/380714095)

Code: `380714095`

接下来就是这个 Clickable Tags 插件了，上一个插件解决了添加 Tag 的问题，这个插件解决显示 Tag 的问题，用了这个插件后你可以把这个单词所属的 Tag 都显示在 Review 页面，并且可以随时点击进去查看同个 Tag 的所有单词。效果如下：

![](https://raw.githubusercontent.com/luoliyan/anki-misc/master/screenshots/clickable-tags.png)

安装完成后，你需要在你的单词模板里插入一个占位符来作为显示 Tag 的地方，步骤如下：

![](https://i.imgur.com/2WWkaiA.png)

点击「Cards」，选择「Back Template」，在合适的地方插入 `{{clickable:Tags}}`

![](https://i.imgur.com/xVZHyjW.png)

保存并重启 Anki，你就会在卡片背面看到单词的 Tags（如果有 Tag 的话）

### 3. [Tag Entry Enhancements v2](https://ankiweb.net/shared/info/536796161)

Code: `536796161`

这个插件提供标签输入增强的，提供了以下功能：

- 添加 Return / Enter 作为热键以应用第一个建议的标签
- 将 Ctrl + Tab 作为热键添加以在建议列表中移动
- 输入字段时禁用初始建议框弹出窗口
- 允许使用 ↑/↓ 调用标签建议框

安装后重启即可使用

## 总结

总之，我使用 Anki 的重度功能就是这个 Tag，背到某个单词的时候，可以看到你标记的同类单词，这样更不容易忘记。
