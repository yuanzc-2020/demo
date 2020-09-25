import axios from 'axios';
import { getCorpList, getCorpDetail, getRegionList } from '@/api/card-system-api';
import { setStore, getStore, removeStore } from '@/libs/storage'
let dictUtil = {};

// 获取常用的数据字典保存至vuex
dictUtil.initDictData = function (vm) {

    /*  getCorpList().then(res => {
         if (res.success) {
             vm.$store.commit("setData", res.result.content);
         }
     }); */

};

export default dictUtil;
