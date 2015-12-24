---
id: overview
title: AndroidFlux一览
layout: docs
category: Quick Start
permalink: docs/overview.html
next: todo-list
---

*我们正在做Flux在Android平台的适配工作，有一些文档需要翻译，并且提供Android版本的适配。欢迎[加入我们]("/support.html")。*

AndroidFlux是Facebook的<a href="https://facebook.github.io/flux/">Flux</a> 架构的Android实现。Flux是Facebook在14年提出的一种Web前端架构，主要用来处理复杂的UI逻辑的一致性问题（当时是为了解决Web页面的消息通知问题）。经过实践之后发现，这种架构可以很好的应用于Android平台，相对于其他的MVC/MVP/MVVM等模式，拥有良好的文档和更具体的设计，比较适合于快速开发实现。

Flux模式最大的特点是单向的数据流，它的UI状态更新模式继承了MVC模式的设计思想。Flux并不是具体的框架，而是一套处理UI问题的模式，AndroidFlux同样不是具体的框架，你不需要导入或者集成任何新的代码就可以使用，而你需要做的事情是了解这套思想、遵循这种开发模式，查看我们提供的Android代码示例，写自己的代码。

<figure class="diagram associated-with-next-sibling">
    <img src="/img/flux-arch.png" alt="unidirectional data flow in Flux">
</figure>

Flux应用程序包含三个主要部分：Dispatcher、Store和View。需要注意的是这和MVC的Model-View-Controller并不是对应关系，这里的View是Controller-View，负责处理UI逻辑和一些简单的事件分发，而在Android平台中，完美的对应的到Activity(或Fragment)和相应的布局文件(layout.xml)。Store部分也不是Model（业务Model），而是维护UI状态的PresentationModel，用来维护一组逻辑相关的UI状态。Dispatcher不会被直接使用，而是通过通过一个帮助类ActionCreator来封装Dispatcher，并提供便捷的方法来分发View中产生的事件，消息的传递通过Action（Action是一个普通的POJO类）来封装。

当用户点击UI上某个按钮的时候，一个完整的流程是这样的：按钮被点击触发回调方法，在回调方法中调用ActionCreator提供的有语义的的方法，ActionCreator会根据传入参数创建Action并通过Dispatcher发送给Store，所有订阅了这个Action的Store会接收到订阅的Action并消化Action，然后Store会发送UI状态改变的事件给相关的Activity（或Fragment)，Activity在收到状态发生改变的事件之后，开始更新UI（更新UI的过程中会从Store获取所有需要的数据）。

Store的设计是很精巧的（比较类似PresentationModel模式），每一个Store仅仅负责一片逻辑相关的UI区域，用来维护这片UI的状态，比如有一个设置界面，它有有很多设置项，那么可以让它对应一个SettingStore，这个Store仅仅用来维护Setting的状态。Store对外仅仅提供get方法，它的更新通过Dispatcher派发的Action来更新，当有新的Action进来的时候，它会负责处理Action，并转化成UI需要的数据。

## 结构和数据流

<p class="associated-with-next-sibling">在Flux架构的应用中，数据是朝单一方向流动的：</p>

<figure class="diagram associated-with-next-sibling">
    <img src="/img/flux-simple-f8-diagram-1300w.png" alt="unidirectional data flow in Flux">
</figure>

单项数据流是Flux模式的核心，__每个使用Flux程序员都应该牢记上图__。Dispatcher、Stores和Views都是独立的节点，拥有不同的输入和输出。Action是一个简单的对象，包含新的数据和数据类型两种基本属性。

<p class="associated-with-next-sibling">Views可以在响应用户操作的时候产生新的Action：</p>

<figure class="diagram">
    <img src="/img/flux-simple-f8-diagram-with-client-action-1300w.png" alt="data flow in Flux with data originating from user interactions">
</figure>

<p class="associated-with-next-sibling">所有的数据都通过Dispatcher这个枢纽中心传递。Action通过ActionCreator的帮助类产生并传递给Dispatcher，Action大部分情况下是在用户和View交互的时候产生。然后Dispatcher会调用Store注册在其(Dispatcher)中的回调方法, 把Action发送到所有注册的Store。在Store的回调方法内，Store可以处理任何和自身状态有关联的Action。Store接着会触发一个 <i>change</i> 事件来告知Controller-View数据层发生变化。Controller-View监听这些事件，在事件处理方法中从Store中读取数据。Controller-View会调用自己的<code>setState()</code>方法渲染UI。</p>

<figure class="diagram">
  <img src="/img/flux-simple-f8-diagram-explained-1300w.png" alt="varying transports between each step of the Flux data flow" />
