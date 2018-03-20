import status from './status'

export default [
    {
        path: '/',
        component: () => import(/* webpackChunkName: 'modules/home' */ '../modules/home/index'),
        name: 'home',
    },
    // 404页面, 必须放到最后
    ...status
];