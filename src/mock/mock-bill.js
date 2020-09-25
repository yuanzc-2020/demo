const Mock = require('mockjs');
console.log('前端 mock mock-bill 环境启动成功')
// 统一地址管理 
import billApiUrl from "../api/apiUrl/billApiUrl.js";
let base = '/invoice';


//获取调拨单列表
Mock.mock(RegExp(base + billApiUrl.API.cardBillAllot.getAllotList + ".*"), 'get', require('./json/bill-json/bill-allot/getAllotList'));
//新增页面-获取调拨单位
Mock.mock(RegExp(base + billApiUrl.API.cardBillAllot.toCorpNameArry + ".*"), 'get', require('./json/bill-json/bill-allot/toCorpNameArry'));
//新增页面-获取调拨单明细
Mock.mock(RegExp(base + billApiUrl.API.cardBillAllot.datailList + ".*"), 'get', require('./json/bill-json/bill-allot/datailList'));
//调拨单单据状态
Mock.mock(RegExp(base + billApiUrl.API.cardBillAllot.getAllotStatus + ".*"), 'get', require('./json/bill-json/bill-allot/getStatusCodes'));
//新增页面-新增
Mock.mock(RegExp(base + billApiUrl.API.cardBillAllot.insert + ".*"), 'post', require('./json/bill-json/bill-allot/datailList'));
//新增页面-编辑调拨单明细
Mock.mock(RegExp(base + billApiUrl.API.cardBillAllot.update + ".*"), 'post', require('./json/bill-json/bill-allot/datailList'));
//调拨单-新增页面-删除明细
Mock.mock(RegExp(base + billApiUrl.API.cardBillAllot.detailDelete + ".*"), 'post', require('./json/bill-json/bill-allot/datailList'));
//调拨单-删除
Mock.mock(RegExp(base + billApiUrl.API.cardBillAllot.deleteAllot + ".*"), 'post', require('./json/bill-json/bill-allot/datailList'));
//调拨单-修改调拨状态
Mock.mock(RegExp(base + billApiUrl.API.cardBillAllot.updateAlloatCardStatus + ".*"), 'post', require('./json/bill-json/bill-allot/datailList'));

