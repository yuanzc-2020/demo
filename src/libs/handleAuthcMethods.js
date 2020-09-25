
import {
  getCorpList, getCorpDetail, getRegionList, getOrgDataList,
  getArchDataList, getUserDetailList, getUserPostList, getRoleDetailList, getChannelDataList
} from '@/api/card-system-api';
import { setStore, getStore, removeStore } from '@/libs/storage'
import globalUtil from './globalUtil'

/**
 * 获取当前公司详情
 */
function getBaseCurrentCorpInfo() {
  return new Promise((resolve, reject) => {
    const userInfo = JSON.parse(getStore("loginUserInfo"));
    getCorpDetail(userInfo.corpId).then((res) => {
      if (res.success) {
        resolve(res.result)
      }
    }).catch(function (error) {
      reject(error)
    })
  })
}

/**
 * 获取当前公司详情（及上级公司）
 */
function getBaseCurrentCorpData() {
  return new Promise((resolve, reject) => {
    const userInfo = JSON.parse(getStore("loginUserInfo"));
    getCorpDetail(userInfo.corpId).then((res) => {
      if (res.success) {
        let corpinfo = {};
        if (res.result) {
          corpinfo.corpId = res.result.corpId;
          corpinfo.corpCode = res.result.corpCode;
          corpinfo.corpName = res.result.corpName;
          corpinfo.corpType = res.result.corpType;
          corpinfo.level = res.result.level;
          corpinfo.statusCode = res.result.statusCode;
          corpinfo.corpFullId = res.result.corpFullId;
          corpinfo.pid = res.result.pid;
          getCorpDetail(res.result.pid).then((res1) => {
            if (res1.success) {
              if (res1.result) {
                corpinfo.pidName = res1.result.corpName
                resolve(corpinfo)
              }
            } else {
              corpinfo.pidName = ""
              resolve(corpinfo)
            }
          })
        }
      }
    }).catch(function (error) {
      reject(error)
    })
  })
}
/**
 * 获取全部分公司信息 
 */
function getBaseAllCorpList() {
  return new Promise((resolve, reject) => {
    let param = {
      corpType: 1,
      pageNumber: 1,
      pageSize: 9999
    };
    getCorpList(param).then((res) => {
      if (res.success) {
        resolve(res.result.content)
      }
    }).catch(function (error) {
      reject(error)
    })
  })
}

/**
 * 获取全部分公司信息（有效） 
 */
function getBaseAllEnableCorpList() {
  return new Promise((resolve, reject) => {
    let param = {
      corpType: 1,
      statusCode: 1,
      pageNumber: 1,
      pageSize: 9999
    };
    getCorpList(param).then((res) => {
      if (res.success) {
        resolve(res.result.content)
      }
    }).catch(function (error) {
      reject(error)
    })
  })
}

/**
 * 获取当前全部公司（含下级）信息（公司、代理商、渠道）（有效） 
 */
function getBaseAllEnableSubCorpSearch(key) {
  return new Promise((resolve, reject) => {
    getBaseCurrentCorpInfo().then(current => {
      let param = {
        corpFullId: current.corpFullId,
        corpName: key,
        statusCode: 1,
        pageNumber: 1,
        pageSize: 10
      };
      getCorpList(param).then((res) => {
        if (res.success) {
          resolve(res.result.content)
        }
      }).catch(function (error) {
        reject(error)
      })
    })
  })
}

/**
 * 获取全部分公司信息（有效） 
 */
function getBaseAllEnableCorpTreeSearch(key) {
  return new Promise((resolve, reject) => {
    let param = {
      corpType: 1,
      corpName: key,
      statusCode: 1,
      pageNumber: 1,
      pageSize: 9999
    };
    getCorpList(param).then((res) => {
      if (res.success) {
        let tempDatas = [];
        let corpLists = res.result.content;
        corpLists.forEach(e => {
          let item = {
            id: e.corpId,
            pid: e.pid,
            title: '[公司]' + e.corpName,
            statusCode: e.statusCode,
            corpFullId: e.corpFullId,
            level: e.level,
            dataType: 1,
            expand: false
          };
          tempDatas.push(item);
        });
        resolve(tempDatas)
      }
    }).catch(function (error) {
      reject(error)
    })
  })
}

