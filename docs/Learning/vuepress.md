# 介绍
VuePress 由两部分组成：一部分是支持用 Vue 开发主题的极简静态网站生成器，另一个部分是为书写技术文档而优化的默认主题。它的诞生初衷是为了支持 Vue 及其子项目的文档需求。
每一个由 VuePress 生成的页面都带有预渲染好的 HTML，也因此具有非常好的加载性能和搜索引擎优化（SEO）。同时，一旦页面被加载，Vue 将接管这些静态内容，并将其转换成一个完整的单页应用（SPA），其他的页面则会只在用户浏览到的时候才按需加载。



## 快速上手

::: warning 注意：
请确保你的 Node.js 版本 >= 8。
:::

## @全局安装

```bash
npm install -g vuepress
```
:::warning 注意
全局安装vuepress会和`webpack-dev-middleware@3.6.1`冲突，导致运行意外报错
:::

## 构建项目
### 项目结构
```bash
# 新建项目
mkdir my_blog
cd my_blog
# 新建文档目录
mkdir docs 
mkdir docs/.vuepress
# 创建配置文件
touch package.json
touch docs/.vuepress/config.js
# 创建第一个文档
touch docs/README.md
```
此时项目目录为
```jsx harmony
my_blog
├─── docs //文档目录
│   ├── README.md //第一篇文档 `hello vuepress`
│   └── .vuepress //主要用于存放VuePress相关的文件
│       └── config.js //VuePress必要的配置文件
└── package.json

```
### 配置package.json
VuePress中有两个命令，vuepress dev docs命令运行本地服务，通过访问http://localhost:8080即可预览网站，vuepress build docs命令用来生成静态文件，默认情况下，放置在docs/.vuepress/dist目录中，当然你也可以在docs/.vuepress/config.js中的dest字段来修改默认存放目录。在这里将两个命令封装成脚本的方式，直接使用npm run docs:dev和npm run docs:build即可
```jsx harmony
{
  "scripts": {
    "docs:dev": "vuepress dev docs",
    "docs:build": "vuepress build docs"
  },
  "dependencies": {
    "vuepress": "^0.14.10"
  },
  "resolutions": {
    "webpack-dev-middleware": "3.6.0"
  }
}
```
> 这里手动引入`vuepress`和`webpack-dev-middleware@3.6.0`
### 安装依赖
```bash
yarn # 或者  npm i
```

### 运行
```bash
yarn docs:dev # 或者：npm run docs:dev 
# 全局安装可直接执行 vuepress dev
```
### 编译
要生成静态的 HTML 文件，运行

```bash
yarn docs:build # 或者：npm run docs:build 
# 全局安装可直接执行 vuepress build
```


##  配置默认主题



### 首页
默认的主题提供了一个首页（Homepage）的布局，
编辑根目录下的README.md文件
```jsx harmony
---
home: true
heroImage: /hero.png
actionText: 快速上手 →
actionLink: /zh/guide/
features:
- title: 简洁至上
  details: 以 Markdown 为中心的项目结构，以最少的配置帮助你专注于写作。
- title: Vue驱动
  details: 享受 Vue + webpack 的开发体验，在 Markdown 中使用 Vue 组件，同时可以使用 Vue 来开发自定义主题。
- title: 高性能
  details: VuePress 为每个页面预渲染生成静态的 HTML，同时在页面被加载的时候，将作为 SPA 运行。
footer: MIT Licensed | Copyright © 2018-present Evan You
---
```

### 导航栏
导航栏可能包含你的页面标题、搜索框、 导航栏链接、多语言切换等等，它们均取决于你的配置。

#### 导航栏链接
可以通过 themeConfig.nav 增加一些导航栏链接

```jsx harmony
// .vuepress/config.js
module.exports = {
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/' },
      { text: 'External', link: 'https://google.com' },
    ]
  }
}
```
当提供了一个 items 数组而不是一个单一的 link 时，它将显示为一个 下拉列表 ：

```jsx harmony
module.exports = {
  themeConfig: {
    nav: [
      {
        text: 'Languages',
        items: [
          { text: 'Chinese', link: '/language/chinese' },
          { text: 'Japanese', link: '/language/japanese' }
        ]
      }
    ]
  }
}
```
此外，还可以通过嵌套的 items 来在 下拉列表 中设置分组：

