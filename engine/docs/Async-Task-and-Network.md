---
id: async-task-and-network
title: 异步操作和网络
layout: docs
category: Guides
permalink: docs/async-task-and-network.html
next: store-and-data-persistence
---

在移动开发中，异步网络操作必不可少，本篇着重介绍在Flux模式中如何处理异步操作的问题，并深入一些细节，比如如何在异步操作时显示异步状态。另外，网络操作仅仅是异步操作的一种，最后扩展ActionCreator的语义来处理更多的业务逻辑。

## 如何做网络操作
---
如图所示，在FluxApp中，网络操作是在ActionCreator部分执行的。

<figure class="diagram associated-with-next-sibling">
    <img src="/img/flux-async-task-and-network.png" alt="flux-network">
</figure>

之所以这样是因为，Flux的整体架构是一个单向数据流，数据从Action开始最终经过Dispatcher、Store流向View，在这个过程中ActionCreator属于数据的预处理和准备阶段。所以像网络请求、文件处理、数据预处理等等都应该在这里完成，最后产出一个结果通过Action启动整个数据流。

一个典型的异步网络请求代码是这样的：
```
public void usrlogin(String account, String pw) {
    // tell store to show loading-dialog
    dispatcher.dispatch(new Action(LoginAction.ACTION_LOGIN_START));
    // start Rest API
    RestAPI.login(account, pw).enqueue(
        new RestCallback<JsonUser>() {
            @Override
            public void onSucceed(JsonUser juser) {
                // tell store that login-req success
                dispatcher.dispatch(new Action(LoginAction.ACTION_LOGIN_SUCCESS, juser));
            }

            @Override
            public void onError(String message) {
                // tell store that login-req fail
                dispatcher.dispatch(new Action(LoginAction.ACTION_LOGIN_FAIL, message));
            }
        }
    );
}
```

这里需要注意一个细节，在发起异步操作之后，我们需要显示一个“正在加载…”对话框或者显示一个发送状态。传统的做法可能是这样的，发起网络请求，提供一个回调接口，在回调接口中，隐藏“正在加载”对话框。典型的代码如下：

```
public void usrlogin(String account, String pw) {
    // show loading-dialog
    showLoadingDialog();
    // start RestAPI
    RestAPI.login(account, pw).enqueue(
        new RestCallback<JsonUser>() {
            @Override
            public void onSucceed(JsonUser juser) {
                hideLoadingDialog();
                // do something...
            }

            @Override
            public void onError(String message) {
                hideLoadingDialog();
                // handle error
            }
        }
    );
}
```

在Flux中，要始终注意数据是单向流动的，所以要抵制住这种诱惑。Flux的处理方式是在数据开始加载的时候，发送Action给Store，让Store来处理当前的UI状态，比如显示一个“正在加载…”的对话框。在网络请求成功/失败之后，再发送新的Action给Store处理请求结果。（额外的好处是，避免了常见的由于回调接口造成的内存泄漏问题）

## 乐观与悲观

这个问题经常出现在如下场景中，比如微信的点赞功能，由于网络延迟，我们在点赞之后并不是立刻拿到点赞是否成功的结果的，处理方式有两种：

1. 乐观的处理方式 点赞之后立刻显示点赞为成功状态，如果网络操作失败则撤销点赞成功的状态。
2. 悲观的处理方式 点赞之后先做网络请求，根据请求结果，再显示点赞状态

两者处理方式各有利弊，前者的问题在于如果网络请求失败，撤销点赞是一种很奇怪的现象。后者的问题在于，虽然看上去UI逻辑都是正确的，但是用户体验会很糟，在网络比较差的情况下，即使点赞这种“廉价”的操作也会等上几秒。（微信和FB都是采用乐观的方式，这种处理方式默认大部分情况下网络操作都会成功）

## 扩展的ActionCreator语义

就像刚开始分析的那样，ActionCreator负责的是数据的准备和预处理，而网络请求只是个例。所以，实际上ActionCreator给我们提供了一个处理一般业务逻辑的地方。这些业务和Flux数据流和UI逻辑没有关系，更多的是App的业务逻辑，比如在给一个手机号发送验证码之前（这也是一个网络请求，但是需要手机号作为payload），需要验证用户输入的手机号是否合法。再比如，做本地图片选择器的时候，需要调用图片库获取图片数据，这些类似操作，都是App的业务逻辑负责准备数据的事情，并不是App的UI逻辑，所以应该放在ActionCreator来做（Store对处理这类逻辑有很强的诱惑力，在Store中处理也是可以的，但是要记的不要在Store里面直接更新Store状态，要通过Action来更新）。

在Flux架构中，ActionCreator虽然和Flux数据流关系不大，但对于App来说，实际上是非常重要的一部分。它是对UserCase的抽象，每一个UserCase都可以抽象成ActionCreator的一个方法。

## 网络操作-读与写

Flux的作者曾经专门回答过ActionCreator和网络读写的[问题](https://groups.google.com/forum/#!topic/reactjs/jBPHH4Q-8Sc)，这对于代码强迫症患者颇有帮助。
>            
> One thing I also wanted to add is that I usually view ActionCreators (what were previously called actions) as something that is used for writes to the server. For example, the user added a new message by clicking the Send button, so the responsible view calls into ActionCreator.

> On the other hand, if a store needs to fetch data from the server (if a scroll load in the view triggers a request for data we currently don't have), then that doesn't have to use an ActionCreator. Instead, the store can directly hit an endpoint to load its data, and then direct the response through the dispatcher.

> One way to think about this distinction is that an Action, initiated from from the view, could change multiple stores (i.e. sending a message updates both the messages store and the thread store). Thus, the error handler would need to update globally that the optimistic action needs to roll back. So the role of an ActionCreator is to (1) format the Action in a standard way, rather than having different views do this, and (2) coordinate optimistic actions and the server response (whether a confirm or an error). On the other hand, data fetching from the store doesn't need either of those, and can avoid the extra layer of ActionCreator completely.

这段话主要是说一般网络写操作在ActionCreator中来做，网络读操作在Store中来做。理由是，ActionCreator在做网络请求时的职责，1). 规范化Action的创建 2). 协调乐观的网络操作，处理请求成功或者失败的情况的。但是在网络读操作的时候不需要这些操作，所以也不需要放在ActionCreator中完成。