/**
 * 获取全部分公司信息（有效）返回树形 
 */
function getBaseAllEnableCorpTree() {
  return new Promise((resolve, reject) => {
    getBaseCurrentCorpInfo().then(current => {
      let param = {
        corpFullId: current.corpFullId,
        corpType: 1,
        statusCode: 1,
        pageNumber: 1,
        pageSize: 9999
      };
      getCorpList(param).then((res) => {
        if (res.success) {
          let tempDatas = [];
          let corpLists = res.result.content;
          corpLists.forEach(e => {
            let item = {
              id: e.corpId,
              pid: e.corpId == current.corpId ? 0 : e.pid,
              title: '[公司]' + e.corpName,
              statusCode: e.statusCode,
              corpFullId: e.corpFullId,
              level: e.level,
              dataType: 1,
              expand: e.corpId == current.corpId
            };
            tempDatas.push(item);
          });
          let treeData = globalUtil.listConvertTreeData(
            tempDatas,
            'id',
            'pid',
            'children'
          );
          resolve(treeData)
        }
      }).catch(function (error) {
        reject(error)
      })
    })
  })
}

/**
 * 获取下级分公司信息和架构信息（tree异步加载） 
 */
function getBaseAllCorpAndArch(item) {
  return new Promise((resolve, reject) => {
    let tempDatas = [];
    getCorpList({
      pid: item.id,
      corpType: 1,
      statusCode: 1,
      pageNumber: 1,
      pageSize: 9999
    }).then(res => {
      if (res.success) {
        res.result.content.forEach(e => {
          let items = {
            id: e.corpId,
            pid: e.pid,
            title: '[公司]' + e.corpName,
            statusCode: e.statusCode,
            level: e.level,
            corpFullId: e.corpFullId,
            loading: false,
            dataType: 1,
            children: []
          };
          tempDatas.push(items);
        });
        getArchDataList({
          corpId: item.id,
          statusCode: 1,
          pageNumber: 1,
          pageSize: 9999
        }).then(res => {
          if (res.success) {
            res.result.content.forEach(e => {
              let item = {
                id: e.archId,
                pid: e.corpId,
                title: '[架构]' + e.archName,
                statusCode: e.statusCode,
                dataType: 2
              };
              tempDatas.push(item);
            });
            resolve(tempDatas);
          }
        });
      }
    });
  })
}

/**
 * 获取下级分公司信息和组织信息（tree异步加载） 
 */
function getBaseAllCorpAndOrg(item) {
  return new Promise((resolve, reject) => {
    let tempDatas = [];
    getCorpList({
      pid: item.id,
      corpType: 1,
      statusCode: 1,
      pageNumber: 1,
      pageSize: 9999
    }).then(res => {
      if (res.success) {
        res.result.content.forEach(e => {
          let items = {
            id: e.corpId,
            pid: e.pid,
            title: '[公司]' + e.corpName,
            statusCode: e.statusCode,
            level: e.level,
            corpFullId: e.corpFullId,
            loading: false,
            dataType: 1,
            children: []
          };
          tempDatas.push(items);
        });
        getOrgDataList({
          corpId: item.id,
          statusCode: 1,
          pageNumber: 1,
          pageSize: 9999
        }).then(res => {
          if (res.success) {
            res.result.content.forEach(e => {
              let item = {
                id: e.orgId,
                pid: e.corpId,
                title: '[组织]' + e.orgName,
                statusCode: e.statusCode,
                dataType: 2
              };
              tempDatas.push(item);
            });
            resolve(tempDatas);
          }
        });
      }
    });
  })
}

/**
 * 获取分公司所属代理商信息（表单用）
 */
