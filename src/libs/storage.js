
import Cookies from 'js-cookie';

/**
 * 存储localStorage
 */
export const setStore = (name, content) => {
    if (!name) return;
    if (typeof content !== 'string') {
        content = JSON.stringify(content);
    }
    window.localStorage.setItem(name, content);
}

/**
 * 获取localStorage
 */
export const getStore = name => {
    if (!name) return;
    let v = window.localStorage.getItem(name);
    if (v == null) {
        return "";
    }
    return v;
}

/**
 * 删除localStorage
 */
export const removeStore = name => {
    if (!name) return;
    window.localStorage.removeItem(name);
}

/**
 * 存储sessionStorage
 */
export const setSessionStore = (name, content) => {
    if (!name) return;
    if (typeof content !== 'string') {
        content = JSON.stringify(content);
    }
    window.sessionStorage.setItem(name, content);
}

/**
 * 获取sessionStorage
 */
export const getSessionStore = name => {
    if (!name) return;
    let v = window.sessionStorage.getItem(name);
    if (v == null) {
        return "";
    }
    return v;
}

/**
 * 删除sessionStorage
 */
export const removeSessionStore = name => {
    if (!name) return;
    window.sessionStorage.removeItem(name);
}


/**
 * 存储Cookie
 */
export const setCookieStore = (name, content, expires) => {
    if (!name) return;
    if (!expires)
        //expires = 1 / 48;//30分钟
        expires = 1;//1天
    if (typeof content !== 'string') {
        content = JSON.stringify(content);
    }
    Cookies.set(name, content, { expires: expires, path: '' });
}

/**
 * 获取Cookie
 */
export const getCookieStore = name => {
    if (!name) return;
    let v = Cookies.get(name);
    if (v == null) {
        return "";
    }
    return v;
}

/**
 * 删除Cookie
 */
export const removeCookieStore = name => {
    if (!name) return;
    Cookies.remove(name);
}
