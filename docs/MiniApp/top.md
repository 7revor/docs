## 思路
大体思路为云函数调用top接口可以手动传递session参数。
## 创建云函数
`top/index.js`
```js
exports.main = async (context) => {
    const { api, data, session } = context.data;
    try {
        const result = await context.cloud.topApi.invoke({  
            api,
            data: {
                ...data,
                session
            }
        });
        return { success: 1, data: result }
    } catch (e) {
        console.error(e)
        return { success: 0, msg: e.message || e }
    }
};
```
在云端拿到本地传递的 topApi 名称，参数，以及用户session，对请求做转发。
## 区分top调用方式
```js
/**
 * TOP 基层调用(本地)
 * @param {string} api api名称
 * @param {string} data 参数
 */
async function topNative(option) {
  try {
    const result = await cloud.topApi.invoke(option);
    return { success: true, data: result }
  } catch (error) {
    try {
      const e = JSON.parse(error.message);
      console.warn(e, option);
      return { success: false, msg: e.sub_msg || e.msg || e }
    } catch (e) { // parse e.message 失败
      console.warn(error, option);
      return { success: false, msg: error }
    }
  }
}
/**
 * TOP 基层调用（云函数）
 * @param  {string} name 函数名
 * @param  {object} data 参数
 * @param  {string} handler 云函数的handler
 */
async function topCloud(option) {
  option.session = getApp().globalData.sessionKey; // 获取sessionKey
  if(!option.session) throw new Error('云函数top接口调用需为 app.globalData 配置 sessionkey 参数！')
  try {
    const result = await cloud.function.invoke('top', option, 'main');
    if (result.success) {
      return { success: true, data: topCloudResultFormat(result.data) };
    } else {
      const { msg } = result;
      return { success: false, msg: msg.sub_msg || msg.msg || msg }
    }
  } catch (e) {
    console.error(e)
    return { success: 0, msg: e.message }
  }
}
```
这里要注意一点，本地调用top返回的数据格式没有嵌套的情况，而通过云函数调用，返回数据会像QAP中一样有嵌套的情况出现：

比如我用云函数请求商品详情，获取的部分信息如下：
```js
item:{
    skus:{
        sku:[{},{},{}] // 这里是sku数据
    },
    item_imgs:{
        item_img:[{},{},{}] // 这里是图片数据
    }
}
```

而使用本地直接请求top，返回的数据如下:
```js
item:{
    skus:[{},{},{}], // 这里直接是sku数据
    item_imgs: [{},{},{}] // 这里直接是图片数据
}
```

所以这里就需要我们对云端返回的数据格式做转换，方法如下（可能不太完善，如果有发现另外的嵌套情况需补充逻辑）。
```js
/**
 * 将云函数top接口返回信息统一转换为本地格式
 */
function topCloudResultFormat(data) {
  const warn = new Set();
  function transform(data) {
    const type = Object.prototype.toString.call(data);
    if (type === '[object Object]') {                             // 参数为标准js对象
      return Object.keys(data).reduce((result, key) => {          // 遍历对象key
        const value = data[key];                                  // 取出value
        const value_type = Object.prototype.toString.call(value); // 判断value类型
        if (value_type === '[object Object]') {                   // 嵌套对象
          const keys = Object.keys(value);                        // 取出嵌套对象值
          if (keys.length === 1 && ((keys[0] + 's' === key) || Array.isArray(value[keys[0]]))) {     // 嵌套case
            warn.add('[' + key + '.' + keys[0] + '] 作为嵌套对象被转换');
            result[key] = transform(value[keys[0]]);   // 消除嵌套
          } else {
            result[key] = value ? transform(value) : value;
          }
        } else {
          result[key] = value ? transform(value) : value;
        }
        return result;
      }, {})
    } else if (type === '[object Array]') {     // 数组
      return data.map(element => element ? transform(element) : element);
    } else {   // undefined,boolean,string,number,function,null,Date,RegExp,function,Symbol
      return data
    }
  }
  const result = transform(data);
  [...warn].forEach(info => console.warn(info));
  return result;
}

```
::: warning 注意
该方法应该可以涵盖90%的情况，上线前还需要切换为本地调用并使用真机调试对数据格式进行最后的确认。
::: 

## 配置环境变量
`app.json`新增配置
```js
{
   
    "topEnv": "cloud",   // 云函数调用top接口，
 // "topEnv": "native",  // 本地直接调用top接口
  
}
```
`base.js`入口文件
```js
import config from '/app.json';
/**
 * TOP 基层调用
 * @param {string} api api名称
 * @param {string} data 参数
 */
export async function top(option) {
  const topEnv = config.topEnv || 'native'; // 获取top接口调用模式，默认为本地，模拟器下配置为 cloud
  return topEnv === 'cloud'?await topCloud(option):await topNative(option);
}
```
## 手动获取sessionKey并存储
打开真机调试，获取授权信息后将session保存在globalData中以便接口取用：
```js
App({
  globalData: {
    sessionKey:"手动复制到此处保存（有效期最短应该也得有一天）"
  }
});

```
