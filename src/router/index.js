import Vue from 'vue';
import ViewUI from 'view-design';
import Util from '../libs/util';
import VueRouter from 'vue-router';
import Cookies from 'js-cookie';
import { routers, otherRouter } from './router';
import store from '../store';
import { getStore, getCookieStore } from '../libs/storage'

Vue.use(VueRouter);

// 路由配置
const RouterConfig = {
    mode: 'history',
    routes: routers
};

export const router = new VueRouter(RouterConfig);
// 使用 router.beforeEach 注册一个全局前置守卫，判断用户是否登陆
router.beforeEach((to, from, next) => {
    // to: Route: 即将要进入的目标 路由对象
    // from: Route: 当前导航正要离开的路由
    // next: Function: 一定要调用该方法来 resolve 这个钩子。执行效果依赖 next 方法的调用参数。
    ViewUI.LoadingBar.start();
    Util.title(to.meta.title);
    var name = to.name;
    var fromname = from.name;
    console.log('=== router.beforeEach ===');
    // 判断当前是否是锁定状态
    if (Cookies.get('locking') == '1' && name !== 'locking') {
        next({
            replace: true,
            name: 'locking'
        });
    } else if (Cookies.get('locking') == '0' && name == 'locking') {
        this.$router.go(-1)
        next(false);
    } else {
        // 白名单
        var whiteList = name != 'login' && name != 'regist' && name != 'reset' && name != 'authorize';
        // 没有登录且前往的页面不是登录页
        if (!getCookieStore('loginSessionId') && whiteList) {
            next({
                name: 'login'
            });
        } else
            // 已经登陆成功，切换用户身份
            if (getCookieStore('loginSessionId') && getStore('loginStep') == 'loginSuccess' && name != 'switchcorp') {
                Util.title();
                next({
                    name: 'switchcorp'
                });
            } else
                // 已经登陆成功，已经择用户身份
                if (getCookieStore('loginSessionId') && getStore('loginStep') == 'homeSuccess' && (name == 'login' || name == 'switchcorp')) {
                    // 判断是否已经登录且前往的是登录页
                    Util.title();
                    next({
                        name: 'home_index'
                    });
                }
                else {
                    Util.toDefaultPage([...routers], name, router, next);
                }
    }
});
// 在跳转之后判断
router.afterEach((to, form) => {
    Util.openNewPage(router.app, to.name, to.params, to.query);
    ViewUI.LoadingBar.finish();
    window.scrollTo(0, 0);
});
