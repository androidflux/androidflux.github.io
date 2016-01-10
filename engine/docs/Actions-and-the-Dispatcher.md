---
id: actions-and-the-dispatcher
title: Actions和Dispatcher
layout: docs
category: Guides
permalink: docs/actions-and-the-dispatcher.html
next: testing-flux-applications
---

Dispatcher
--------------

___Dispatcher___ 作为Flux应用中数据流的中转枢纽，采用单例模式。它的本质是注册回调接口，并且可以有序的调用它们。 每一个 ___Store___ 都在 ___Dispatcher___中进行注册。 当新的数据进入到 ___Dispatcher___中时，它（Dispatcher）会把数据发送给每一个 ___Stores___。 通过 `dispatch()`方法把数据发送到各个Store，并且 `dispatch()`只有一个传送数据的对象(data-payload-object)作为参数，而它实际上就是Action。

<figure class="diagram">
  <img src="/img/flux-simple-f8-diagram-with-client-action-1300w.png" alt="data flow in Flux with data originating from user interactions" width=650 />
</figure>

Actions and Action Creators
---------------------------

无论是用户与应用交互还是网络API的响应，当新的数据输入系统的时候， 这个数据被包装到 ___Action___ — 一个包含了数据和Action类型的对象。我们经常会创建一个类(ActionCreator)包含各种帮助方法，这些方法不仅创建___Action___，并且把Action传递给___Dispatcher___。

___Actions___之间通过`type`属性进行区分。当所有___Stores___接收到___Action___时，就可以通过明确的`type`属性来判断是否处理和怎么处理传来的数据。在一个Flux应用中，___Stores___和___Views___都是自控制的，他们不会响应外部的对象。___Actions___通过___Stores___注册在Dispatcher中的回调接口获取，而不是通过`set`方法。

为什么需要 Dispatcher
------------------------

随着一个应用的成长，___Stores___ 之间的依赖是常有的事。StoreA要等到StoreB先更新，所以StoreA应该知道自己什么时候更新，这种情况是不可避免的。我们需要通过___Dispatcher___先调用StoreB的回调，并在回调结束后再去调用StoreA。为了明确的声明依赖关系，一个___Store___ 需要明确的告诉___Dispatcher___，“我需要等到StoreB把Action处理完再执行。” 因此___Dispatcher___ 通过提供`waitFor()` 方法来实现这个功能。

`dispatch()` 方法提供回调方法的同步遍历，按顺序的调用回调。当`waitFor()`遇到了回调中的某一个时， 当前执行的回调将被停止并且 `waitFor()` 会提供给我们一个基于依赖的新的遍历循环。 当全部的依赖被执行完时，原先的callback才会继续被执行。

另外，在同一个Store的回调方法里，`waitFor()` 方法可以根据Action的不同类型按不同的方式使用。例如在一种情况下StoreA要等待Store B的执行，但在其他场景下，StoreA可能要等待StoreC的执行。根据Action的类型，在每种`switch-case`的代码块里面调用`waitFor()` 可以解决细粒度的依赖控制。

当存在循环依赖时，会导致问题产生。 比如，StoreA 需要等待StoreB同时StoreB需要等待StoreA，我们将陷于死循环。所以在创建Dispatcher的时候需要特别注意，并避免这个问题。

*译: @JiangDaYa0 修订：@ntop001*