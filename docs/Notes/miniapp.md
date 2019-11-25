## ACSS
[ACSS](https://miniapp.open.taobao.com/doc.htm?docId=117161&docType=1&source=search) 
是一套样式语言，用于描述 AXML 的组件样式，决定 AXML 的组件的显示效果。

ACSS 同系统 CSS 规则完全一致，100% 可以用。同时为更适合开发应用，对 CSS 进行了扩充。

### 响应式解决方案

**rpx**（responsive pixel）可以根据屏幕宽度进行自适应，规定屏幕宽为 750rpx

### 全屏
由于使用 rpx ，所有设备的横向全屏可以通过设置 `width:750rpx` 来实现。

但不同设备屏幕比例不同，固定设置高度无法兼容所有设备，所以这里需要一点特殊方法。

- 在 `app.acss` 中配置
```css
page {
  display: flex;
}
```
这样就可以将所有页面设置为纵向全屏显示。

### 滚动容器占满剩余屏幕空间
这种需求在移动端是比较常见的：比如一个列表页，头部是固定高度 tabbar，底部是固定高度按钮区，而中间区域占满剩余空间。

使用 flex 布局，让容器占满屏幕剩余空间是非常简单的。
```css
.container{
   width:100%;
   flex:1;
}
```
我们的父容器使用 flex 布局，子元素只需设置 flex:1 即可占满剩余空间。但有一种情况例外：

子容器在占满剩余空间的同时，超出部分显示滚动条，即需设置 `overflow-y:scroll`
> 小程序框架中的 `<scroll-view/ >` 组件既是如此

那么问题来了，`overflow-y:scroll` 生效的前提是**必需为容器指定固定高度**，

而使用之前 `flex:1` 的设置，父元素虽然占满剩余空间，但它的高度是缺省值，也就是 `height:auto` ，是没有**准确**高度的。

如果使用 `height:100%` 来继承父元素缺省值的高度，只能得到 undefined 的结果，浏览器不会对这个值有任何的反应。

又由于手机屏幕比例不同，我们无法给出统一的高度设置。

有两种方案可以实现此需求：
#### 借助于绝对定位，子绝父相，元素本身脱离文档流，只依赖于父级元素，这时它的 `height:100%` 即为父元素高度：

父容器设置
```css
.container{
  display: flex;
  flex:1;
  position:relative;
}
```
子元素设置
```css
.scroller{
  height:100%;
  position: absolute;
  overflow-y: scroll;
}
```
:::warning 注意
子元素绝对定位是计算父元素的 padding 值的。而传统的 height:100% 是不计算的。当然使用全局的box-sizing: border-box就不用担心了。
:::

#### 设置父元素 height

父容器设置
```css
.container{
  height:0;
  display: flex;
  flex:1;
}
```
子元素设置
```css
.scroller{
  height:100%;
  overflow-y: scroll;
}
```
为父元素设置 `height:0`，改变其高度缺省值设置，而 `flex:1` 又使父元素高度占满剩余空间，这时子元素的 `height:100%` 就可以正确继承到父元素的实际高度。







因为手机尺寸不同，我们无法设置固定高度
来让中间区域超出隐藏。

### 盒模型
#### border-box
在我们熟悉的QAP体系中，所使用的盒模型均为IE盒模型 `border-box`

此时元素 `width = content + padding + border`

比如，我们定义一个 `<view>` 的样式:
```css
view{
  width:100px;
  padding-left: 25px;
  border-left: 25px solid red;
  box-sizing: border-box;
}
```
<Picture src="mini-app/border-box.jpg" name="border-box" width="300" />
此时可以观察到，它所占的空间就是 100px

由于 25px 的内边距和边框，它的实际内容区宽度被压缩到了只剩 50px

#### content-box
而在小程序框架中，所使用的盒模型为W3C标准和模型 `content-box`

此时元素 `width = content`

同样我们定义一个 `<view>` 的样式:
```css
view{
  width:100px;
  padding-left: 25px;
  border:25px solid red;
}
```

<Picture src="mini-app/content-box.jpg" name="content-box" width="300" />
此时可以观察到，它所占的空间变成了 `100 + 25 + 25 = 150px`

由于 25px 的内边距和边框，它的内容区宽度 100px 保持不变，所占空间被扩大到 150px

::: tip 提示
可以通过设置 `box-sizing` 来改变盒模型标准。
:::

## AXML
[AXML](https://miniapp.open.taobao.com/doc.htm?docId=117166&docType=1&source=search) 
是应用框架设计的一套标签语言，用于描述应用页面的结构，总体和 [Vue](https://cn.vuejs.org) 的语法很相似。

AXML 语法可分为五个部分
[数据绑定](https://miniapp.open.taobao.com/doc.htm?docId=117165&docType=1&source=search)、
[条件渲染](https://miniapp.open.taobao.com/doc.htm?docId=117164&docType=1&source=search)、
[列表渲染](https://miniapp.open.taobao.com/doc.htm?docId=117160&docType=1&source=search)、
[模板](https://miniapp.open.taobao.com/doc.htm?docId=117162&docType=1&source=search)、
[引用](https://miniapp.open.taobao.com/doc.htm?docId=117163&docType=1&source=search)。

关于AXML语法，官方文档已经写的很详细了，这里就不再浪费篇幅，不过有一点需要注意。

### 注意
a-if 表达式支持的语法：

- `+` `-` `===` `!==` `||` `&&` `>` `<` 等逻辑运算（以及任意组合）
- 支持 ES5 及之前的部分语法（形如 `Array.prototype.indexOf`）
- 不支持ES6语法（形如 `Map.prototype.has` `Array.prototype.contains`）
## 事件系统
[事件](https://miniapp.open.taobao.com/doc.htm?docId=117158&docType=1&source=search)是视图层到逻辑层的通讯方式。

在 React 中，如果想要在 view 中绑定事件，可以像这么操作：
```jsx harmony
render(){
  return (
    <View onClick={this.clickHandler}>添加</View>
  )
}
clickHandler(){
  addSomething();
}
```
如果我们想要为点击事件传递额外参数，可以使用 bind：
```jsx harmony
render(){
  return (
    <View onClick={this.clickHandler.bind(this,this.data.item)}>添加</View>
  )
}
clickHandler(item){
  addSomething(item);
}
```
而在小程序框架中，事件绑定看起来也差不多，首先在 axml 中绑定一个事件处理函数:
```vue
<view onTap="tapHandler">添加</view>
```

:::warning 注意
注意是要用**字符串**的形式传入，而不需要使用花括号{{}}包裹。这里要和数据绑定做好区分！！！
:::
在相应的 Page 中定义相应的事件处理函数 tapHandler，参数为事件对象 event。
```js
Page({
  data:{},
  tapHandler(event){
    addSomething();
  }
})
```

### 事件类型
#### 冒泡事件
以关键字 on 为前缀，当组件上的事件被触发，该事件会向父节点传递。
#### 非冒泡事件
以关键字 catch 为前缀，当组件上的事件被触发，该事件不会向父节点传递

### 参数传递
我们为事件传递额外参数时，需要借助 dataset:
```vue
<view data-item="{{item}}" onTap="tapHandler">添加</view>
```
获取参数：
```js
Page({
  data:{},
  tapHandler(event){
    const item = event.target.dataset.item;
    console.log(item);
  }
})
```

事件系统会将`data-`开头的属性封装到 `event.target.dataset` 中，其中：
- `data-` 以及之后的 `-` 会被忽略。
- 除`data-`后的首字母外，其他的`-`后首字母转为大写。

eg:
```vue
<view data-template-id="123" ></view> // 会被转换为 dataset.templateId
```

> 官方文档中说明除 `-` 后的首字母转换为大写外，其他字母均转为小写，例如：data-templateId会转换为templateid,实测没有转换，dataset中仍为templateId。


## 组件
任何一个前端 MVVM 框架中，组件都是其必不可少的重要组成部分。小程序框架中也有[组件](https://miniapp.open.taobao.com/doc.htm?docId=117188&docType=1&source=search)系统。

与页面类似，自定义组件可以有自己的 axml 模板和 acss 样式。
:::warning 注意
与页面不同，用户自定义事件需要放到 methods 里面。
:::
### 生命周期
组件的生命周期函数在特殊的时间点由框架触发。组件生命周期如下：

生命周期 | 参数 | 说明 
---|---|---
`onInit`  | 无 | 组件创建时触发
`deriveDataFromProps`  | `nextProps`| 组件创建时和更新前触发
`didMount` |无|组件创建完毕时触发
`didUpdate`|`(prevProps,prevData)`|组件更新完毕时触发
`didUnmount`|无|组件删除时触发
:::warning 注意
onInit、deriveDataFromProps 自基础库 1.14.0 才支持，需要在开发者工具中的 详情 > 项目配置 中，勾选 component2。
:::

这里主要介绍 deriveDataFromProps 和 didUpdate 两个生命周期。
#### deriveDataFromProps
在组件 `创建和更新前` 都会触发。

正因他是在更新前触发，所以在其内部调用 `setData` 会将更新请求合并，不会重新触发 deriveDataFromProps 而导致死循环。

熟悉Vue的同学可以把它当做是 `computed` 来用，可以用来计算存储一些相对复杂的属性。

比如现在我们的商品列表组件需要统计所有的商品数量。

传统的方法是这样：

**AXML**
```vue
<view>商品总数为:{{onsale.length + inventory.length + soldout.length}}</view>
```
而使用 deriveDataFromProps 优化后：

**AXML**
```vue
<view>{{count}}</view>
```
**JS**
```js
Component({
  data: {
    count:0
  },
  deriveDataFromProps(nextProps) {
    const {onsale,inventory,soldout} = nextProps;
    const count = onsale.length+inventory.length+soldout.length;
    this.setData({
      count
    })
  },
});
```
这只是相对简单的情况，优化后的效果不明显。

当然实际项目中的需求也不会这么简单，如果要在统计的基础上进行筛选过滤等操作，效果就比较明显了。
#### didUpdate
在组件 `更新后` 都会触发。

**如果在其内部调用 `setData`，会导致页面死循环，所以要避免在 didUpdate 中进行数据更新。**

它的使用场景大多是组件更新后通知父组件或者子组件等对组件数据流没有影响的操作。

### slot 插槽
通过在组件 axml 中传入 props，自定义组件可以和外部调用者交互，接受外部调用者传来的数据。

同时可以调用外部调用者传来的函数，通知外部调用者组件内部的变化。

现在我们有一个按钮组件，他可以接收外部的 content props，来渲染不同的按钮文本。
```vue
<btn content="删除" />
```
内部实现：
```vue
<view>{{content}}</view>
```
现在新增一个需求，有些按钮可能不需要显示文本内容，而需要显示一张图片，这时候怎么做呢？

我们可以给它加一个 type 属性，来控制按钮的类型：
```vue
<view a-if="type==='img'">
  <image src="{{src}}"/>
</view>
```
使用：
```vue
<btn type="img" src="https://xxx.com" />
```
看起来没什么问题。但如果我们又有新的需求进来呢？不停的增加 type 吗？显然这不是我们想看到的。

这样的话自定义组件未免太不够灵活。这时我们就引入了slot：

**slot 使得自定义组件的 axml 结构可以使用外部调用者传来的 axml 组装**

这样一来，我们的 btn 不需要关心要渲染什么，你外部传递给我啥我就渲染啥

内部实现：
```vue
<view>
  <slot/>
</view>
```
使用
```vue
<btn>删除</btn>
<btn>
  <image src="https://xxx.com"/>
</btn>
```
其实这里的 slot 就相当于 React 中的 children props，在 React 中我们可以这么实现
```jsx harmony
render(){
  return (
    <view>
      {this.props.children}
    </view>
  )
}
```

这么看起来，是不是比之前使用 type 来控制渲染灵活多了呢？

#### 默认插槽 default slot
有时候可能我们需要一个默认模板，当外部没有传入渲染内容时，将会渲染这个默认模板。
```vue
<view>
  <slot>
    <view>按钮</view>
  </slot>
</view>
```
这时如果我们使用 btn 组件而未传入模板，他会渲染一个名为 按钮 的 btn
```vue
<btn />
```
#### 具名插槽 named slot
复杂的组件需要在不同位置渲染不同的 axml，即需要传递多个 axml。此时需要 named slot。

使用具名插槽后，外部调用者让 传入的 axml 对号入座，渲染到指定的位置。

比如我有一个 dialog 组件，它分为三部分，header，content 以及 footer。每部分都有默认模板，我也可以具体定制某一部分的显示内容：
```vue
<view>
  <slot name="header">提示</slot>
  <slot />
  <slot name="footer">
    <button>确定</button>
  </slot>
</view>
```
正常使用 dialog 组件，它含有默认的头部和尾部，传入的 axml 将会渲染在 `<slot />` 标签处。
```vue
<dialog>
  确定要删除吗？
</dialog>
```
我们可以对头部和尾部进行定制，只需给标签指定slot属性：
```vue
<dialog>
  <view slot="header">警告</view>
  确定要删除吗？
  <view slot="footer">
      <button>确定</button>
      <button>取消</button>
  </view>
</dialog>
```
这是，我们的`<view slot="header">`将会渲染在 name 属性为 header 的标签处，

而`<view slot="footer">`则会渲染在 name 属性为 footer 的标签处，文本内容正常渲染在中间。

#### 作用域插槽 slot-scope
通过的 props 属性，我们可以在组件内部访问外部数据。而有些时候，在外部访问组件内部数据也是有必要的。

先看我们 QAP 中常用的组件 `<ListView/>`
```jsx harmony
render(){
  return(
    <ListView        
        renderRow={this.renderItem.bind(this)}
        dataSource={this.state.list}
    />
  )
}
renderItem(item){
  return (
    <View>{item.name}</View>
  )
}
```
在 ListView 组件中，renderItem 方法就像是一个插槽，ListView 组件不去关心如何去渲染每一行数据，而是向外暴露一个 renderRow 方法，我把每一行的数据向外传递给父组件，你父组件来决定如何渲染。

这种场景就是我们提到的在外部访问组件内部数据。那么在小程序中，这种组件要怎么实现呢？

**ListView.axml**
```vue
<view class="list-view-container">
  <view a-for="{{dataSource}}">
    <slot item="{{item}}" />
  <view>
</view>
```
我们在组件内部对 dataSource 进行遍历，循环渲染其每一行，并且通过 slot 标签上的 item 属性将每一行的数据暴露给父组件

**page.axml**
```vue
<list-view dataSource="{{list}}">
  <view slot-scope="scope">
     {{scope.item.name}}
  </view>
</list-view>
```
页面使用组件时，通过 slot-scope 申明为作用域插槽，属性值定义临时变量名 scope，即可访问到组件内部暴露出来的数据。
### 事件传递
我们的自定义组件中难免会处理一些事件，事件在组件中的传递和 React 大同小异：
```vue
<btn onTap="add">添加</btn>
```
```js
Page({
  data:{},
  add(ev){
    console.log(ev);
  }
})
```
到这里我们会发现点击事件不能正常触发，不能触发就对了😂

因为`onTap`是原生 view 或者 button 中的属性，我们的 btn 组件并未对 onTap 属性进行处理。

**btn.js**
```js
Component({
  data:{},
  didMount(){
    console.log(this.props.onTap) // 我们定义的onTap事件在这里
  },
  methods:{
    tapHandler(ev){  // 这里首先要声明事件，并且在事件触发时，手动触发父页面传入的onTap
      this.props.onTap&&this.props.onTap(ev);
    }
  }
})
```
**btn.axml**
```vue
<view onTap="tapHandler">
  <slot/>
</view>
```
这样，我们点击 btn 组件时，实际上处罚的是 btn 中 view 的 onTap 事件，而在其处理函数中，手动对外部绑定的事件进行触发。
:::warning 注意
自定义中传递的事件属性必须以 on 或者 catch 开头，且其后首字母必须大写，比如 onChange 或者 catchChange，这样才可以正常识别事件，如果不遵循此规范
（比如使用 onchange 或者 change），那么传递给组件的就仅仅是一个字符串
:::
#### 参数传递
通过上文我们知道想要在事件中传递额外参数需要借助 dataset，我们尝试一下
```vue
<btn onTap="add" data-item="{{item}}">添加</btn>
```
```js
Page({
  data:{},
  add(ev){
    console.log(ev.target.dataset); 
  }
})
```
我们会发现打印出来的 dataset 是一个空对象，那么我们绑定的`data-item`去哪里了呢？

这里要搞清一点：event 上的 target 指的是触发事件的元素，显然这里的 target 指的是 btn 组件内部的 view，这个 view 上并没有 data-item，所以事件对象中也没有
我们想要的 item 属性。

而我们 data-item 是绑定在 btn 标签上的，他是作为了 btn 组件的 props：
```js
Component({
  data:{},
  didMount(){
    console.log(this.props) //这里可以找到我们的 data-item
  },
})
```
在这里有两种方案可以选择。

**一是为自定义组件手动设置 dataset**

**btn.axml**
```vue
<view onTap="tapHandler" data-item="{{item}}">
  <slot/>
</view>
```
**page.axml**
```vue
<btn onTap="add" item="{{item}}">添加</btn>
```
这样就可以在 event 中正常获取到 item 对象。这么处理好处是比较简单，适用于组件功能固定的情况。

当我们的组件功能比较开放，可能我在这里需要传递 item ，而另一个页面需要传递 id，或者我需要传递多个参数，这就行不同了。

**第二种处理方式是借助一个 fmtEvent 方法来将 props 中的 data-item 合并到事件对象中**
```js
/**
 * 为自定义组件事件传递dataset
 * @param {props} props 组件props
 * @param {event} event 事件对象
 */
export function fmtEvent(props, event) {
  let dataset = {};
  Object.keys(props).forEach(key => {
    if (/^data-.*/.test(key)) {
      let dataKey = getKey(key);
      dataset[dataKey] = props[key];
    }
  })
  const newDataset = { ...event.currentTarget.dataset, ...dataset };
  return {
    ...event,
    currentTarget: {
      dataset: newDataset
    },
    target: {
      dataset: newDataset,
      targetDataset: newDataset
    }
  }
}
/**
 * 提取 data- 后的内容，删除 - 且将 - 后的第一个字符改为大写
 * @param {string} key dataset key eg.data-userId
 */
function getKey(key) {
  return key.replace(/(^data-)|(-)(.)/g, (match, f, s, t) => {
    if (s && t) {
      return t.toUpperCase()
    }
    return ''
  });
}
```
这里我们将组件所有以`data-`开头的props都提取出来，合并到 event 中。这样任何参数名以及参数个数都可以从容处理。
> mini-antui中也是采用这种方式对事件参数进行传递，不过他所提供的方法比较简单，仅仅是合并数据。这里提供的处理方法比较完善。
### mixins 混入
mixins主要是用来提取公共逻辑以便复用。

它和组件有着相同的定义方式。

#### demo.js
```js
export default {
  data:{},
  onInit(){
    console.log('mixin init!')
  }, 
  deriveDataFromProps(nextProps){},
  didMount(){},
  didUpdate(prevProps,prevData){},
  didUnmount(){},
  methods:{}
};
```

#### component.js
```js
// 使用时只需引入相应的mixin
import demo from './demo';
Component({
  mixins:[demo],
  onInit(){
      console.log('component init!')
    }, 
});
```


组件引入目标 mixin 后，会将其所有**属性**、**方法** 合并到当前组件(当前组件为主，重名替换)。

而对于生命周期函数比如 onInit，若重复定义则会先执行mixin中的 onInit 再执行组件中的 onInit

即先打印 mixin init! 再打印 component init!。

#### 使用场景
像上文中对自定义组件事件的传递，我们的 btn 组件需要，checkbox 以及 radio 组件都需要，我们就可以封装一个 mixin 来处理事件传递。

**customEvent.js**
```js
import {fmtEvent} from '/util/tool'
/**
 * 自定义组件点击事件处理
 */
export default {
  methods: {
    tapHandler: function(event) {
      if (this.props.onTap&&!this.props.disable) {
        if (typeof this.props.onTap === 'function') {
          const ev = fmtEvent(this.props, event)
          this.props.onTap(ev);
        } else {
          throw new Error('tap event must be type of function')
        }
      }
    }
  }
}
```

使用：

**btn.js**
```js
import customEvent from './mixins/customEvent'
Component({
  mixins:[customEvent]
});
```

**btn.axml**
```vue
<view onTap="tapHandler" data-item="{{item}}">
  <slot/>
</view>
```
这里 customEvent 将 tapHandler 注入组件原型，我们可以直接在 axml 中使用改事件。

### 跨组件通信
在实际项目中，我们会有很多时候需要跨组件甚至是跨页面通信。在 QAP 中，SDK 为我们提供了一套事件 API 供我们使用。

在小程序中，没有为我们提供这样一个API，需要我们引入第三方库，这里推荐 NodeJs 的
 [Event](http://nodejs.cn/api/events.html) 模块。

#### 安装
```bash
npm install events # 或者 yarn add events
```
#### 使用
**app.js**
```js
import EventEmitter from 'events';
App({
  onLaunch(options) {
    my.$event = new EventEmitter(); // 注册全局事件监听
  }
})
```
推荐直接将 event 对象挂载到 my 当中。在小程序环境中，没有全局的 window 或者 document 对象供我们使用，借助 my 可以在任何地方
简单快捷的使用事件。
#### 事件监听
```js
my.$event.on('eventName',handler)
```
#### 事件触发
```js
my.$event.emit('eventName',data)
```
#### 事件销毁
```js
my.$event.off('eventName',handler)
```
**注意**

EventEmitter 在监听同名事件时，不会覆盖掉前面的监听函数。它内部对每一个事件名下的所有处理函数使用数组进行存储。也就是说，我们要及时对事件进行销毁。

不然的话，在首页 onLoad 我注册了一个事件，用户跳转到其他页面，又回到首页，那么 onLoad 会再次注册改事件，导致内存泄漏。

关于事件销毁也要注意：事件销毁时，除事件名一致外，传入的 handler 必须与监听时的处理函数为同一个对象，才可以销毁。

也就是说，我们不可以使用匿名函数来监听事件：
```js
my.$event.on('eventName',(data)=>{
  //xxx
})
```
这样监听的事件是永远无法销毁的，因为我们无法再次拿到处理函数的引用。

我们可以这样
```js
this.eventNameHandler = ()=>{
  // xxx
}
my.$event.on('eventName',this.eventNameHandler);
my.$event.off('eventName',this.eventNameHandler);
```

如果我们不使用箭头函数来定义 handler ，当事件触发时，handler 内部的 this 并不会指向组件实例。

可以借助 bind：
```js
this.eventNameHandler = this.eventNameHandler.bind(this);
my.$event.on('eventName',this.eventNameHandler);
my.$event.off('eventName',this.eventNameHandler);
```
这里还有一个常见错误会发生：可能会有的同学这么写：
```js
my.$event.on('eventName',this.eventNameHandler.bind(this));
my.$event.off('eventName',this.eventNameHandler.bind(this));
```
这种写法是无法成功销毁事件监听的。因为每次 bind，**都会生成一个新的函数对象**。也就是说：
```js
this.eventNameHandler.bind(this)!==this.eventNameHandler.bind(this)
```
## 路由
PC端为我们提供了[路由组件](https://miniapp.open.taobao.com/doc.htm?docId=117509&docType=1&source=search)，我们可以在千牛PC端搭建单页面应用（SPA），单页应用的优点相比不用过多赘述。

但是他这个路由文档比较少，配置看起来也不太容易理解。接下来就从原理开始一起学习一下这个小程序框架中的路由组件。

### 原理
在小程序框架中使用路由，由于没有 window 对象，自然也就没有 history。实现路由的话，大概也就只有一种方式了，那就是使用 slot。

上文中我们介绍了 slot 具名插槽，而路由的精髓也就是这个具名插槽，先看下路由组件，很简单，就三行：

**router-view.axml**
```vue
<view>  
  <slot name="{{name}}" />
</view>
```
这么简短的代码怎么实现页面切换的呢？其实很简单，举例说明：
**page.axml**
```vue
<router-view name="{{name}}">  
  <view  slot="first" >
   第一页
  </view>
  <view  slot="second" >
   第二页
  </view>
  <view  slot="third" >
   第三页
  </view>
</router-view>
```
**page.js**
```js
Page({
  data:{name:'first'},
  pageChange(name){
    this.setData({
      name
    })
  }
})
```
看到这里我想已经可以理解路由的工作原理了：使用具名插槽，动态为 router-view 组件设置 slot 的插槽名称，来渲染不同的组件。

当`name = 'first'`时，显示第一页，当`name = 'second'`时，就显示slot为second的view，以此类推。

基于这个原理，将 pageChange 封装到路由组件内部，当我们 push 新的路径时，计算并设置要显示的插槽名，也就是我们使用的路由了。

### 配置
基于上面的理解，我们再回过头来看一下文档中的配置（部分）：

**路由定义**
```js
export default {
  routes: [
    {
      path: '/home',
      component: 'home', 
      children: [],
    },
    {
      path: '/scene',
      component: 'scene',
      children: [
        { path: '/select', component: 'select' },
        { path: '/slider', component: 'slider' },
        { path: '/menu', component: 'menu' }
      ],
    }
  ]
}
```
**页面**
```vue
//page.axml
<view class="body-content">
	<router-view>
		<home slot="home" />
		<scene slot="scene" />
	</router-view>
</view>
```
看到页面中的`<home slot="home" />`可能有点晕，这是啥跟啥，其实他这么写文档有点迷惑人的味道，又是 path 又是
 component 又是 slot 的，弄得有点懵。
 
这里面最关键的就是路由定义中的 `component: 'home' ` 以及页面中的 `slot="home"`。

我们完全可以这么写页面：
```vue
//page.axml
<view class="body-content">
	<router-view>
		<view slot="home" >
		  home
		</view>
		<view slot="scene" >
		  scene
		</view>
	</router-view>
</view>
```
看到这里是不是和我们刚才分析的原理有点像了?

实际上，当我们 `push('home')`时，就会把 `<router-view>` 中的 `name` 属性设置为`home`，
这是页面上也就响应的显示出 `slot="home"` 的页面。

### 缺陷
1. **不允许两个router-view在同一层级中出现。**
```vue
<view>
  <router-view />
  <router-view />
</view>
```
这样使用是不可以的，但实际使用中这种需求还是有的。比如我有一个店铺收藏拉粉页，他下面有两个子路由，每个子路由又分为创建活动，活动管理，领取记录三个页面。

理想化的路由设置是这样：

```js
{
  path: '/shop-favor',
  component: 'shop-favor',
  children: [
    {
      path: '/coupon',
      component: 'coupon',
      children: [
        {
          path: '/activity',
          component: '/activity',
        },
        {
          path: '/create',
          component: '/create',
        },
        {
          path: '/record',
          component: '/record',
        }
      ]
    },
    {
      path: '/gifts',
      component: 'gifts',
      children: [
        {
          path: '/activity',
          component: '/activity',
        },
        {
          path: '/create',
          component: '/create',
        },
        {
          path: '/record',
          component: '/record',
        }
      ]
    },
  ]
}
```
我们的店铺收藏拉粉页
```vue
<router-view>
    <router-view slot='coupon'>
      <activity type="coupon" slot="activity"/>
      <create type="coupon" slot="create"/>
      <record type="coupon" slot="record"/>
    </router-view>
    <router-view slot='gifts'>
      <activity type="gifts" slot="activity"/>
      <create type="gifts" slot="create"/>
      <record type="gifts" slot="record"/>
    </router-view>
</router-view>
```
那么抱歉，coupon 下的 router-view 和 gifts 下的 router-view 是属于同一层级，这是会渲染失败的。

2. **path-to-regexp**中的bug
如果我们需要在页面跳转时传递参数，可以如此配置
```js
{
  path: '/shop-favor/:id',
  component: 'shop-favor'
}
```
页面跳转
```js
this.$router.push('shop-favor/123'); // 跳转成功，可以获取参数
this.$router.push('shop-favor'); // 跳转失败，路由匹配不到

```
很多情况下我们需要使用可选参数：
```js
{
  path: '/shop-favor/:id?',
  component: 'shop-favor'
}
```
页面跳转
```js
this.$router.push('shop-favor/123'); // 跳转成功，无法获取参数
this.$router.push('shop-favor'); // 跳转成功
```
当我们使用可选参数进行跳转时，bug出现了，无法在页面中获取到参数😂

之前的解决方式是一律使用必填参数，当不需要参数时传递0
```js
this.$router.push('shop-favor/123'); // 跳转成功,可以获取参数
this.$router.push('shop-favor/0'); // 跳转成功
```
脑壳疼。
### [py-mini-router](https://www.npmjs.com/package/py-mini-router)
基于上面（还有很多）使用过程中的痛点，我的初始想法是到git上提issue，结果找不到人，npm上也没有任何联系方式，无奈只好自己手撸了一个路由：

- 舍弃 path-to-regexp 路由匹配方式，采用Object进行跳转以及传参，使用更加灵活。
- 支持自定义路由配置，可在当前页面实时获取，扩展性更高。
- 允许两个 router-view 在同一层级中出现。
[文档](https://www.npmjs.com/package/py-mini-router)
[项目传送门](https://github.com/7revor/mini-router)

## 参考资料
- [商家应用官方开发文档](https://miniapp.open.taobao.com/doc.htm?docId=117200&docType=1&source=search)
