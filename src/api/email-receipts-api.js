// 统一请求路径前缀在libs/axios.js中修改
import { getRequest, postRequest, putRequest, deleteRequest, importRequest, getRequestWithNoToken } from '@/libs/axios';
// 统一地址管理 
import emailReceiptsUrl from "../api/apiUrl/emailReceiptUrl.js"

//获取收据信息
export const getReceiptsList = (params) => {
    return getRequest(emailReceiptsUrl.API.emailReceipt.receiptsList, params);

}
//获取收据收据所有状态
export const getReceiptsStatus = (params) => {
    return getRequest(emailReceiptsUrl.API.emailReceipt.status, params);
    
}