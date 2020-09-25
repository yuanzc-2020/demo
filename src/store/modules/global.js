const global = {
    state: {
        // 当前登录用户 
        getCurrentUserInfo: {},
    },
    mutations: {
        setCurrentUserInfo(state, obj) {
            state.getCurrentUserInfo = obj;
        },

    }
};

export default global;
