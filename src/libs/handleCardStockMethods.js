import {
    getStockCardTypeList,
    getAgentStockCardTypeList,
    getAgentStockStatusCode
} from '@/api/card-bill-api';
import { setStore, getStore, removeStore } from '@/libs/storage'
import globalUtil from './globalUtil'

// 定义库存相关的公共的属性和方法

/**
 * 获取分公司库存的卡类，题材等查询条件 
 */
function getCardTypeSelect(params) {
    return new Promise((resolve, reject) => {
        getStockCardTypeList(params).then((res) => {
            if (res.success) {
                let rsdata = res.result;
                let types = [];
                let o = {};
                rsdata.forEach(function (data) {
                    if (!o[data.cardTypeId]) {
                        //过滤卡类的题材
                        let themedata = rsdata.filter(fl => {
                            return fl.cardTypeId == data.cardTypeId
                        });
                        let themes = [];
                        themedata.forEach(em => {
                            themes.push({
                                cardThemeId: em.cardThemeId,
                                cardThemeName: em.cardThemeName
                            });
                        });
                        //卡类，题材组装
                        types.push({
                            cardTypeId: data.cardTypeId,
                            cardTypeName: data.cardTypeName,
                            cardThemes: themes
                        });
                        o[data.cardTypeId] = true;
                    }
                });
                resolve(types)
            }
        }).catch(function (error) {
            reject(error)
        })
    })
}


/**
 * 获取库存类型,卡品分类
 */
function getStockDataTypeSelect() {
    return new Promise((resolve, reject) => {
        let ts = [{
            dataTypeId: 1,
            dataTypeName: 'UIM卡（含白卡）',
        }, {
            dataTypeId: 2,
            dataTypeName: '有价卡（含充值付费卡）'
        }];
        resolve(ts)
    })
}


/**
 * 获取代理商库存的卡类，题材等查询条件 
 */
function getAgentStockCardTypeSelect(params) {
    return new Promise((resolve, reject) => {
        getAgentStockCardTypeList(params).then((res) => {
            if (res.success) {
                let rsdata = res.result;
                let types = [];
                let o = {};
                rsdata.forEach(function (data) {
                    if (!o[data.cardTypeId]) {
                        //过滤卡类的题材
                        let themedata = rsdata.filter(fl => {
                            return fl.cardTypeId == data.cardTypeId
                        });
                        let themes = [];
                        themedata.forEach(em => {
                            themes.push({
                                cardThemeId: em.cardThemeId,
                                cardThemeName: em.cardThemeName
                            });
                        });
                        //卡类，题材组装
                        types.push({
                            cardTypeId: data.cardTypeId,
                            cardTypeName: data.cardTypeName,
                            cardThemes: themes
                        });
                        o[data.cardTypeId] = true;
                    }
                });
                resolve(types)
            }
        }).catch(function (error) {
            reject(error)
        })
    })
}

/**
 * 获取代理商库存的状态列表 
 */
function getAgentStockStatusSelect() {
    return new Promise((resolve, reject) => {
        getAgentStockStatusCode().then(res => {
            if (res.success) {
                let ts = [];
                res.result.forEach(e => {
                    let co = '';
                    switch (e.statusCode) {
                        case 2000:
                            co = 'green';
                            break;
                        case 2001:
                            co = 'orange';
                            break;
                        case 2002:
                            co = 'red';
                            break;
                        case 2003:
                            co = 'magenta';
                            break;
                        case 2004:
                            co = 'blue';
                            break;
                        default:
                            co = 'default';
                    }
                    ts.push({
                        statusCode: e.statusCode,
                        statusName: e.statusName,
                        color: co
                    });
                });
                resolve(ts)
            }
        }).catch(function (error) {
            reject(error)
        })
    })
}


export default {
    getStockDataTypeSelect,
    getCardTypeSelect,
    getAgentStockCardTypeSelect,
    getAgentStockStatusSelect


}
