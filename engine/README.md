## 协作方式

此处是androidflux.github.io的发布引擎，翻译文章可以直接在 `docs` 目录下找到文章的英文版本，直接修改翻译成中文即可。
如果添加新的文章，需要按如下格式书写：

```
---
id: overview
title: Overview
layout: docs
category: Quick Start
permalink: docs/overview.html
next: todo-list
---

AndroidFlux是Facebook的<a href="https://facebook.github.io/flux/">Flux</a> 架构的Android实现。Flux是Facebook在14年提

blabla....
```

如果文章中用到了图片资源，需要把图片存在在 `engine/website/src/flux/img/` 目录下，索引方式按：`/img/xxx.png`

比如文章中需要插入图片flux.png

```
1. 图片拷贝 图片路径为 `engine/website/src/flux/img/flux.png`
2. 文章中使用 [Flux](/img/flux.png)
```

## 发布

本地产生改动之后，在当前目录下（即engine目录）执行脚本：

```
> ./setup.sh
```

即可生成静态网页。

然后把整个工程push到Github即可。

