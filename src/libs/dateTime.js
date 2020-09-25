/**
 * 获取查询默认时间区间  
 * @param {当前日期，往前推天数} firstValue 
 * @param {当前日期，往后推天数} secondValue  
 */
export const getDatePickerDistance = (firstValue, secondValue) => {
    const nowBeginDate = new Date(new Date().setDate(new Date().getDate() - firstValue));
    const nowEndDate = new Date(new Date().setDate(new Date().getDate() + secondValue));
    const nowdate = [nowBeginDate, nowEndDate];
    return nowdate;
}

/**
 * 获取查询默认时间区间  
 * @param {当前日期，往前推天数} firstValue 
 * @param {当前日期，往后推天数} secondValue  
 */
export const getDatePickerDefault = (firstValue, secondValue) => {
    var startStop = new Array();
    const nowBeginDate = new Date(new Date().setDate(new Date().getDate() - firstValue));
    const nowEndDate = new Date(new Date().setDate(new Date().getDate() + secondValue));
    const nowdate = [nowBeginDate, nowEndDate];
    startStop.push(nowdate);
    //转换开始日期
    var year1 = nowBeginDate.getFullYear();
    var month1 = nowBeginDate.getMonth() + 1;
    var day1 = nowBeginDate.getDate();
    var beginDate = year1 + '-' + PrefixZero(month1, 2) + '-' + PrefixZero(day1, 2);
    startStop.push(beginDate);
    //转换结束日期
    var year2 = nowEndDate.getFullYear();
    var month2 = nowEndDate.getMonth() + 1;
    var day2 = nowEndDate.getDate();
    var endDate = year2 + '-' + PrefixZero(month2, 2) + '-' + PrefixZero(day2, 2);
    startStop.push(endDate);
    return startStop;
}
/** 
* @param num： 被操作数
* @param n： 固定的总位数
*/
function PrefixZero(num, n) {
    return (Array(n).join(0) + num).slice(-n);
}


