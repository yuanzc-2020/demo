import Vue from 'vue';
import Vuex from 'vuex';
import app from './modules/app';
import user from './modules/user';
import dict from './modules/dict';
import global from './modules/global';
Vue.use(Vuex);

const store = new Vuex.Store({
    //状态
    state: {},
    //改变方法
    mutations: {},
    //处理异步方法
    actions: {},
    modules: {
        app,
        user,
        dict,
        global
    }
});

export default store;
