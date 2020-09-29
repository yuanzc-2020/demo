import Main from '@/views/Main.vue';

// 不作为Main组件的子页面展示的页面单独写，如下
export const loginRouter = {
    path: '/login',
    name: 'login',
    meta: {
        title: '发票管理系统-登录', allowBack: false
    },
    component: () => import('@/views/login.vue')
};

export const resetRouter = {
    path: '/reset',
    name: 'reset',
    meta: {
        title: '发票管理系统-重置密码', allowBack: false
    },
    component: () => import('@/views/card-common/common-reset/common-reset.vue')
};

export const page403 = {
    path: '/403',
    meta: {
        title: '403-权限不足', allowBack: false
    },
    name: 'error-403',
    component: () => import('@/views/card-common/common-error-page/403.vue')
};

export const page500 = {
    path: '/500',
    meta: {
        title: '500-服务端错误', allowBack: false
    },
    name: 'error-500',
    component: () => import('@/views/card-common/common-error-page/500.vue')
};

export const locking = {
    path: '/locking',
    name: 'locking', meta: {
        title: '发票管理系统-locking', allowBack: false
    },
    component: () => import('@/views/main-components/lockscreen/components/locking-page.vue')
};

export const switchCorp = {
    path: '/switchcorp',
    name: 'switchcorp',
    meta: {
        title: '发票管理系统-切换单位', allowBack: false
    },
    component: () => import('@/views/card-common/common-switch-unit/common-switch-unit.vue')
};
// export const emailReceiptsManager = {
//     path: '/emailReceiptsManager',
//     name: 'emailReceiptsManager',
//     meta: {
//         title: '发票管理系统-切换单位', allowBack: false
//     },
//     component: () => import('@/views/email-receipts/email-receipts-manager/receipts-manager-all.vue')
// };

// export const receiptsQuery = {
//     path: '/receiptsQuery',
//     name: 'receiptsQuery',
//     meta: {
//         title: '发票管理系统-切换单位', allowBack: false
//     },
//     component: () => import('@/views/email-receipts/email-receipts-manager/receipts-query.vue')
// };
// 作为Main组件的子页面展示但是不在左侧菜单显示的路由写在otherRouter里
export const otherRouter = {
    path: '/',
    name: 'otherRouter',
    redirect: '/home',
    component: Main,
    children: [
        { path: 'home', title: { i18n: 'home' }, name: 'home_index', component: () => import('@/views/home/home.vue') },
        { path: 'ownspace', title: '个人中心', name: 'ownspace_index', component: () => import('@/views/card-common/common-own-space/common-own-space.vue') },
        { path: 'change-pass', title: '修改密码', name: 'change_pass', component: () => import('@/views/card-common/common-change-pass/common-change-pass.vue') },
        { path: 'emailReceiptsManager', title: '收据', name: 'emailReceiptsManager', component: () => import('@/views/email-receipts/email-receipts-manager/receipts-manager-all.vue') },
        { path: 'receiptsQuery', title: '收据', name: 'receiptsQuery', component: () => import('@/views/email-receipts/email-receipts-manager/receipts-query.vue') },
    ]
};

export const appRouter = [];

// 所有上面定义的路由都要写在下面的routers里
export const routers = [
    loginRouter,
    resetRouter,
    otherRouter,
    locking,
    ...appRouter,
    page500,
    page403,
    switchCorp,
    // emailReceiptsManager,
    // receiptsQuery,
];
