## 介绍
由于小程序的多页面机制，在不同页面间的数据交互以及回调处理是一个比较折腾的事情。

借助之前的全局页面拦截，在页面内部集成了自己的 `navigateTo` 以及 `navigateBack` 方法，可以简洁的实现页面间交互。
## API
### `this.$navigateTo`
#### 入参 
入参规则与`my.navigateTo` 一致，新增了 `param` 参数。
- `url`
- `success`
- `fail`
- `complete`
- `param`
#### 调用示例
```js
this.$navigateTo({
    url: '/page/item-add/purchase/purchase',
    param: {
        name:'123',
        id:'456'
    }
});
```
> param参数直接**通过内存传递**而不经过url解析。能够对复杂参数（超长json，函数，正则，循环引用等等）进行处理。

#### 参数获取
在目标页面的 `onLoad `生命周期正常获取。
```js
onLoad(param) {
    console.log(param)  // param 会合并原有的 url 参数以及内存参数
},
```
> 页面 onLoad 之后可直接使用 `this.$inject_prev_page` 获取上个页面实例

### `this.$navigateBack`
#### 入参
入参规则与`my.navigateBack` 一致，新增了 Promise 返回值，可以拿到回退后的页面实例。
- `delta` 返回的页面数，默认为1。如果 delta 大于现有打开的页面数，则返回到首页。

#### 调用示例
```js
this.$navigateBack().then(prev => {
    console.log(prev) // 返回的页面实例
})
```

## 应用场景
宝贝详情页面，跳转到编辑宝贝属性，点击保存后将值回传到详情页并更新。
- 宝贝详情页
```js
/**
  * 跳转到属性编辑页面
  */
propsEdit(){
    this.$navigateTo({
        url:'pages/item-add/props-edit'
        param:{
            props:this.data.props
        }
    })
}
/**
  * 回调函数
  */
propsEditHandler(props){
    itemUpdate(props); // 拿到页面返回值
},
```
- 属性编辑页
```js
onLoad({props}){
    this.setData({
        props:JSON.parse(JSON.stringify(props))
    })
}
/**
  * 保存方法，回传结果
  */
save(){
    this.$navigateBack().then(prev_page=>{
        prev_page.propsEditHandler(this.data.props)
    })
}
```
::: warning 注意

这里要注意一点，由于是使用内存传参，上个页面拿过来的参数实际上是上个页面data的内存引用，当前页面中对param的任何修改都会直接引起上个页面data值的变化。

如果直接将param作为当前页的data，或者要对param进行改动，那么要对param进行深拷贝处理。

如果没有此类需求，那么则不需处理。
:::
这里是直接调用回退页面的指定方法。如果是公共页面，可以手动传递回调函数名来进行调用。
- 传递callback参数
```js
 this.$navigateTo({
        url:'pages/item-add/props-edit'
        param:{
            callback:'xxxHandler'
        }
    })
```
- 动态触发回调
```js
onLoad({props,callback}){
    this.$callback = callback;
}

save(){
    this.$navigateBack().then(prev_page=>{
        prev_page[this.$callback](this.data.props)
    })
}
```

## Inject源码
```js
Page = function (prototype) {
    /**
     * navigate 导航注入
     */
    navigateInject(prototype);
    
    // ... 其他逻辑处理
}
/**
 * 全局导航
 */
function navigateInject(prototype) {
  /**
    * 导航事件
    * @param url
    * @param success
    * @param fail
    * @param complete
    * @param param      // 导航内存传参（原有值的引用）
    */
  prototype.$navigateTo = function ({ url, success, fail, complete, param }) {
    if (!this.$inject_navigating) {     // 不处于跳转状态
      Object.defineProperty(this, '$inject_navigating', { value: true, configurable: true });     // 置为跳转状态
      Object.defineProperty(this, '$inject_param', { value: param, configurable: true }); // 保存深拷贝参数
      my.navigateTo({ url, success, fail, complete });
    }
  }
  /**
    * 回退事件
    * @param delta 退回的页面数
    * @param success 退回后触发的事件，参数为退回到的页面实例
    */
  prototype.$navigateBack = function (param) {
    const delta = param && param.delta ? parseInt(param.delta) : 1;
    const pages = getCurrentPages();                      // 获取页面栈
    const target = pages.length - 1 - delta;
    const target_page = pages[target < 0 ? 0 : target]   // 回退到的页面实例
    my.navigateBack({ delta })
    return Promise.resolve(target_page);
  }
  /**
   * 重写onload事件
   */
  const onLoad = prototype.onLoad;
  prototype.onLoad = function (query) {         // 重写onLoad事件
    const pages = getCurrentPages();
    const prev_page = pages[pages.length - 2];  // 获取上个页面栈实例
    if (prev_page) {
      const param = prev_page.$inject_param;
      Object.assign(query, param);              // 合并内存参数
      Object.defineProperty(this, '$inject_prev_page', { value: prev_page }); // 缓存上个页面实例
      delete prev_page.$inject_navigating;
      delete prev_page.$inject_param;
    }
    onLoad.call(this, query)
  }
  /**
   * 重写onShow事件,页面被返回时清空（当下一个页面加载较慢，用户还未触达next onLoad就点击返回，执行清空操作）
   */
  const onShow = prototype.onShow;
  prototype.onShow = function () {         // 重写onShow事件
    delete this.$inject_navigating;
    delete this.$inject_param;
    onShow&&onShow.call(this)
  }
}
```


