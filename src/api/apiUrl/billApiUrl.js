//基础url
let apiUrl = '/api';

//业务管理都归于此）

let API = {

    //【卡业务单号】
    businessNumber: {
        getNumber: apiUrl + '/card/business/number'
    },

    //【调拨编制】
    cardBillAllot: {
        list: apiUrl + '/card/allot/list',
        status: apiUrl + '/card/allot/status/code',
        listItem: apiUrl + '/card/allot/item/list',
        insert: apiUrl + '/card/allot/insert',
        update: apiUrl + '/card/allot/update',
        deleteItem: apiUrl + '/card/allot/item/delete',
        delete: apiUrl + '/card/allot/delete',
        updateStatus: apiUrl + '/card/allot/update/status',
        allotSelect: apiUrl + '/card/allot/select',
    },
};

export default {
    API: API,
}