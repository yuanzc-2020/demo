import axios from 'axios';
import { getStore, setStore, removeStore, getCookieStore, setCookieStore, removeCookieStore } from './storage';
import { router } from '../router/index';
import { errorMsg } from './globalMessage';

let base = '/invoice';
//axios.defaults.baseURL = '';
axios.defaults.timeout = 15000;
axios.defaults.headers.post['Content-Type'] = 'application/json; charset=utf-8';
//axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
axios.defaults.crossDomain = true;
axios.defaults.withCredentials = true;  //设置cross跨域 并设置访问权限 允许跨域携带cookie信息
axios.defaults.headers.common['Authorization'] = ''; // 设置请求头为 Authorization

// http request 拦截器
axios.interceptors.request.use(
    config => {
        const Authorization = getCookieStore('loginSessionId');
        if (Authorization) {
            config.headers.Authorization = Authorization;
            // config.method 的判断值必须是小写的post和get
            if (config.method === 'post') {
                /* config.data = { 
                    ...config.data
                } */
            } else if (config.method === 'get') {
                for (var key in config.params) {
                    //去掉字符串字段前后所有空格
                    if (typeof (config.params[key]) === 'string') {
                        config.params[key] = config.params[key].replace(/(^\s*)|(\s*$)/g, "");
                    }
                }
                config.params = {
                    ...config.params
                }
            }
        }
        return config
    },
    err => Promise.reject(err)
)

// http response 拦截器
axios.interceptors.response.use(response => {
    const data = response.data;
    if (!data.success) {
        if (data.code < 100 || data.code > 600) {
            let msg = "请求数据异常，" + (data.message == null ? "请检查重试" : data.message);
            errorMsg(msg);
        }
    }
    switch (data.code) {
        case 401:
            removeCookieStore('loginSessionId');
            removeStore('loginUserInfo');
            removeStore('loginStep');
            if (router.history.current.name != "login") {
                errorMsg("未授权，请重新登录");
                router.push('/login');
            }
            break;
        case 402:
            if (data.message !== null) {
                errorMsg(data.message);
            } else {
                errorMsg("拒绝访问");
            }
            break;
        default:
            return data;
    }
    return data;
}, (err) => {
    // 返回状态码非200时错误处理
    errorMsg(err.toString());
    return Promise.resolve(err);
});

/**
 * get请求
 * @param {*} url 
 * @param {*} params 
 */
export const getRequest = (url, params) => {
    return axios({
        method: 'get',
        url: `${base}${url}`,
        params: params
    });
};

/**
 * post请求表单提交
 * 参数的提交形式是类似于url拼接
 * a="123"&b=520&c=true&d="你好" 
 * qs.stringify(a)
 * @param {*} url 
 * @param {*} params 
 */
export const postRequest1 = (url, params) => {
    return axios({
        method: 'post',
        url: `${base}${url}`,
        data: params,
        transformRequest: [function (data) {
            let ret = '';
            for (let it in data) {
                ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&';
            }
            ret = ret.substring(0, ret.length - 1);
            return ret;
        }],
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });
};

/**
 * post请求json提交
 * {"a":"","b":"","c":"","d":""}
 * @param {*} url 
 * @param {*} params 
 */
export const postRequest = (url, params) => {
    return axios({
        method: 'post',
        url: `${base}${url}`,
        data: params,
        headers: {
            'Content-Type': 'application/json'
        }
    });
};

/**
 * put请求
 * @param {*} url 
 * @param {*} params 
 */
export const putRequest = (url, params) => {
    return axios({
        method: 'put',
        url: `${base}${url}`,
        data: params,
        transformRequest: [function (data) {
            let ret = '';
            for (let it in data) {
                ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&';
            }
            ret = ret.substring(0, ret.length - 1);
            return ret;
        }],
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    });
};

/**
 * delete请求
 * @param {*} url 
 * @param {*} params 
 */
export const deleteRequest = (url, params) => {
    return axios({
        method: 'delete',
        url: `${base}${url}`,
        params: params
    });
};

/**
 * 导入数据的请求
 * @param {*} url 
 * @param {*} params 
 */
export const importRequest = (url, params) => {
    return axios({
        method: 'post',
        url: `${base}${url}`,
        data: params
    });
};

/**
 * 上传文件的请求
 * @param {*} url 
 * @param {*} params 
 */
export const uploadFileRequest = (url, params) => {
    return axios({
        method: 'post',
        url: `${base}${url}`,
        params: params
    });
};

/**
 * 无需token验证的请求
 * @param {*} url 
 * @param {*} params 
 */
export const getRequestWithNoToken = (url, params) => {
    return axios({
        method: 'get',
        url: `${base}${url}`,
        params: params
    });
};