```jsx harmony
module.exports = {
  themeConfig: {
    nav: [
      {
        text: 'Languages',
        items: [
          { text: 'Group1', items: [/*  */] },
          { text: 'Group2', items: [/*  */] }
        ]
      }
    ]
  }
}
```
可以使用 themeConfig.navbar 来禁用所有页面的导航栏：
```jsx harmony
module.exports = {
  themeConfig: {
    navbar: false
  }
}
```

### 侧边栏
想要使 侧边栏（Sidebar）生效，需要配置 themeConfig.sidebar，基本的配置，需要一个包含了多个链接的数组：
```jsx harmony
// .vuepress/config.js
module.exports = {
  themeConfig: {
    sidebar: [
      '/',
      '/page-a',
      ['/page-b', 'Explicit link text']
    ]
  }
}
```
> 可以省略 .md 拓展名，同时以 / 结尾的路径将会被视为 */README.md

### 嵌套的标题链接
默认情况下，侧边栏会自动地显示由当前页面的标题（headers）组成的链接，并按照页面本身的结构进行嵌套，你可以通过 themeConfig.sidebarDepth 来修改它的行为。默认的深度是 1，它将提取到 h2 的标题，设置成 0 将会禁用标题（headers）链接，同时，最大的深度为 2，它将同时提取 h2 和 h3 标题。

```jsx harmony
---
sidebarDepth: 2
---
```

### 显示所有页面的标题链接
默认情况下，侧边栏只会显示由当前活动页面的标题（headers）组成的链接，你可以将 themeConfig.displayAllHeaders 设置为 true 来显示所有页面的标题链接：

```jsx harmony
module.exports = {
  themeConfig: {
    displayAllHeaders: true // 默认值：false
  }
}
```

### 侧边栏分组
可以通过使用对象来将侧边栏划分成多个组：

```jsx harmony
// .vuepress/config.js
module.exports = {
  themeConfig: {
    sidebar: [
      {
        title: 'Group 1',
        collapsable: false,
        children: [
          '/'
        ]
      },
      {
        title: 'Group 2',
        children: [ /* ... */ ]
      }
    ]
  }
}
```

### 多个侧边栏

如果你想为不同的页面组来显示不同的侧边栏，首先，将你的页面文件组织成下述的目录结构：

```jsx harmony
.
├─ README.md
├─ contact.md
├─ about.md
├─ foo/
│  ├─ README.md
│  ├─ one.md
│  └─ two.md
└─ bar/
   ├─ README.md
   ├─ three.md
   └─ four.md
```

接着，遵循以下的侧边栏配置：

```jsx harmony
// .vuepress/config.js
module.exports = {
  themeConfig: {
    sidebar: {
      '/foo/': [
        '',     /* /foo/ */
        'one',  /* /foo/one.html */
        'two'   /* /foo/two.html */
      ],

      '/bar/': [
        '',      /* /bar/ */
        'three', /* /bar/three.html */
        'four'   /* /bar/four.html */
      ],

      // fallback
      '/': [
        '',        /* / */
        'contact', /* /contact.html */
        'about'    /* /about.html */
      ]
    }
  }
}
```

:::warning 
确保 fallback 侧边栏被最后定义。VuePress 会按顺序遍历侧边栏配置来寻找匹配的配置。
:::

### 自定义默认主题颜色
如果你只是希望应用一些简单的 overrides 到默认主题的样式上，可以创建一个 `.vuepress/override.styl` 文件


这里有一些可以调整的颜色变量：

```jsx harmony
// showing default values
$accentColor = #3eaf7c
$textColor = #2c3e50
$borderColor = #eaecef
$codeBgColor = #282c34
```

## 部署到`Git`

### 前提
下述的指南基于以下条件：
- 文档放置在项目的 docs 目录中；
- 使用的是默认的构建输出位置；
- VuePress 以本地依赖的形式被安装到你的项目中，并且配置了如下的 npm scripts:
```jsx harmony
{
  "scripts": {
    "docs:build": "vuepress build docs"
  }
}
```
### 准备
- 前往`github`，创建用于存放文档的`Repo`
- 开启`GitHub Pages`

