//基础url
let apiUrl = '/api';

//业务管理都归于此）

let API = {

    //【卡业务单号】
    businessNumber: {
        getNumber: apiUrl + '/card/business/number'
    },

    //【调拨编制】
    emailReceipt: {
        list: apiUrl + '/email/list',
        receiptsList: apiUrl + '/email/receiptsList',
        status: apiUrl + '/email/status',
        listItem: apiUrl + '/email/listItem',
        insert: apiUrl + '/email',
        update: apiUrl + '/email',
        deleteItem: apiUrl + '/email',
        delete: apiUrl + '/email',
        updateStatus: apiUrl + '/email',
        allotSelect: apiUrl + '/email',
    },
    
};

export default {
    API: API,
}