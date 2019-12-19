## 写在前面
对于一个成熟稳定的项目来讲，运营的重要性想必不用再去过多赘述。

用户操作 app 时产生行为数据，通过数据采集系统采集，对采集的数据进行处理（实时数据处理+离线数据处理）得到统计数据进行数据分析，并将结果呈现出来以复盘总结当前版本并驱动下一个产品迭代，或者清洗后的数据进行数据挖掘，实时反馈给用户（如推荐），这是最常见不过的应用场景。

而数据采集，是整个数据流的起点，也是重中之重。采集的全不全、对不对，直接决定数据广度和质量，影响后续所有的环节。

## 什么是埋点

所谓“埋点”，是数据采集领域（尤其是用户行为数据采集领域）的术语，指的是针对特定用户行为或事件进行捕获、处理和发送的相关技术及其实施过程。比如用户某个icon点击次数、观看某个视频的时长等等。

## 传统侵入式埋点

代码埋点是我们常用的客户端埋点方式。在按钮或者图片的点击事件中插入相应的埋点代码，当用户点击时，发送埋点数据。

这是埋点最简单的实现方式，无疑也是工作量最大的。他的问题在于：

- 工作量大，每个埋点的地方都需要手动插入代码。
- 过于分散，埋点代码存在于项目各个角落，无法统一管理。
- 过于耦合，程序中插入太多业务无关代码，影响代码阅读和维护。

## 无侵入式埋点
基于上述几个问题，无侵入式埋点应运而生。

由于浏览器特殊的事件冒泡捕获机制，我们可以在 document 上对所有用户交互事件进行全局监听，从而实现无侵入式埋点：
```js
document.addEventListener('click',(ev)=>{
  const data = ev.target.getAttribute('data-statistic');
  if(data){
    // do something    
  }
})
```
我们监听所有的用户点击事件，如果该元素上含有 `data-statistic` 属性，也就是我们的埋点数据，那么进行一系列的操作。

比如我要给一个图片添加埋点，监听它的点击量：
```html
<image data-statistic="图片X" src="xxxxxx"/>
```

只需要简单的操作，就可以收集相应的埋点数据，而对业务代码没有任何影响，这就是所谓的“无侵入式埋点”。

## 小程序中的埋点

在小程序中，我们无法获取 `window` `document` 等全局对象，那么如何实现无侵入式埋点呢？

### Page Component
我们新建页面或者组件的时候，所有的配置都经过 Page 和 Component 构造器（暂且叫他构造器），然后才生成我们的页面对象。那么我们是不是可以对这俩对象下手呢，多说无益，来试试看。

#### 首先看看Page里有啥
```js
console.log(Page); // function(e){Object(r.a)(e)}
```
可以看到，他就是一个 Function，接收一个 option (就是我们的页面配置)，生成页面实例对象。

实际我们的页面文件完全可以这样写：
```js
const option = {
  data:{},
  onLoad(){
    
  },
  tapHandler(e){
    
  }
}
Page(option);
```
看到上面的书写形式，端倪出现了。既然 Page 接收的是一个 Object 对象，那么我们就可以在它接收到 option 之前，对 option 进行全局统一拦截。

### 全局构造拦截
我们把原本的 Page 对象替换掉，换成我们自己的 Page 对象，然后对数据进行处理后，再交给原来的 Page 对象。
```js
/**
 * page扩展
 */
export function pageEnhance(env) {
  const old_page = Page;
  Page = function (option) {
    // 做一些拦截处理
    old_page(option);
  }
}
```
这样我们在调用 Page 时，实际上是先调用我们的“假Page”，然后在传递给“真Page”。
### 埋点实现
好消息是，小程序框架为我们提供了全局统一的 Event 事件模型，所有用户的点击，滑动等事件所携带的事件对象格式都是统一的。这就为我们的方法拦截提供了思路。

#### 筛选携带埋点信息的方法进行特殊处理
上文中说到，我们在小程序事件中传递参数需要借助 dataset，那么我们暂且规定所有的埋点数据都放到 `data-statistic` 中:
```html
<view data-statistic="用户数据" onTap="tapHandler">点击</view>
```
毫无疑问，我们的 `tapHandler` 处理程序中，第一个参数肯定是事件对象，而事件对象中的 `currentTarget.dataset` 又必然包含 `statistic` 属性。

所以对方法做一下过滤：
```js
export function pageEnhance(env) {
  const old_page = Page;
  Page = function (option) {
    
     env !== 'test' && Object.keys(option).forEach(property => {
      if (typeof option[property] === 'function') {
        statisticHack(option, property);  // 埋点数据收集
      }
    })
    
    old_page(option);
  }
}

/**
 * 埋点统计数据
 */
function statisticHack(option, property) {
  const old_func = option[property];  // 拿到原有的函数引用
  option[property] = function (...args) {     // 对函数进行替换
    const ev = args[0];  // 第一个参数
    if (ev && ev.timeStamp && ev.type === 'tap' && ev.currentTarget) { // 判断为点击事件
      const statistic =ev.currentTarget.dataset.statistic; // 尝试获取埋点数据
      if (statistic) { // 含有埋点数据
        delete ev.currentTarget.dataset.statistic; // 删除埋点数据，防止事件传递重复上报
        delete ev.target.dataset.statistic;
        console.log('发现埋点！', statistic)
      }
    }
    return old_func.apply(this, args); // 执行原有函数逻辑
  }
}
```
对所有函数添加埋点检测逻辑，如果含有埋点数据，那么先进行埋点收集，如果无埋点数据，那么直接执行原有逻辑。

这里有三点需要注意：
- 埋点数据收集后要马上删除。如果页面内部对该事件进行了传递（子组件，父组件或其他函数），那么会重复执行收集动作。
- 函数替换时不可使用箭头函数。因为箭头函数无法正确获取函数运行时上下文（this），也就无法在执行原有函数逻辑修正this指向。
- 对页面原型对象（也就是我们传入的页面属性）进行 `oject[property]` 动态查找，会导致 sourceMap 失效。不利于我们本地开发调试，所以推荐只在生产环境中开启。
也就是添加env变量。

## 其他业务对接

当然不仅仅是埋点，像版本权限控制也可以这么实现。

只需要在高级版功能入口添加像`data-vip="true`之类的参数，然后对事件进行拦截。

当我检测到这是高级版功能，那么拉取用户版本信息进行判断。如果是高级版那么执行原有逻辑，否则进行拦截，提示用户进行订购。

诸如此类，等等等等... ...

## 写在最后
为了防止非必要的拦截，可以对一些不需要监听的方法（诸如声明周期）配置白名单。

当然上述只是提供一个大体思路，肯定也会有更巧妙更简洁的实现方式。
