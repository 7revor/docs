## 背景
在小程序框架中，my API 提供了全局的 alert，toast 等交互组件。使用起来也比较方便。唯一的遗憾是我们无法更改它的样式，只能用官方自带的效果。这显然和我们的UI体系格格不入。

因此，定制交互组件就十分有必要了。

## 实现
现在我们写一个简单的 dialog 组件，来处理我们的 alert 消息：
```vue
<view class="py-dialog {{visible?'active':''}}">
   {{content}}
</view>
```
```js
Component({
  data: {
    visible: false,
    content: '',
  },
  methods: {
    /**
      * 提示
      */
    alert(content) {
      if (this.data.visible) return;
      this.setData({
        content,
        visible: true
      })
      return new Promise(resolve => this.$resolve = resolve);
    },
    /**
     * 确定事件
     */
    sure() {
      this.$resolve && this.$resolve();                 // promise resolve
      this.close(); // 弹窗关闭
    },
    /**
     * 关闭弹窗
     */
    close() {
      this.setData({
        visible: false
      })
      this.$resolve = null;
    }
  }
});
```
这里封装 dialog 的思路还是和之前 React 中一样，借助 Promise 来实现简洁的交互。[传送门](/React/Dialog.html)

## 使用
下面我们来使用一下这个 dialog 组件：

首先在 page.json 中声明：
```js
{
  "usingComponents": {
     "dialog":"./components/dialog/dialog"
  }
}
```
由于无法获取 document 来动态插入内容，所以使用组件需要 axml 中显示引入：
```vue
<view>
  <view onTap="alert">点我弹窗</view>
  <dialog ref="dialog"/>
</view>
```

我们需要借助 ref 来获取页面中的组件实例：
```js
Page({
  dialog(ref){    // 首先保存该弹窗实例
    this.$dialog = ref;
  },
})
```
呼起弹窗：
```js
alert(){        // 点击事件
  this.$dialog.alert('提示！')
}
```
可以看到，我们要想使用自己封装的这个 dialog，需要经过四步。

- 在 page.json 中声明
- 在 axml 中引入
- 在 js 中保存组件实例
- 通过组件实例调用

这还只是一个dialog。如果后续加上 toast，actionSheet 等交互，那么每个页面都需要引入三个组件，保存三次组件实例。
并且在子组件中使用交互，还需要先获取页面实例，再呼起页面中的 dialog。

这完全违背了我们的初衷。交互组件的目的就是为了简单、快捷的实现交互功能。

## 改善

### 集成 frame
首先将所有的交互组件集成到名为 frame 的组件中，将各个交互组件实例都维护在 frame 里，由 frame 统一调用，这样我们只需要引入 frame 就可以使用所有的交互。
#### frame实现
```vue
  <dialog ref="_dialog"/>
  <toast ref="_toast"/>
  <action-sheet a:if="{{select}}" ref="_action_sheet"/>
```
由于并不是所有页面都要用到 ActionSheet，所以我们把 ActionSheet 作为可选配置。
```js
Component({
  onInit() {
    Object.defineProperty(this.$page, '$inject_frame', {
      value: {}
    })
  },
  methods: {
    _pyDialog(ref) { // 挂载弹窗到frame
      Object.defineProperty(this.$page.$inject_frame, 'dialog', {
        get: () => {
          return ref
        }
      })
    },
    _toast(ref) {// 挂载toast到frame
      Object.defineProperty(this.$page.$inject_frame, 'toast', {
        get: () => {
          return ref
        }
      })
    },
    _action_sheet(ref) { // 挂载select到frame
      Object.defineProperty(this.$page.$inject_frame, 'action_sheet', {
        get: () => {
          return ref
        }
      })
    }
  }
});
```
frame 做了如下工作：
- 初始化时，在当前页面对象上创建一个名为 `$inject_frame` 的引用，指向其自身
- 各个子组件初始化时将实例绑定到页面对象上的 `$inject_frame` 中

### 交互方法注入

有了集成 frame，我们可以通过 `page.$inject_frame` 来实现对交互组件的统一管理。但调用起来还是比较繁琐：

- 调用 alert，我需要 `this.$inject_frame.dialog.alert('xxx')`
- 调用 toast，我需要 `this.$inject_frame.toast.toast('xxx')`

借助上文提到的全局拦截，我们可以采取原型注入的方式将操作直接绑定到页面以及组件实例中。

```js
const old_page = Page;
Page = function (prototype) {
    /**
     * frame 全局交互注入
     */
    frameInject(prototype);
    // ... ...其他操作
    old_page(prototype);
}
```
由于组件中的调用首先要获取 `this.$page`，这里我们需要做一下区分。
```js
const old_component = Component;
Component = function (prototype) {
    /**
     * frame 全局交互注入
     */
    frameInject(prototype, 'component');
    // ... ...其他操作
    old_component(prototype)
}
``` 
接下来看一下我们的主角 frameInject 函数
```js
/**
 * frame全局交互注入
 */
function frameInject(prototype, component) {
  if (prototype.Inject === false) return;  // 用来区分一下不需要注入的原型（比如交互组件自身，弹窗组件等等）
  let inject_target;  // 注入对象
  let frame_index;    // frame实例位置
  if (component) {    // 组件注入
    if (!prototype.methods) {
      prototype.methods = {};
    }
    inject_target = prototype.methods;
    frame_index = '$page.$inject_frame';
  } else {            // 页面注入
    inject_target = prototype;
    frame_index = '$inject_frame';
  }
  /**
    * 全局alert
    */
  inject_target.$alert = function (...args) {
    const frame = getProperty(frame_index, this);
    if (!frame) throw new Error('未检测到 frame ，请确保页面正确引入 frame 组件！')
    return frame.dialog.alert(...args);
  }
}
```
它做了两件事
- 为所有的页面以及组件原型添加 $alert 方法
- 调用 $alert 方法时，实际调用的是 `page.$inject_frame.dialog.alert`

其他的交互API（toast等）如法炮制。

这样一来，无论我们是在页面还是组件中，只要引入了 frame ，就可以直接通过 `this.$alert` 开心的实现交互。
