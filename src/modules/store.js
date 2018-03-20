import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex);

const debug = process.env.NODE_ENV === 'development';

const modules = {};

let store = new Vuex.Store({
    state: {},
    getters: {},
    mutations: {},
    actions: {},
    modules,
    plugins: debug ? [require('vuex/dist/logger')()] : [],
    strict: debug
});

export default store;