function getBaseCorpSubAgentList() {
  return new Promise((resolve, reject) => {
    getBaseCurrentCorpInfo().then(current => {
      getCorpList({
        pid: current.corpId,
        corpType: 2,
        showType: 1,
        statusCode: 1,
        order: "corp_name",
        sort: "asc",
        pageNumber: 1,
        pageSize: 9999
      }).then(res => {
        if (res.success) {
          let tempDatas = [];
          res.result.content.forEach(e => {
            let item = {
              corpId: e.corpId,
              corpCode: e.corpCode,
              corpName: e.corpName,
              corpFullName: e.corpId + "_" + e.corpName,
              pid: e.pid,
              statusCode: e.statusCode,
              corpFullId: e.corpFullId,
              corpType: e.corpType,
              level: e.level
            };
            tempDatas.push(item);
          });
          resolve(tempDatas);
        }
      });
    })
  })
}

/**
 * 获取分公司所属渠道信息（表单用）
 */
function getBaseCorpSubChannelList() {
  return new Promise((resolve, reject) => {
    getBaseCurrentCorpInfo().then(current => {
      getCorpList({
        pid: current.corpId,
        corpType: 3,
        showType: 1,
        statusCode: 1,
        order: "corp_name",
        sort: "asc",
        pageNumber: 1,
        pageSize: 9999
      }).then(res => {
        if (res.success) {
          let tempDatas = [];
          res.result.content.forEach(e => {
            let item = {
              corpId: e.corpId,
              corpCode: e.corpCode,
              corpName: e.corpName,
              corpFullName: e.corpId + "_" + e.corpName,
              pid: e.pid,
              statusCode: e.statusCode,
              corpFullId: e.corpFullId,
              corpType: e.corpType,
              level: e.level
            };
            tempDatas.push(item);
          });
          resolve(tempDatas);
        }
      });
    })
  })
}


/**
 * 获取代理商所属渠道信息（分配）
 */
function getBaseAgentSubChannelList() {
  return new Promise((resolve, reject) => {
    getBaseCurrentCorpInfo().then(current => {
      getChannelDataList({
        agentCorpId: current.corpId,
        statusCode: 1,
        order: "channel_name",
        sort: "asc",
        pageNumber: 1,
        pageSize: 9999
      }).then(res => {
        if (res.success) {
          let tempDatas = [];
          res.result.content.forEach(e => {
            let item = {
              channelId: e.channelId,
              channelName: e.channelName,
              fullChannelName: e.channelId + '_' + e.channelName,
              agentCorpId: e.agentCorpId,
              agentCorpName: current.corpName,
              corpId: e.corpId,
              statusCode: e.statusCode
            };
            tempDatas.push(item);
          });
          resolve(tempDatas);
        }
      });
    })
  })
}

/**
 * 获取全部行政区域信息
 */
function getBaseAllRegionList() {
  return new Promise((resolve, reject) => {
    let param = {
      pageNumber: 1,
      pageSize: 9999
    };
    getRegionList(param).then((res) => {
      if (res.success) {
        let tempDatas = [];
        res.result.content.forEach(e => {
          let item = {
            areaCode: e.areaCode,
            corpId: e.corpId,
            description: e.description,
            lanId: e.lanId,
            pid: e.pid,
            provinceBnr: e.provinceBnr,
            regionId: e.regionId,
            regionLevel: e.regionLevel,
            regionName: e.regionName,
            regionNbr: e.regionNbr,
            statusCode: e.statusCode,
          };
          tempDatas.push(item);
        });
        resolve(tempDatas)
      }
    }).catch(function (error) {
      reject(error)
    })
  })
}

/**
 * 获取市公司信息（提供调拨公司单位） 
 */
function getBaseAllEnableCorpToAlloat() {
  return new Promise((resolve, reject) => {
    getBaseCurrentCorpInfo().then(current => {
      if (current.level == 2) {
        let param = {
          corpType: 1,
          level: 2,
          statusCode: 1,
          pageNumber: 1,
          pageSize: 99
        };
        getCorpList(param).then((res) => {
          if (res.success) {
            let tempDatas = [];
            let corpLists = res.result.content;
            corpLists.forEach(e => {
              if (e.corpId != current.corpId) {
                let item = {
                  corpId: e.corpId,
                  corpCode: e.corpCode,
                  pid: e.pid,
                  corpName: e.corpName,
                  statusCode: e.statusCode,
                  corpFullId: e.corpFullId
                };
                tempDatas.push(item);
              }
            });
            resolve(tempDatas)
          }
        }).catch(function (error) {
          reject(error)
        })
      } else {
        resolve([])
      }
    })
  })
}

