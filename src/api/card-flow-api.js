// 统一请求路径前缀在libs/axios.js中修改
import { getRequest, postRequest, putRequest, deleteRequest, importRequest, getRequestWithNoToken } from '@/libs/axios';
// 统一地址管理
import flowApiUrl from "./apiUrl/flowApiUrl.js";

// 通过文件部署模型流程
export const deployByFile = "/invoice/api/flow/process/deploy"
// 导出流程资源
export const exportResource = "/invoice/api/flow/process/export"
// 获取流程实时流程图
export const getHighlightImg = "/invoice" + flowApiUrl.API.task.historyImage + "/"
// 获取流程实时流程图
export const getBusHighlightImg = "/invoice" + flowApiUrl.API.task.businessHistoryImage + "/"
// 导出模型
export const exportModel = "/invoice/api/flow/model/export/";

//【流程分类服务接口】 
export const getCategoryList = (params) => {
    return getRequest(flowApiUrl.API.category.list, params)
}
export const updateCategory = (params) => {
    return postRequest(flowApiUrl.API.category.update, params)
}
export const insertCategory = (params) => {
    return postRequest(flowApiUrl.API.category.insert, params)
}
export const deleteCategory = (params) => {
    return postRequest(flowApiUrl.API.category.delete, params)
}
//【流程模型服务接口】 
export const getModelList = (params) => {
    return getRequest(flowApiUrl.API.model.list, params)
}
export const getModelDetail = (params) => {
    return getRequest(flowApiUrl.API.model.detail, params)
}
export const updateModel = (params) => {
    return postRequest(flowApiUrl.API.model.update, params)
}
export const insertModel = (params) => {
    return postRequest(flowApiUrl.API.model.insert, params)
}
export const deleteModel = (id, params) => {
    return postRequest(flowApiUrl.API.model.delete + `/${id}`, params)
}
export const deployModel = (id, params) => {
    return postRequest(flowApiUrl.API.model.deploy + `/${id}`, params)
}
export const disableModel = (id, params) => {
    return postRequest(flowApiUrl.API.model.disable + `/${id}`, params)
}
export const enableModel = (id, params) => {
    return postRequest(flowApiUrl.API.model.enable + `/${id}`, params)
}
//【流程定义服务接口】
//流程定义列表
export const getProcessList = (params) => {
    return getRequest(flowApiUrl.API.process.list, params)
}
//流程定义详情
export const getProcessDetail = (params) => {
    return getRequest(flowApiUrl.API.process.detail, params)
}
//流程节点信息
export const getProcessNode = (processId, params) => {
    return getRequest(flowApiUrl.API.process.node + `/${processId}`, params)
}
//流程节点审核信息
export const getProcessAssignerNode = (nodeId, params) => {
    return getRequest(flowApiUrl.API.process.nodeAssigner + `/${nodeId}`, params)
}
//更新流程定义
export const updateProcess = (params) => {
    return postRequest(flowApiUrl.API.process.update, params)
}
//插入流程定义
export const insertProcess = (params) => {
    return postRequest(flowApiUrl.API.process.insert, params)
}
//删除流程定义
export const deleteProcess = (procDefId, params) => {
    return postRequest(flowApiUrl.API.process.delete + `/${procDefId}`, params)
}
//挂起流程定义
export const disableProcess = (procDefId, params) => {
    return postRequest(flowApiUrl.API.process.disable + `/${procDefId}`, params)
}
//激活流程定义
export const enableProcess = (procDefId, params) => {
    return postRequest(flowApiUrl.API.process.enable + `/${procDefId}`, params)
}
//节点更新（设置审批人或者角色）
export const nodeUpdate = (params) => {
    return postRequest(flowApiUrl.API.process.nodeUpdate, params)
}
// 转化流程为模型
export const convertToModel = (procDefId, params) => {
    return postRequest(flowApiUrl.API.process.convertToModel + `/${procDefId}`, params)
}
//根据key获取最新流程信息
export const getProcessByKey = (processKey, params) => {
    return getRequest(flowApiUrl.API.process.processInfo + `/${processKey}`, params)
}
//根据流程定义id获取第一个任务节点
export const getFirstNode = (procDefId, params) => {
    return getRequest(flowApiUrl.API.process.firstNode + `/${procDefId}`, params)
}
//根据流程定义id和节点id获取下一个任务节点
export const getNextNode = (procDefId, nodeId, params) => {
    return getRequest(flowApiUrl.API.process.nextNode + `/${procDefId}` + `/${nodeId}`, params)
}
//根据流程实例id获取下一个任务节点
export const getNextNodeByInstId = (procInstId, params) => {
    return getRequest(flowApiUrl.API.process.nextNodeNew + `/${procInstId}`, params)
}
//获取驳回，选择节点列表
export const getProcessBackList = (procInstId, params) => {
    return getRequest(flowApiUrl.API.process.backList + `/${procInstId}`, params)
}
// 流程定义节点授权列表
export const nodeRelateList = (params) => {
    return getRequest(flowApiUrl.API.process.nodeRelateList, params)
}
// 流程定义节点授权
export const nodeRelateInsert = (params) => {
    return postRequest(flowApiUrl.API.process.nodeRelateInsert, params)
}
// 流程定义节点移除
export const nodeRelateRemove = (id, params) => {
    return postRequest(flowApiUrl.API.process.nodeRelateRemove + `/${id}`, params)
}
//【流程任务&流程实例】
//发起流程
export const startApplyTask = (params) => {
    return postRequest(flowApiUrl.API.task.apply, params)
}
//驳回流程至发起人
export const backInsTask = (params) => {
    return postRequest(flowApiUrl.API.task.back, params)
}
//批量驳回至发起人
export const backInsTaskAll = (params) => {
    return postRequest(flowApiUrl.API.task.backAll, params)
}
//任务节点审批驳回至指定历史节点
export const backInsToTask = (params) => {
    return postRequest(flowApiUrl.API.task.backToTask, params)
}
//撤回流程
export const cancelInsTask = (params) => {
    return postRequest(flowApiUrl.API.task.cancel, params)
}
//审核通过
export const passInsTask = (params) => {
    return postRequest(flowApiUrl.API.task.pass, params)
}
//批量审核通过
export const passInsTaskAll = (params) => {
    return postRequest(flowApiUrl.API.task.passAll, params)
}
//流程挂起和激活
export const updateInsStatus = (params) => {
    return postRequest(flowApiUrl.API.task.status, params)
}
//流程跟踪
export const getInsTaskHistory = (procInstId, params) => {
    return getRequest(flowApiUrl.API.task.history + `/${procInstId}`, params)
}
//流程跟踪
export const getBusTaskHistory = (businessId, params) => {
    return getRequest(flowApiUrl.API.task.businessHistory + `/${businessId}`, params)
}
//我的流程（发起）
export const getApplyList = (params) => {
    return getRequest(flowApiUrl.API.task.applyList, params)
}
//待办列表
export const getTodoList = (params) => {
    return getRequest(flowApiUrl.API.task.todoList, params)
}
//已办列表
export const getDoneList = (params) => {
    return getRequest(flowApiUrl.API.task.doneList, params)
}
//运行列表
export const getRunList = (params) => {
    return getRequest(flowApiUrl.API.task.runList, params)
}
//完结列表
export const getFinishedList = (params) => {
    return getRequest(flowApiUrl.API.task.finishedList, params)
}
//获取驳回，选择节点列表
export const getTaskBackList = (procInstId, params) => {
    return getRequest(flowApiUrl.API.task.backList + `/${procInstId}`, params)
}
//获取流程业务类型状态
export const getTaskBusinessCodeList = (params) => {
    return getRequest(flowApiUrl.API.task.businessCode, params)
}