</figure>

这种结构很容易让我们像函数式响应编程(functional-reactive-programming)或者更具的说是数据流(data-flow-programming)编程(flow-based-programming)一样透析我们的应用，在应用中所有的数据流都是单向，没有双向绑定。App的状态全部是通过Store来维护的，这样可以允许App的各个部分保持高度的解耦。Store之间有时也会存在依赖，他们会通过一个严格的结构来维护，通过来Dispatcher保证数据的同步更新。

数据的双向绑定会导致层叠更新的问题，比如一个对象导致了另一个对象的更新，另一个对象或许又会导致更多对象的更新。随着App的增长，这种效应导致无法预测App的那些部分会因为用户的操作而发生改变。但是当数据的更新只能走一轮的时候（a single round），整个系统就会变得更加可预测。


下面看看Flux应用的各个部分。一个比较好的开始是Dispatcher。


### 只有一个Dispatcher

在Flux应用中Dispatcher是中心枢纽，管理所有的数据流。它实际上管理的是Store注册的一系列回调接口，本身没有其他逻辑 —— 它仅仅是用来把Action发送到各个Store的一套简单的机制。每个Store都会把自己注册到这里，并提供自己的回调方法。当ActionCreator给Dispatcher传递一个Action的时候，应用中所有的Store都会通过回调接口收到通知。

随着App的增长，Dispatcher会变得更加重要，它可以通过调整回调方法的触发次序来管理Store之间的依赖关系。Store可以声明等待其他Store更新完毕再更新自己。


### Stores

Store包含应用的状态(state)和逻辑(logic)。它扮演的角色和MVC模式中的Model类似，但是它会管理多个对象的状态 —— 它不是像ORM-Model一样的单独的数据集。Store负责管理App中一片<strong>区域(Domain)</strong>的状态，而不是简单的ORM数据集。

比如，Facebook的<a href="https://facebook.com/lookback/edit">LookbackVideoEditor(网页应用)</a>使用一个TimeStore来跟踪视频回放的位置和状态。同时，使用ImageStore来维护一组图片集合。在TodoMVC示例中，TotoStore类似的维护一组TodoItems集合。Store的特点是即维护了一组数据集合同时也维护了逻辑区域的状态(A store exhibits characteristics of both a collection of models and a singleton model of a logical domain)。

如上，Store会把自己注册在Dispatcher上并提供一个回调接口，回调的参数是Action。在Store实现的回调方法内，会用一个<code>switch</code>语句根据Action类型来处理Action，并提供合适的Hooks来指向Store的一些内部方法(provide the proper hooks into the store's internal methods)。这样就可以通过Dispatcher发送Action来更新Store的内部状态。当Store更新后，它会广播一个事件声明自己的状态已经改变了，然后View会读取这些变化并更新自己。


### View和Controller-View

在Flux的网页应用中，Controller-View是一个比较复杂的概念，它是React框架中提出来的，这种View负责监听Store的状态并更新界面。而在Android应用中这变得非常简单，Controller-View就是Activity或者Fragment，每个Activity或Fragment都负责管理App的一块功能，负责监听Store并更新界面。

当View收到来自Store的更新事件时，它先会从Store的getter方法获取数据，然后调用自己的 <code>setStat()</code>或者<code>foreUpdate</code>方法迫使界面重绘。

通常一个Activity可以对应一个Store，但是当Activity包含几个Fragment，每个Fragment的功能比较独立时，也可以让每个Fragment分别对应自己的Store。


### Actions

Dispatcher会提供一个方法来分发事件到Store，并包含一些数据，这通常封装成一个Action。Action的创建一般被封装到一个有语境意义的Helper方法（ActionCreator），它会把Action传给Dispatcher。比如，我们会在Todo-List应用中，改变某条Todo的文字内容，这时可以在ActionCreator类中创建一个方法叫做 <code>updateText(todoId, newText)</code>，然后在View的事件处理方法中调用这个方法，这样就可以响应用户事件了。ActionCreator还会给Action添加一个合适的类型，这样Store就知道如何处理这个Action了，比如在这个例子中，类型可以叫<code>TODO_UPDATE_TEXT</code>。

Action也可能来自其他的地方，比如Server或者缓存，这发生在数据初始化的时候。也有可能发生在服务器返回错误码或者服务器有数据更新的时候（比如推送消息）。

<i>注：<strong>一览</strong>部分为Android平台特别说明，之后的Flux部分译自Facebook的<a href="http://facebook.github.io/flux/docs/overview.html#structure-and-data-flow">Flux介绍</a>，针对Android平台略有适配。</i>