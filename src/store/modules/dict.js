const dict = {
    state: {
        // 常量数据
        priority: [{
            "title": "普通",
            "value": 0
        }, {

            "title": "重要",
            "value": 1
        }, {

            "title": "紧急",
            "value": 2

        }],
        getData: [],
    },
    mutations: {
        setData(state, list) {
            state.getData = list;
        },
    }
};

export default dict;
