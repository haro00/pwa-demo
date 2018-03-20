import {title} from './directive'
import fetch from '../utils/fetch'

export default {
    install(Vue) {
        /**
         * 自定义指令
         */
        // 改变title
        Vue.directive('title', title);
        /**
         * 自定义方法
         * @type {Function}
         */
        // fetch请求
        Vue.prototype.fetch = fetch;
    }
}