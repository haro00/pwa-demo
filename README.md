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

### License

[MIT](https://github.com/haro00/pwa-demo/blob/master/LICENSE)