### `SSH Key`
ssh，简单来讲，就是一个秘钥，其中，id_rsa是你这台电脑的私人秘钥，不能给别人看的，id_rsa.pub是公共秘钥，可以随便给别人看。把这个公钥放在GitHub上，这样当你链接GitHub自己的账户时，它就会根据公钥匹配你的私钥，当能够相互匹配时，才能够顺利的通过git上传你的文件到GitHub上
#### 生成
```bash
git config --global user.name "username"
git config --global user.email "useremail"
ssh-keygen -t rsa -C "1234@qq.com"
```
> 回车后提示输入密码, 此处密码可以不填, 直接回车
#### 配置
上述命令运行成功后，终端会给出存储位置
```bash
Your public key has been saved in /Users/XXX/.ssh/id_rsa.pub
```
打开上述文件，复制文件中的公钥添加到github


#### 测试
在gitbash中，查看是否成功
```bash
ssh -T git@github.com
```


### 开始

- 在 `docs/.vuepress/config.js` 中设置正确的 `base`
如果你打算发布到 `https://<USERNAME>.github.io/`，则可以省略这一步，因为 base 默认即是 "/"。
- 在你的项目中，创建一个如下的 `deploy.sh` 文件（请自行判断去掉高亮行的注释）:
```bash
#!/usr/bin/env sh

# 确保脚本抛出遇到的错误
set -e

# 生成静态文件
npm run docs:build

# 进入生成的文件夹
cd docs/.vuepress/dist

# 如果是发布到自定义域名
# echo 'www.example.com' > CNAME

git init
git add -A
git commit -m 'deploy'

# 如果发布到 https://<USERNAME>.github.io
# git push -f git@github.com:<USERNAME>/<USERNAME>.github.io.git master

# 如果发布到 https://<USERNAME>.github.io/<REPO>
# git push -f git@github.com:<USERNAME>/<REPO>.git master:gh-pages

cd -
```

#### macOS运行.sh脚本需要权限
```bash
chmod 777 deploy.sh
```

## 成果
打开`XXX.github.io`查看成果吧

