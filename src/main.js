import Vue from 'vue'
import ViewUI from 'view-design'
import 'view-design/dist/styles/iview.css'
import iviewArea from 'iview-area'
import App from './App'
import { router } from './router/index'
import store from './store'
import i18n from '@/locale'
import Icon from 'vue-awesome/components/Icon'
import printJS from "print-js";
require('es6-promise').polyfill()
import 'vue-awesome/icons/brands/qq'
import 'vue-awesome/icons/brands/weixin'
import 'vue-awesome/icons/brands/weibo'
import 'vue-awesome/icons/brands/github'
import { getRequest, postRequest, putRequest, deleteRequest, importRequest, uploadFileRequest } from '@/libs/axios'
import { setStore, getStore, removeStore, setSessionStore, getSessionStore, removeSessionStore, setCookieStore, getCookieStore, removeCookieStore } from '@/libs/storage'
import globalUtil from '@/libs/globalUtil'
import longUtil from '@/libs/longUtil'
import { getDatePickerDistance, getDatePickerDefault } from '@/libs/dateTime'
import { getQuarterSeasonEndDate } from '@/libs/dateUtil'
import util from '@/libs/util'
import hasPermission from '@/libs/hasPermission'
import hasRole from '@/libs/hasRole'
import VueLazyload from 'vue-lazyload'
import VueClipboard from 'vue-clipboard2'
import ClipboardJS from 'clipboard';
import VueApexCharts from 'vue-apexcharts'
import '@babel/polyfill'
import handleAuthcMethods from '@/libs/handleAuthcMethods'
import handleSystemMethods from '@/libs/handleSystemMethods'
import handleCardStockMethods from '@/libs/handleCardStockMethods'


//全局注册
import Msg from '@/libs/globalMessage'
Vue.use(Msg);
//统一请求
import api from './api/apiUrl'
Vue.prototype.apiUrl = api;
import base from '@/libs/base'
Vue.use(base);

//注册JSEncrypt方法 
import JSEncrypt from 'jsencrypt';
Vue.prototype.getRsaCode = function (str, pubKey) {
    let encryptStr = new JSEncrypt();
    encryptStr.setPublicKey(pubKey); // 设置 加密公钥
    let data = encryptStr.encrypt(str.toString());  // 进行加密
    return data;
}
//全局变量
import globalCommon from '@/views/global'
Vue.prototype.globalCommon = globalCommon;

//Mock配置 
require('./mock/mock.js')

// 默认为false是生产环境。我们将其设置为true即进入了开发环境
Vue.config.productionTip = true

Vue.use(VueLazyload, {
    error: require('./assets/img-error.png'),
    loading: require('./assets/loading2.gif')
})
Vue.use(ViewUI, {
    i18n: (key, value) => i18n.t(key, value)
});
Vue.use(iviewArea);
Vue.component('icon', Icon);
Vue.use(VueClipboard);
Vue.use(hasPermission);
Vue.use(hasRole);
Vue.use(VueApexCharts);
Vue.component('apexchart', VueApexCharts);
// 挂载全局使用的方法
Vue.prototype.getRequest = getRequest;
Vue.prototype.postRequest = postRequest;
Vue.prototype.putRequest = putRequest;
Vue.prototype.deleteRequest = deleteRequest;
Vue.prototype.importRequest = importRequest;
Vue.prototype.uploadFileRequest = uploadFileRequest;
//注册存储Storage
Vue.prototype.setStore = setStore;
Vue.prototype.getStore = getStore;
Vue.prototype.removeStore = removeStore;
Vue.prototype.setSessionStore = setSessionStore;
Vue.prototype.getSessionStore = getSessionStore;
Vue.prototype.removeSessionStore = removeSessionStore;
Vue.prototype.setCookieStore = setCookieStore;
Vue.prototype.getCookieStore = getCookieStore;
Vue.prototype.removeCookieStore = removeCookieStore;
//注册时间区间
Vue.prototype.getDatePickerDistance = getDatePickerDistance;
Vue.prototype.getDatePickerDefault = getDatePickerDefault;
Vue.prototype.getQuarterSeasonEndDate = getQuarterSeasonEndDate;
Vue.prototype.printJS = printJS;
//提示信息


//注册常用方法
Vue.prototype.ClipboardJS = ClipboardJS;
Vue.prototype.handleAuthcMethods = handleAuthcMethods;
Vue.prototype.handleSystemMethods = handleSystemMethods;
Vue.prototype.handleCardStockMethods = handleCardStockMethods;
Vue.prototype.globalUtil = globalUtil;
Vue.prototype.longUtil = longUtil;

/* eslint-disable no-new */
new Vue({
    el: '#app',
    router,
    store,
    i18n,
    render: h => h(App),
    data() {
        return {
            currentPageName: '',
            publicPath: process.env.BASE_URL,
        }
    },
    mounted() {
        console.log("main.js mounted");
        // 初始化菜单
        util.initRouter(this);
        this.currentPageName = this.$route.name;
        // 显示打开的页面的列表
        this.$store.commit('setOpenedList');
        this.$store.commit('initCachepage');
    }
})
