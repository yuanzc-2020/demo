// 统一请求路径前缀在libs/axios.js中修改
import { getRequest, postRequest, putRequest, deleteRequest, importRequest, getRequestWithNoToken } from '@/libs/axios';
// 统一地址管理 
import billApiUrl from "./apiUrl/billApiUrl.js";

//【获取业务单号】
export const getNumber = (params) => {
    return getRequest(billApiUrl.API.businessNumber.getNumber, params)
}

//【调拨编制】
export const getAllotList = (params) => {
    return getRequest(billApiUrl.API.cardBillAllot.list, params);
}
export const getAllotDatailList = (params) => {
    return getRequest(billApiUrl.API.cardBillAllot.listItem, params);
}
export const getAllotStatus = (params) => {
    return getRequest(billApiUrl.API.cardBillAllot.status, params);
}
export const insert = (params) => {
    return postRequest(billApiUrl.API.cardBillAllot.insert, params);
}
export const update = (params) => {
    return postRequest(billApiUrl.API.cardBillAllot.update, params);
}
export const detailDelete = (itemId, params) => {
    return postRequest(billApiUrl.API.cardBillAllot.deleteItem + `/${itemId}`, params);
}
export const deleteAllot = (allotId, params) => {
    return postRequest(billApiUrl.API.cardBillAllot.delete + `/${allotId}`, params);
}
export const updateAlloatCardStatus = (params) => {
    return postRequest(billApiUrl.API.cardBillAllot.updateStatus, params);
}
export const getStockAllotCardTypeSelect = (params) => {
    return getRequest(billApiUrl.API.cardBillAllot.allotSelect, params);
} 