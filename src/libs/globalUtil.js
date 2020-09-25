import { format } from "date-fns";

/**
 * 将对象中时间类型属性转为时间格式字符串后端接收
 */
function dateUtil(data) {
    if (!data) return;
    for (let attr in data) {
        if (data[attr] == null || data[attr] == undefined) {
            delete data[attr];
        } else if (data[attr] instanceof Date) {
            data[attr] = format(data[attr], "YYYY-MM-DD HH:mm:ss");
        }
    }
    return data;
}

/**
 * 将对象中数字拆分成按4位 空格
 */
function cardNumberConvert(str) {
    if (str == null || str == undefined || str == '') return;
    return str.replace(/\s/g, '').replace(/(\d{4})(?=\d)/g, '$1 ');
}


/**
 * 将大于15数字对象中数字拆分成按4位 空格 加*
 */
function cardNumberSplit(str) {
    if (str == null || str == undefined || str == '') return;
    let rst = str.replace(/\s/g, '').replace(/(\d{4})(?=\d)/g, '$1 ');
    return rst.substring(0, 15) + "****" + rst.substring(19, 23);
}

/**
 * 去掉字符串中的所有空格，不仅仅包含前后空格
 */
function cardNumberReplaceAll(str) {
    if (str == null || str == undefined || str == '') return;
    return str.replace(/\s/ig, '');
}




/**
 * 把扁平数据转成树形数据,filter只支持数组过滤
 * 调用时，字段名以字符串的形式传参，如treeData(source, 'id', 'parentId', 'children')
 */
function listConvertTreeData(source, id, parentId, children) {
    let cloneData = JSON.parse(JSON.stringify(source))
    return cloneData.filter(father => {
        let branchArr = cloneData.filter(child => father[id] == child[parentId]);
        branchArr.length > 0 ? father[children] = branchArr : ''
        return father[parentId] == 0        // 如果第一层不是parentId=0，请自行修改
    })
}

/**
 * 把扁平数据转成树形数据,filter只支持数组过滤
 * 调用时，字段名以字符串的形式传参，如treeData(source, 'id', 'parentId', 'children')
 */
function listConvertTree(source, id, parentId, children, pid) {
    let cloneData = JSON.parse(JSON.stringify(source))
    return cloneData.filter(father => {
        let branchArr = cloneData.filter(child => father[id] == child[parentId]);
        branchArr.length > 0 ? father[children] = branchArr : ''
        return father[parentId] == pid        // 如果第一层不是parentId=0，请自行修改
    })
}

/**
 * 这个方法不会影响原来的对象，而是返回一个新对象,filter只支持数组过滤
 * 调用时如filterParams(obj)
 */
function filterParams(obj) {
    let _newPar = {};
    for (let key in obj) {
        //如果对象属性的值不为空，就保存该属性（这里我做了限制，如果属性的值为0，保存该属性。如果属性的值全部是空格，属于为空。）
        if (
            (obj[key] === 0 || obj[key]) &&
            obj[key].toString().replace(/(^\s*)|(\s*$)/g, '') !== ''
        ) {
            //记录属性
            _newPar[key] = obj[key];
        }
    }
    //返回对象
    return _newPar;
}

/**
 * 对数组指定字段进行排序
 * 调用时如compareArraySort(obj)
 */
function compareArraySort(property) {
    return function (a, b) {
        var x = a[property];
        var y = b[property];
        if (x < y) {
            return -1;
        }
        if (x > y) {
            return 1;
        }
        return 0;
    };
}

/**
 * 对数组对象去重
 * @param {any} objarray:数组 
 */
function arrayToDistinct(objarray) {
    let len = objarray.length;
    let tempJson = {};
    let res = [];
    for (let i = 0; i < len; i++) {
        //取出每一个对象
        tempJson[JSON.stringify(objarray[i])] = true;
    }
    let keyItems = Object.keys(tempJson);
    for (let j = 0; j < keyItems.length; j++) {
        res.push(JSON.parse(keyItems[j]));
    }
    return res;
}

export default {
    dateUtil,
    cardNumberConvert,
    cardNumberSplit,
    cardNumberReplaceAll,
    listConvertTreeData,
    listConvertTree,
    filterParams,
    compareArraySort,
    arrayToDistinct
}

