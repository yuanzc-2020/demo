/**
 * 密码格式验证
 * @param rule 验证规则（不少于8位）
 * @param value 需要验证的值
 * @param callback 回调函数
 */
export const validatePassword = (rule, value, callback) => {
  //包含大写字母、小写字母、数字、特殊字符至少3个组合大于8个字符
  var reg = /^(?![A-Za-z]+$)(?![A-Z\d]+$)(?![A-Z\W]+$)(?![a-z\d]+$)(?![a-z\W]+$)(?![\d\W]+$)\S{8,}$/;
  if (!reg.test(value)) {
    callback(new Error('请输入强密码'));
  } else {
    callback();
  }
};

/**
 * 手机号码格式验证
 * @param rule 验证规则
 * @param value 需要验证的值
 * @param callback 回调函数
 */
export const validateMobile = (rule, value, callback) => {
  var reg = /^[1][3,4,5,6,7,8,9][0-9]{9}$/;
  if (!reg.test(value)) {
    callback(new Error('手机号格式错误'));
  } else {
    callback();
  }
};

/**
 * 身份证号码格式验证
 * @param rule 验证规则（是否满足18位）
 * @param value 需要验证的值
 * @param callback 回调函数
 */
export const validateIDCard = (rule, value, callback) => {
  const reg = /^[1-9]\d{5}(18|19|([23]\d))\d{2}((0[1-9])|(10|11|12))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
  if (!reg.test(value)) {
    callback(new Error('身份证号码格式错误'));
  } else {
    callback();
  }
};

/**
 * 6位数字验证码
 * @param rule 验证规则（是否满足18位）
 * @param value 需要验证的值
 * @param callback 回调函数
 */
export const validatorCodeNumber = function (rule, value, callback) {
  const reg = /^[0-9]*$/;
  if (!reg.test(value)) {
    callback(new Error('格式错误'));
  } else {
    callback();
  }
}
/**
 * 格式必须是非负数，且大于等于0
 * @param {验证规则} rule 
 * @param {需要验证的值} value 
 * @param {回调函数} callback 
 */
export const nonnegativeNumberOne = function (rule, value, callback) {
  const reg = /^(([1-9]\d{0,3})|0)(\.\d{0,2})?$/;
  if (!reg.test(value)) {
    callback(new Error('格式错误'));
  } else {
    callback();
  }
}

/**
 * 格式必须是正整数,不能是小数和负数，且大于等于1
 * @param {验证规则} rule 
 * @param {需要验证的值} value 
 * @param {回调函数} callback 
 */
export const positiveIntegerNumber = function (rule, value, callback) {
  const reg = /^\+?[1-9]\d*$/;
  if (!reg.test(value)) {
    callback(new Error('格式错误'));
  } else {
    callback();
  }
}

/**
 * 格式必须是数字,不能是负数，且大于等于1
 * @param {验证规则} rule 
 * @param {需要验证的值} value 
 * @param {回调函数} callback 
 */
export const nonnegativeNumber = function (rule, value, callback) {
  const reg = /^(?!(0[0-9]{0,}$))[0-9]{1,}[.]{0,}[0-9]{0,}$/;
  if (!reg.test(value)) {
    callback(new Error('格式错误'));
  } else {
    callback();
  }
}

/**
 * 格式范围2-5之间
 * @param {验证规则} rule 
 * @param {需要验证的值} value 
 * @param {回调函数} callback 
 */
export const acceptCode = function (rule, value, callback) {
  if (value >= 2 && value <= 5) {
    callback();
  } else {
    callback(new Error('受理倍数参数范围2-5'));
  }
}
/**
 * 格式范围1-3之间
 * @param {验证规则} rule 
 * @param {需要验证的值} value 
 * @param {回调函数} callback 
 */
export const pickupCode = function (rule, value, callback) {
  if (value >= 1 && value <= 3) {
    callback();
  } else {
    callback(new Error('受理倍数参数范围1-3'));
  }
}