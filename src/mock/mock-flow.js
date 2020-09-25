const Mock = require('mockjs');
console.log('前端 mock mock-flow 环境启动成功')
// 统一地址管理 
let base = '/invoice';
import flowApiUrl from "../api/apiUrl/flowApiUrl.js";

//【流程分类服务接口】
Mock.mock(RegExp(base + flowApiUrl.API.category.tree + ".*"), 'get', require('./json/flow-json/category/categoryTree'));
Mock.mock(RegExp(base + flowApiUrl.API.category.insert + ".*"), 'post', require('./json/postJson'));
Mock.mock(RegExp(base + flowApiUrl.API.category.update + ".*"), 'post', require('./json/postJson'));
Mock.mock(RegExp(base + flowApiUrl.API.category.delete + ".*"), 'post', require('./json/postJson'));

//【流程模型服务接口】
Mock.mock(RegExp(base + flowApiUrl.API.model.list + ".*"), 'get', require('./json/flow-json/model/getModelList'));
Mock.mock(RegExp(base + flowApiUrl.API.model.detail + ".*"), 'get', require('./json/flow-json/model/getModelDetail'));
Mock.mock(RegExp(base + flowApiUrl.API.model.insert + ".*"), 'post', require('./json/postJson'));
Mock.mock(RegExp(base + flowApiUrl.API.model.update + ".*"), 'post', require('./json/postJson'));
Mock.mock(RegExp(base + flowApiUrl.API.model.delete + ".*"), 'post', require('./json/postJson'));
Mock.mock(RegExp(base + flowApiUrl.API.model.deploy + ".*"), 'post', require('./json/postJson'));
Mock.mock(RegExp(base + flowApiUrl.API.model.disable + ".*"), 'post', require('./json/postJson'));
Mock.mock(RegExp(base + flowApiUrl.API.model.enable + ".*"), 'post', require('./json/postJson'));


//【流程定义服务接口】
Mock.mock(RegExp(base + flowApiUrl.API.process.list + ".*"), 'get', require('./json/flow-json/process/getProcessList'));
Mock.mock(RegExp(base + flowApiUrl.API.process.detail + ".*"), 'get', require('./json/flow-json/process/getProcessDetail'));
Mock.mock(RegExp(base + flowApiUrl.API.process.node + ".*"), 'get', require('./json/flow-json/process/getNode'));
Mock.mock(RegExp(base + flowApiUrl.API.process.insert + ".*"), 'post', require('./json/postJson'));
Mock.mock(RegExp(base + flowApiUrl.API.process.update + ".*"), 'post', require('./json/postJson'));
Mock.mock(RegExp(base + flowApiUrl.API.process.delete + ".*"), 'post', require('./json/postJson'));
Mock.mock(RegExp(base + flowApiUrl.API.process.nodeUpdate + ".*"), 'post', require('./json/postJson'));
Mock.mock(RegExp(base + flowApiUrl.API.process.disable + ".*"), 'post', require('./json/postJson'));
Mock.mock(RegExp(base + flowApiUrl.API.process.enable + ".*"), 'post', require('./json/postJson'));
Mock.mock(RegExp(base + flowApiUrl.API.process.convertToModel + ".*"), 'post', require('./json/postJson'));
Mock.mock(RegExp(base + flowApiUrl.API.process.processInfo + ".*"), 'get', require('./json/flow-json/process/getProcessInfo'));
Mock.mock(RegExp(base + flowApiUrl.API.process.firstNode + ".*"), 'get', require('./json/flow-json/process/getProcessFirstNode'));
Mock.mock(RegExp(base + flowApiUrl.API.process.nextNode + ".*"), 'get', require('./json/flow-json/process/getProcessNextNode'));
Mock.mock(RegExp(base + flowApiUrl.API.process.backList + ".*"), 'get', require('./json/flow-json/task/getBackList'));

//【流程任务&流程实例】
Mock.mock(RegExp(base + flowApiUrl.API.task.applyList + ".*"), 'get', require('./json/flow-json/task/applyList'));
Mock.mock(RegExp(base + flowApiUrl.API.task.todoList + ".*"), 'get', require('./json/flow-json/task/todoList'));
Mock.mock(RegExp(base + flowApiUrl.API.task.doneList + ".*"), 'get', require('./json/flow-json/task/doneList'));
Mock.mock(RegExp(base + flowApiUrl.API.task.runList + ".*"), 'get', require('./json/flow-json/task/runList'));
Mock.mock(RegExp(base + flowApiUrl.API.task.finishedList + ".*"), 'get', require('./json/flow-json/task/finishList'));
Mock.mock(RegExp(base + flowApiUrl.API.task.history + ".*"), 'get', require('./json/flow-json/process/getProcessHistory'));

Mock.mock(RegExp(base + flowApiUrl.API.task.status + ".*"), 'post', require('./json/postJson'));
Mock.mock(RegExp(base + flowApiUrl.API.task.passAll + ".*"), 'post', require('./json/postJson'));
Mock.mock(RegExp(base + flowApiUrl.API.task.pass + ".*"), 'post', require('./json/postJson'));
Mock.mock(RegExp(base + flowApiUrl.API.task.cancel + ".*"), 'post', require('./json/postJson'));
Mock.mock(RegExp(base + flowApiUrl.API.task.back + ".*"), 'post', require('./json/postJson'));
Mock.mock(RegExp(base + flowApiUrl.API.task.backAll + ".*"), 'post', require('./json/postJson'));
Mock.mock(RegExp(base + flowApiUrl.API.task.backToTask + ".*"), 'post', require('./json/postJson'));
Mock.mock(RegExp(base + flowApiUrl.API.task.apply + ".*"), 'post', require('./json/postJson'));

