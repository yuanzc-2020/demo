import { Message, Notice, Modal } from 'view-design';
import Vue from 'vue'

let options = {
    top: 30,
    duration: 3
}

/**
 * 显示普通提示
 */
const info = name => {
    Message.config(options);
    Message['info']({
        background: true,
        duration: 3,
        content: name
    });
}

/**
 * 显示成功提示
 */
const success = name => {
    Message.config(options);
    Message['success']({
        background: true,
        duration: 3,
        content: name
    });
}

/**
* 显示警告提示
*/
const warning = name => {
    Message.config(options);
    Message['warning']({
        background: true,
        duration: 3,
        content: name
    });
}

/**
* 显示错误提示
*/
const error = name => {
    Message.config(options);
    Message['error']({
        background: true,
        duration: 3,
        content: name
    });
}

/**
* 显示错误提示
* js单独使用
*/
export const errorMsg = name => {
    Message.config(options);
    Message['error']({
        background: true,
        duration: 3,
        content: name
    });
}

export default function (Vue) {
    Vue.prototype.$Msg = {
        info,
        success,
        warning,
        error
    }
}
