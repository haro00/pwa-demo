import Vue from 'vue'
import VueRouter from 'vue-router'
import plugin from './common/plugin/index'
import App from './modules/app'
import routes from './router/index'

// 开发选项
if (process.env.NODE_ENV !== 'production') {
    Vue.config.devtools = true;
}
// 使用vue-router
Vue.use(VueRouter);
// 使用自定义插件
Vue.use(plugin);
// 定义路由
const router = new VueRouter({
    // mode: 'history',
    routes
});
// 渲染app
const app = new Vue({
    el: '#app',
    router,
    render: h => h(App)
});
