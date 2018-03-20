<template>
    <div class="app">
        <header-nav></header-nav>
        <transition name="fade" mode="out-in">
            <router-view></router-view>
        </transition>
    </div>
</template>

<script>
    import store from './store'
    import HeaderNav from './layout/header/header'

    export default {
        name: 'appWrap',
        components: {
            HeaderNav
        },
        store
    }

</script>
<style lang="scss" type="text/scss">
    @import '../common/scss/index';

    .app{
        height: 100%;
        background: #fff;
    }
</style>
