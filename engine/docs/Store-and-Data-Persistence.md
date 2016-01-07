---
id: store-and-data-persistence
title: Stores和数据存储
layout: docs
category: Guides
permalink: docs/store-and-data-persistence.html
next: testing-flux-applications
---


*这篇文档主要讨论了Store和本地数据存储的问题，把Store和数据存储放在一起，很大程度上是因为这是两个容易混淆的概念的。在Flux中，Store是需要做本地数据存储的，但是又不能说本地数据存储应该放在Store中来做。*

## Store
---
在Flux中，Store包含应用的状态(state)和逻辑(logic)，它负责管理App中一片逻辑相关的UI区域。它扮演的角色和MVC模式中的Model类似，但是它会管理多个对象的状态 —— 它不是像ORM-Model一样的单独的数据集。

在Fb的[BestPractice](http://facebook.github.io/docs/flux-utils.html#stores)中规范了Store日常：

1. 数据缓存
2. 对外只暴露getter方法用 (永远不要提供setter方法)
3. 只能通过Action来响应外部的变化
4. 当Store状态发生变化的时候，需要通知Controller-View
5. 只有在接收到Action的时候才能触发通知

Store主要用来维护当前UI所需要的数据（即状态）。Store对外只提供getter方法，改变Store只能通过Dispatcher发送Action来改变。Store内部会消化Action，并对自身状态做出相应的改变。

那为什么Store会做数据缓存的工作呢？这还需要从Store的职责定位来看 - 维护App的UI状态。如果App关闭后再打开，用户希望看到App恢复到打开前的状态，而不是一切重新初始化。在App关闭前可能加载了几千条数据，并选中了其中一条，在用户重新打开App后，我们希望的结果是App立刻把这几千条数据加载到内存，并把其中一条标记成选中状态显示给用户。而为了达成这种效果，Store必须做一件事情——缓存，把App的当前数据（即Store自己的数据）缓存在本地，方便下次直接恢复App的状态。

所以，如果App每次重新打开之后不需要恢复之前的状态（比如，完全可以重新联网加载数据），那么Store是可以不做缓存的，缓存数据对Store而言仅仅是维护UI状态的一个优化。

## Store数据缓存
---
在一般的Android应用开发中，本地数据存储是很重要的一部分。所以经常有人问起“在Flux架构的App中如何做存储？” “Store？！” 有时候我们会这样将信将疑的回答，大部分原因是“Store”有“存储”的含义。 如果看了上面对Store的解释，或许已经能够理解二者的不同。

把存储放在Store中，仅仅是Store在维护App的UI状态的手段而已。而实现方式，根据数据类型不同有可能采用DB来缓存（比如，大量的列表型数据）、或者SharedPreferences（比如：简单的配置信息）来缓存。

这种理解方式和一般Android中理解存储的方式还是略有不同的，下面的例子会显示这种差异。

比如有两个页面PageA和PageB，他们使用的数据源是一样的，在传统的MVC/MVP中会有一个数据结构（ORM-Collection）来保存列表数据，在做缓存的时候，只需要把数据结构保存下来就可以了。但是在Flux应用中，PageA和PageB可能分别对应着StoreA和StoreB，在缓存的时候 StoreA 和 StoreB 会分别把自己内部持有的数据结构缓存了。

<figure class="diagram associated-with-next-sibling">
    <img src="/img/store-fluxy.png" alt="store of flux">
</figure>

## 本地数据存储
---
但是大多数情况下，确实需要做本地数据存储，比如在本地保存用户信息、登陆信息等。这和一般的Android应用的做法是一样的——使用Android提供的任何一种数据存储方案，在本地保存数据即可。

比如存储用户信息，最简单的方案就是使用SharedPreferences保存（一般我们会封装SharedPreferences来提供更好的接口调用）。如果有一个页面需要用到这里的用户信息的话，发送一个携带用户信息的Action给它对应的Store即可。