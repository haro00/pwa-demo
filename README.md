### 构建

* 安装依赖

 ```
// use npm
npm install
// use yarn
yarn install
 ```
 
* 本地开发(不会注册sw)

 ```
npm run dev
 ```
 
* 在生产环境下编写sw.js

 ```
 // 1. 将静态资源打包
 npm run release
 // 2. 启动sw.js打包
 npm run pwa
 // 3. 启动koa
 npm start
 
// 4. 打开localhost:3000访问, 建议使用隐身窗口调试service worker
 ```

### 目录结构

```
|--------------------------------------------------
|---/app    // koa server 
|---|---/dist    // 静态资源文件夹
|---|---/app.js    // koa入口
|---|---/router.js    // koa-router配置
|---/node_modules    // npm依赖
|---/src    // 前端资源, 将会被打包到/app/dist/static
|---|---/common    // 公共资源
|---|---/modules    // 页面的模块
|---|---/router    // 前端路由
|---|---/static    // 静态资源文件夹, 其中的文件会直接copy到/app/dist/static中
|---|---/app.js    // 前端入口
|---|---/sw.js    // service-worker的js
|---|---/template.html    // 模板html, 将会被打包到/app/dist
|---.babelrc    // babel配置
|---.eslintrc    // eslint配置
|---.stylelintrc    // stylelint配置
|---config.js    // 参数配置
|---package.json    // npm配置
|---README.md    // 项目介绍
|---webpack.conf.dev.js    // webpack开发环境配置
|---webpack.conf.pro.js    // webpack生产环境配置
|---webpack.conf.pwa.js    // webpack单独处理sw.js配置
|--------------------------------------------------
```

### 改造步骤

##### 一、添加manifest.json文件

1. 在`/src/static`文件夹创建`manifest.json`，定义应用的名称，图标等等信息：

 ```
{
  "name": "Minimal app to try PWA",
  "short_name": "Minimal PWA",
  "display": "standalone",
  "start_url": "/",
  "theme_color": "#409eff",
  "background_color": "#fcfcfc",
  "icons": [
    {
      "src": "logo-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
 ```

2. 在`/src/static`中添加图标`logo-512x512.png`图片，可以使用别的尺寸，此处只是示例。

3. 在HTML的`<head></head>`中引入`manifest.json`，以下为`html-webpack-plugin`的写法：

```
<link rel="manifest" href="<%= htmlWebpackPlugin.files.publicPath %>manifest.json">
```

##### 二、添加service worker

Service Worker 在网页已经关闭的情况下还可以运行，用来实现页面的缓存和离线，后台通知等等功能。

1. 在HTML中注册`service worker`，此处对`sw.js`的更新做了处理，发布新的版本需要修改版本号，避免一直读取浏览器缓存，保证能及时更新。

 ```
<!--生产环境才会引入，`html-webpack-plugin`不能压缩es6语法-->
<!--如果要使用es6语法可自行压缩，`vue-cli pwa`命令生成的pwa模板有示例-->
<% if (process.env.NODE_ENV === 'production') { %>
<script type="text/javascript">
    if ('serviceWorker' in navigator) {
        var version = '0.0.1';
        window.addEventListener('load', function () {
            navigator.serviceWorker.register('/sw.js').then(function (ev) {
                if (localStorage.getItem('swVersion') !== version) {
                    ev.update().then(function () {
                        localStorage.setItem('swVersion', version)
                    });
                }
                console.log('SW registered: ', ev.scope);
            }).catch(function (err) {
                console.log('SW registration failed: ', err);
            });
        });
    }
</script>
<% } %>
 ```

2. 编写`sw.js`，此处放在了`/src`下:

 ```
const VERSION = 'v1';

// 注册成功，每次注册只会执行一次
self.addEventListener('install', event => {
    // console.log('install', event);
    event.waitUntil(self.skipWaiting());
});

// 激活成功，每次注册只会执行一次
self.addEventListener('activate', event => {
    // console.log('activate', event);
    event.waitUntil(
        Promise.all([
            self.clients.claim(),
            // 清理旧版本
            caches.keys().then(cacheList => Promise.all(
                cacheList.map(cacheName => {
                    if (cacheName !== VERSION) {
                        caches.delete(cacheName)
                    }
                })
            ))
        ])
    )
});

self.addEventListener('fetch', event => {
    // console.log('fetch', event);
    let {request} = event;
    let cacheKey = null;
    if (request.method === 'GET') {
        cacheKey = request.clone();
    }
    
    // 缓存优先
    event.respondWith(async function () {
        let cacheReq = request.clone();
        // cacheAPI无法直接缓存post请求, 所以使用路径跟参数组成的json字符串作为key
        // 请按需配置缓存的post请求
        if (request.method !== 'GET') {
            let reqParams = await request.clone().json();
            reqParams.url = request.url;
            cacheKey = JSON.stringify(reqParams);
        }
        return caches.open(VERSION)
            .then(cache => cache.match(cacheKey)
                .then(res => res || fetch(cacheReq)))
            .catch(err => fetch(cacheReq))
    }());
    // 更新缓存,下次刷新获取新的内容
    event.waitUntil(async function () {
        // cacheAPI无法直接缓存post请求, 所以使用路径跟参数组成的json字符串作为key
        // 请按需配置缓存的post请求
        if (request.method !== 'GET') {
            let reqParams = await request.clone().json();
            reqParams.url = request.url;
            cacheKey = JSON.stringify(reqParams);
        }
        caches.open(VERSION)
            .then(cache => fetch(request)
                .then(res => cache.put(cacheKey, res)))
            .catch(err => {
                console.log(err);
            });
    }());
});
```

##### 三、安装webpack插件
* `copy-webpack-plugin`：用于将静态资源copy到静态资源文件夹。
*  `workbox-webpack-plugin`：使用3.0.0以上版本(之前的版本写法不同)，用于生成`service worker`的js文件。

##### 四、配置生产打包的webpack

```
// 静态资源打包位置
const STATIC_DIST = '/app/dist/static';
// html模板打包位置
const HTML_DIST = '/app/dist';
// html内引用静态资源的前缀
const STATIC_PREFIX = '/static/';
const path = require('path');
const {InjectManifest} = require('workbox-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
// ......

module.exports = {
    // ......其余配置

    output: {
        path: path.join(process.cwd(), STATIC_DIST),
        filename: '[name].[hash:8].js',
        publicPath: STATIC_PREFIX,
        chunkFilename: '[name].[chunkhash:6].js'
    },
    plugins: [
        // ......其余插件

        new CopyWebpackPlugin([
            {
                from: path.join(process.cwd(), '/src/static'),
                to: path.join(process.cwd(), STATIC_DIST),
                ignore: ['.*']
            }
        ]),

        // workbox插件需放最后
        new InjectManifest({
            // 需缓存文件的文件夹
            globDirectory: 'app/dist',
            // 缓存文件夹下的哪些文件可被缓存
            globPatterns: ['**/*.{html,js,css,ico}'],
            // 生成sw.js路径，相对于publicPath，
            // 为了让sw.js能有所有请求的控制权限，将其放外层
            swDest: path.join('../sw.js'),
            // 编写的sw.js的路径
            swSrc: path.join(process.cwd(), '/src/sw.js')
        }),
    ]
}
```

##### 五、启动并离线访问

1. 将静态资源在生产环境下打包，`npm run release`

2. 启动koa，`npm start`

3. 打开localhost:3000访问, 建议使用隐身窗口调试service worker

4. 停止后台或将浏览器离线后刷新网页仍然可以正常访问


### License

[MIT](https://github.com/haro00/pwa-demo/blob/master/LICENSE)