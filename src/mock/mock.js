// 将所有的mock文件引入  
require('@/mock/mock-bill')
require('@/mock/mock-dataQuery')
require('@/mock/mock-flow')
require('@/mock/mock-report')
require('@/mock/mock-system')

// 在这里可以做一些通用的配置
const Mock = require("mockjs")
console.log('前端 mock 环境启动成功')
// 统一地址管理 
import systemApiUrl from "../api/apiUrl/systemApiUrl.js";
let base = '/invoice';

//引入billApiUrl 下面才能调用
import billApiUrl from "../api/apiUrl/billApiUrl.js";
import emailReceiptsUrl from "../api/apiUrl/emailReceiptUrl.js"

// 格式： Mock.mock( url, post/get , 返回的数据)；

// 获取加密RSA KEY
Mock.mock(base + systemApiUrl.API.rsa.key, 'get', require('./json/rsaKey'));
// 用户登录
Mock.mock(base + systemApiUrl.API.login.doLogin, 'post', require('./json/login'));


// 用户退出
Mock.mock(base + systemApiUrl.API.login.logout, 'post', require('./json/login'));
// 用户切换
Mock.mock(base + systemApiUrl.API.login.change, 'post', require('./json/login'));
// 用户身份
Mock.mock(RegExp(base + systemApiUrl.API.login.principalList + ".*"), 'get', require('./json/getUserUnitList'));
// 获取登陆用户信息
Mock.mock(RegExp(base + systemApiUrl.API.login.userInfo + ".*"), 'get', require('./json/loginuserinfo'));
// 获取登陆菜单信息
Mock.mock(RegExp(base + systemApiUrl.API.permission.getMenuList + ".*"), 'get', require('./json/getMenuList'));
// 发送登录短信验证码
Mock.mock(base + systemApiUrl.API.sms.sendLoginSms, 'post', require('./json/login'));
// 发送重置短信验证码
Mock.mock(base + systemApiUrl.API.sms.sendResetSms, 'post', require('./json/login'));
// 通过手机重置密码
Mock.mock(base + systemApiUrl.API.login.resetByMobile, 'post', require('./json/login'));


// 调拨单列表
Mock.mock(base + billApiUrl.API.cardBillAllot.list, 'get', require('./json/bill-json/bill-allot/getAllotList.json'));


//获取收据单列表
Mock.mock(RegExp(base + emailReceiptsUrl.API.emailReceipt.receiptsList + ".*"), 'get', require('./json/receipts-json/email-receipts-json/getReceiptsList.json'));
//获取收据单状态
Mock.mock(RegExp(base + emailReceiptsUrl.API.emailReceipt.status + ".*"), 'get', require('./json/receipts-json/email-receipts-json/receipts-status.json'));

Mock.mock(RegExp(base + billApiUrl.API.cardBillAllot.receiptsList + ".*"), 'get', require('./json/receipts-json/email-receipts-json/getReceiptsList.json'));

Mock.mock(RegExp(base + systemApiUrl.API.login.getPrincipalList + ".*"), 'get', require('./json/json-common/getPrincipalList'))




