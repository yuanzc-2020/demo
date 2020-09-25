import { Modal } from 'view-design';
import Vue from 'vue'

/**
 * 显示普通提示
 */
export const info = name => {
    Modal.info({
        title: '信息提示',
        content: name,
        width: "600px",
        okText: "确定"
    });
}

/**
 * 显示成功提示
 */
export const success = name => {
    Modal.success({
        title: '成功提示',
        content: name,
        width: "600px",
        okText: "确定"
    });
}

/**
 * 显示警告提示
 */
export const warning = name => {
    Modal.warning({
        title: '警告提示',
        content: name,
        width: "600px",
        okText: "确定"
    });
}


export default function (Vue) {
    Vue.prototype.$Dialog = {
        info,
        success,
        warning
    }
}
