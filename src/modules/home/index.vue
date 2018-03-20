<template>
    <div class="content-wrap home-wrap" v-title="''">
        <h1>首页</h1>
        <h2><router-link :to="{name: 'status404'}">GO 404</router-link></h2>
    </div>
</template>

<script>

    export default {
        name: 'home',
        data() {
            return {
                loading: false
            };
        },
    }
</script>

<style lang="scss" type="text/scss">
    @import '../../common/scss/base/variables';
    @import '../../common/scss/base/mixin';
    
    .home-wrap{}
</style>

