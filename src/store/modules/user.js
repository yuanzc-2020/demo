import { removeCookieStore } from '@/libs/storage';

const user = {
    state: {},
    mutations: {
        logout() {
            removeCookieStore('loginSessionId');
            // 清空打开的页面等数据
            localStorage.clear();
        }
    }
};

export default user;