/**
 * 获取市公司信息（本地网 例如：51010000） 
 */
function getBaseAllEnableCityState() {
  return new Promise((resolve, reject) => {
    let param = {
      corpType: 1,
      level: 2,
      statusCode: 1,
      pageNumber: 1,
      pageSize: 100
    };
    getCorpList(param).then((res) => {
      if (res.success) {
        let tempDatas = [];
        let corpLists = res.result.content;
        corpLists.forEach(e => {
          let item = {
            corpId: e.corpId,
            corpCode: e.corpCode,
            pid: e.pid,
            corpName: e.corpName,
            statusCode: e.statusCode,
            corpFullId: e.corpFullId
          };
          tempDatas.push(item);
        });
        resolve(tempDatas)
      }
    }).catch(function (error) {
      reject(error)
    })
  })
}

/**
 * 获取节点审核人（根据节点的用户ID集合查询） 
 */
function getAuditUserByUsers(users) {
  return new Promise((resolve, reject) => {
    getUserDetailList(users).then((res) => {
      if (res.success) {
        resolve(res.result)
      }
    }, (err) => {
      reject(err)
    })
  })
}
/**
* 获取节点审核人（根据节点的角色ID集合查询） 
*/function getAuditUserByRoles(roles) {
  return new Promise((resolve, reject) => {
    getUserPostList(roles).then((res) => {
      if (res.success) {
        resolve(res.result)
      }
    }, (err) => {
      reject(err)
    })
  })
}
/**
  * 获取节点审核人（根据节点的用户ID和角色ID） - 已废弃
  */
function getFlowAuditUserList(users, roles) {
  return Promise.all([getAuditUserByUsers(users), getAuditUserByRoles(roles)]).then((resultList) => {
    let rst = [];
    resultList.forEach(result => {
      result.forEach(re => {
        rst.push({
          userId: re.userId,
          userName: re.userName,
          corpId: re.corpId,
          corpName: re.corpName
        })
      });
    });
    return rst;
  })
}


/**
 * 获取分公司及下属公司（盘点用）
 */
function getBaseCorpSubCorpList() {
  return new Promise((resolve, reject) => {
    getBaseCurrentCorpInfo().then(current => {
      getCorpList({
        corpFullId: current.corpFullId,
        corpType: 1,
        showType: 1,
        statusCode: 1,
        order: "corp_name",
        sort: "asc",
        pageNumber: 1,
        pageSize: 100
      }).then(res => {
        if (res.success) {
          let tempDatas = [];
          res.result.content.forEach(e => {
            let item = {
              corpId: e.corpId,
              corpCode: e.corpCode,
              corpName: e.corpName,
              corpFullName: e.corpId + "_" + e.corpName,
              pid: e.pid,
              statusCode: e.statusCode,
              corpFullId: e.corpFullId,
              corpType: e.corpType,
              level: e.level
            };
            tempDatas.push(item);
          });
          resolve(tempDatas);
        }
      });
    })
  })
}


export default {
  getBaseCurrentCorpInfo,
  getBaseCurrentCorpData,
  getBaseAllCorpList,
  getBaseAllEnableCorpList,
  getBaseAllEnableSubCorpSearch,
  getBaseAllEnableCorpTreeSearch,
  getBaseAllEnableCorpTree,
  getBaseAgentSubChannelList,
  getBaseAllRegionList,
  getBaseAllCorpAndArch,
  getBaseAllCorpAndOrg,
  getBaseAllEnableCorpToAlloat,
  getBaseAllEnableCityState,
  getBaseCorpSubAgentList,
  getBaseCorpSubChannelList,
  getBaseCorpSubCorpList,
  getFlowAuditUserList
}


