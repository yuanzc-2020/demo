var Long = require("long");

/**
 * 将此firstValue值与secondValue的值进行比较。如果它们相同，则返回0；
 * 如果firstValue值大于secondValue值，则返回1；
 * 如果firstValue值小于secondValue值，则返回-1。
 * @param {需要验证的值} firstValue 
 * @param {需要验证的值} secondValue  
 */
function longCompare(firstValue, secondValue) {
    var longFirstValue = Long.fromString(firstValue, true);
    var longSecondValue = Long.fromString(secondValue, true);
    return longFirstValue.compare(longSecondValue);
}

/**
 * 将此firstValue值与secondValue的值进行比较。
 * firstValue 大于等于 secondValue 返回true，否则返回false
 * @param {需要验证的值} firstValue 
 * @param {需要验证的值} secondValue  
 */
function longCompareWith(firstValue, secondValue) {
    let flag = false;
    var longFirstValue = Long.fromString(firstValue, true);
    var longSecondValue = Long.fromString(secondValue, true);
    if (longFirstValue.compare(longSecondValue) == 1 || longFirstValue.compare(longSecondValue) == 0) {
        flag = true;
    }
    return flag
}

/**
 * value 是否在firstValue值与secondValue的值之前，如果在返回true，否则返回false；
 * @param {需要验证的值} value 
 * @param {需要验证的值} firstValue 
 * @param {需要验证的值} secondValue  
 */
function longCompareBetween(value, firstValue, secondValue) {
    let flag = false;
    var value = Long.fromString(value, true);
    var longFirstValue = Long.fromString(firstValue, true);
    var longSecondValue = Long.fromString(secondValue, true);
    //校验值 大于开始数字，小于结尾数字
    if (value.compare(longFirstValue) == 1 && value.compare(longSecondValue) == -1) {
        flag = true;
    } else if //校验值 等于开始数字，小于结尾数字
        (value.compare(longFirstValue) == 0 && value.compare(longSecondValue) == -1) {
        flag = true;
    } else if //校验值 大于开始数字，等于结尾数字
        (value.compare(longFirstValue) == 1 && value.compare(longSecondValue) == 0) {
        flag = true;
    } else if //校验值 等于开始数字，等于结尾数字
        (value.compare(longFirstValue) == 0 && value.compare(longSecondValue) == 0) {
        flag = true;
    }
    return flag
}

/**
 * 开始号码 与 结束号码计算数量 
 * @param {需要验证的值} firstValue 
 * @param {需要验证的值} secondValue  
 */
function longCalculateReduce(firstValue, secondValue) {
    var longFirstValue = Long.fromString(firstValue, true);
    var longSecondValue = Long.fromString(secondValue, true);
    return (longSecondValue.subtract(longFirstValue)).add(1).toInt();
}


export default {
    longCompare,
    longCompareWith,
    longCompareBetween,
    longCalculateReduce
}

