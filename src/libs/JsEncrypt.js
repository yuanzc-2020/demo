import Vue from 'vue'
import JsEncrypt from 'jsencrypt'

Vue.prototype.$encruption = function (obj, pubkey) {
    var jse = new JsEncrypt(); // 新建JSEncrypt对象
    jse.setPublicKey(pubkey)   // 设置公钥
    return jse.encrypt(obj); // 对密码进行加密
}