## 进阶
在vuepress中使用[Vue](https://cn.vuejs.org/v2/guide/index.html)
### 自定义Vue组件
所有在 .vuepress/components 中找到的 *.vue 文件将会自动地被注册为全局的异步组件，如：
```jsx harmony
.
└─ .vuepress
   └─ components
      ├─ demo-1.vue
      ├─ OtherComponent.vue
      └─ Foo
         └─ Bar.vue
```
你可以直接使用这些组件在任意的 Markdown 文件中（组件名是通过文件名取到的）：
```html
<demo-1/>
<OtherComponent/>
<Foo-Bar/>
```

### 使用[ElementUI](http://element-cn.eleme.io/#/zh-CN/component/installation)
由于 `VuePress` 是一个标准的 Vue 应用，你可以通过创建一个 `.vuepress/enhanceApp.js` 文件来做一些应用级别的配置，当该文件存在的时候，会被导入到应用内部。`enhanceApp.js` 应该 `export default` 一个钩子函数，并接受一个包含了一些应用级别属性的对象作为参数。你可以使用这个钩子来安装一些附加的 `Vue` 插件、注册全局组件，或者增加额外的路由钩子等：
```jsx harmony
export default ({
  Vue, // VuePress 正在使用的 Vue 构造函数
  options, // 附加到根实例的一些选项
  router, // 当前应用的路由实例
  siteData // 站点元数据
}) => {
  // ...做一些其他的应用级别的优化
}
```

#### 开始
- 新建``.vuepress/enhanceApp.js``文件，并引入ElementUI
```jsx harmony
import Element from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
export default ({
                  Vue, // VuePress 正在使用的 Vue 构造函数
                  options, // 附加到根实例的一些选项
                  router, // 当前应用的路由实例
                  siteData // 站点元数据
                }) => {
  // ...做一些其他的应用级别的优化
  Vue.use(Element)
}
```
- 安装依赖
在`package.json`中添加
```jsx harmony
"dependencies": {
    "element-ui": "^2.7.0"
}
  ```
```bash
yarn # 或者 npm i
```

- 在`MarkDown`或者自定义组件中使用`ElementUI`

## Travis CI 持续集成部署
### 现有问题
我们使用上述的`deploy.sh`部署到`git`后，`vuepress`是把我们项目打包后的静态资源文件`push`到`git`分支上。
上传后的项目大概是这个样子：
 <Picture src="vuepress/vuepress1.png"/>
  <Picture src="vuepress/vuepress2.png"/>

这么做就有一个明显的弊端。如果这个项目不是个人博客，而是需要多人维护的项目文档，那么其他人想要修改这个文档是没办法把这些html文件`clone`到本地进行修改的。

我们想要的是，`git`上存放我们的项目，即`markdown`文件，我们可以随时修改这些`markdown`然后`push`到线上，我们的`github Pages`则会相应的显示编译好的html。

### 引入
[Travis CI](https://www.travis-ci.org/)正好符合我们的要求。

它的作用是可以监控到我们`git`资源库的每一次变更,在收到`push`请求后会为我们提供一个`虚拟机`来帮助我们执行一些任务，比如我们文档的`build`以及发布。

这样一来我们把修改好的`markdown`推到线上后，`travis`会帮我们自动执行`deploy.sh`里的脚本。我们就可以只专注于文档本身的内容，也方便文档的维护。。
### 准备
#### 重命名
使用`xxx.github.io`作为`github Pages`首页是无法选择分支的，`git`会自动将``xxx.github.io``下的`master`分支当做静态资源。而我们需要的是`master`分支存放我们的项目即`markdown`，另外的分支来存放编译好的`html`
- 更改我们的资源库名为`docs`，新建分支`gh pages`，然后在设置中将`github Pages`分支切换到`gh pages`
 <Picture src="vuepress/vuepress3.png"/>
#### 设置`base`
- 由于文档地址已经更换，这里需要将`config.js`里的`base`设置为`/docs/`
```jsx harmony
module.exports = {
  base:'/docs/'
}
```
#### 配置 `.travis.yml`
然后在项目根目录新建文件 `.travis.yml`， 这个文件内容根据你的项目而定，比如我们的项目可以是这样的
```YAML
language: node_js
sudo: required
node_js:
  - "lts/*"
cache:
  directories:
    - node_modules
script:
  - ./deploy.sh
branch: master
```
#### 修改`deploy.sh`
- 集成 `travis` 还需要我们修改 `deploy.sh`
```bash
#!/usr/bin/env sh

# 确保脚本抛出遇到的错误
set -e

# 生成静态文件
npm run docs:build

# 进入生成的文件夹
cd docs/.vuepress/dist

# 如果是发布到自定义域名
# echo 'www.example.com' > CNAME

git init
git add -A
git commit -m 'deploy'

# 如果发布到 https://<USERNAME>.github.io
# git push -f git@github.com:7revor/7revor.github.io.git master

# 如果发布到 https://<USERNAME>.github.io/<REPO>
# git push -f git@github.com:<USERNAME>/<REPO>.git master:gh-pages

# 如果使用 travis 持续集成
git push -f https://${access_token}@github.com/7revor/docs.git master:gh-pages

cd -

```
### Travis CI配置
#### 监听资源库
- 使用`github`账号登录[Travis CI](https://www.travis-ci.org/)，选择需要自动部署的资源库
 <Picture src="vuepress/vuepress4.png"/>
#### Access token
- 首先在`github`的 `setting -> developer setting -> personal access token`一栏点击`generate new token`， 这下面的选项全选，然后就会生成一个`token`，复制这个`token`。

- 进入`travis`后台，在环境变量`Environment Variables`里设置键值对
 <Picture src="vuepress/vuepress5.png"/>
### 测试
将我们的项目`push`到线上，观察控制台

- `travis`已经监听到我们资源库的变化，开始运行虚拟机
 <Picture src="vuepress/vuepress6.png"/>
 
- 执行`deploy.sh`中的命令
 <Picture src="vuepress/vuepress7.png"/>
 
- 任务执行成功，将`build`后的文件推送到`gh pages`分支
 <Picture src="vuepress/vuepress8.png"/>
 
- 面板显示为`passed`

 <Picture src="vuepress/vuepress9.png"/>

打开`xxx.github.io/docs/`已经可以正常访问了。

这样我们就实现了`master`分支存放`markdown`，`gh pages`存放编译后的静态文件。

如果有新成员加入，直接将`master`分支`clone`到本地，修改后推送到远程仓库,`travis`就会帮我们自动部署。

## 发布到服务器
我们的需求不止要发布到`github Pages`，有时也需要发布到自己的服务器。

### SSH免密登录
首先要确保自己可以通过ssh命令免密登录自己的服务器，这就需要先生成密钥对
```bash
ssh-keygen # 生成密钥对
```
输入上面的指令以后一路回车即可，你会发现在用户根目录下多了`.ssh`目录，进去看一下`cd ~/.ssh`，里面有这3个文件
 <Picture src="vuepress/pubkey.png"/>
 
把`id_rsa.pub`里的内容，手动复制到服务器的`~/.ssh/authorized_keys`(如没有可自行创建)中去即可

::: tip 提示
还有一种方法是使用`ssh-copy-id root@IP`命令，Mac用户可能需要用`brew`安装一下`ssh-copy-id`，`ubuntu`用户应该是自带的这个命令，实现的效果与上面手动的一样
:::
登录服务器的指令如下，如果不需要密码便进入则表示成功
```bash
ssh ${username}@${服务器IP}
```
 <Picture src="vuepress/login.png"/>
 
### 加密
我们要部署到远程服务器，那么势必需要让 Travis 登录到远程服务，那么登录密码怎么处理才能保证安全？这是首先要解决的问题，明文肯定是不行的。
#### Travis命令行工具
使用`Travis命令行工具`将`id_rsa.pub`加密，同时将环境变量传至`Travis`
- 首先通过 `Ruby` 的 `gem` 安装 `travis`
```bash
gem install travis
```
重试了几次发现敲完这段`shell`如同石沉大海一般，就算开了代理还是纹丝不动，没办法只能换镜像了。
```bash
gem update --system
gem sources --add https://gems.ruby-china.com/ --remove https://rubygems.org/
```
好了，现在可以愉快的安装 `travis` 了
```bash
sudo gem install travis
```
- 接下来在命令行中登录 Travis
```bash
travis login

We need your GitHub login to identify you.
This information will not be sent to Travis CI, only to api.github.com.
The password will not be displayed.

Try running with --github-token or --auto if you don't want to enter your password anyway.

Username: xxx@xxx.xxx
Password for xxx@xxx.xxx: ***
Successfully logged in as demo!
```
会要求你输入 GitHub 的账号密码，这个是走 GitHub 的服务，所以不用担心密码泄露。

- 将目录切换到项目根目录下，执行命令
```bash
travis encrypt-file ~/.ssh/id_rsa --add
```
这时在travis的环境变量中会多出两个
 <Picture src="vuepress/en.png"/>

去看一下当前目录下的 .travis.yml，会多出几行
```yaml
before_install:
  - openssl aes-256-cbc -K $encrypted_d89376f3278d_key -iv $encrypted_d89376f3278d_iv
  - in id_rsa.enc -out ~\/.ssh/id_rsa -d
```
::: tip 提示
默认生成的命令可能会在/前面带转义符\，我们不需要这些转义符，手动删掉所有的转义符，否则可能在后面引发莫名的错误
:::
为保证权限正常，多加一行设置权限的 shell
```yaml
before_install:
  - openssl aes-256-cbc -K $encrypted_6dc88f1910e2_key -iv $encrypted_6dc88f1910e2_iv
  -in id_rsa.enc -out ~/.ssh/id_rsa -d
  - chmod 600 ~/.ssh/id_rsa
```
还有一点可能会用上，因为 travis 第一次登录远程服务器会出现 SSH 主机验证，这边会有一个主机信任问题。官方给出的方案是添加 addons 配置：
```yaml
addons:
  ssh_known_hosts: your-ip
```
### 执行部署脚本
既然已经可以免密登录服务器了，那么写一个部署脚本，在登录时执行该脚本就可以了
在 `.travis.yml` 配置文件中写下这么两行：
```yaml
after_success:
  - scp -o StrictHostKeyChecking=no -r docs/.vuepress/dist/* <USER_NAME>@<HOST_IP>:/home/ubuntu/nginx-server/docs
```
完整的`.travis.yml`为
```yaml
language: node_js
sudo: required
node_js:
- lts/*
before_install:
 - openssl aes-256-cbc -K $encrypted_6dc88f1910e2_key -iv $encrypted_6dc88f1910e2_iv
 -in id_rsa.enc -out ~/.ssh/id_rsa -d
 - chmod 600 ~/.ssh/id_rsa
addons:
  ssh_known_hosts: your-ip
cache:
  directories:
  - node_modules
script:
- "./deploy.sh"
branch: master

after_success:
- scp -o StrictHostKeyChecking=no -r docs/.vuepress/dist/* <USER_NAME>@<HOST_IP>:/home/ubuntu/nginx-server/docs

```
### 部署测试
提交代码到远程仓库，在Travis查看log，显示成功上传
 <Picture src="vuepress/success.png"/>
