//基础url
let apiUrl = '/api';

//流程管理URL（模型，定义，实例，待办，已办等流程管理）
let API = {
	//【流程分类】
	category: {
		list: apiUrl + '/flow/category/list',
		insert: apiUrl + '/flow/category/insert',
		update: apiUrl + '/flow/category/update',
		delete: apiUrl + '/flow/category/delete',
	},
	//【流程模型】
	model: {
		list: apiUrl + '/flow/model/list',
		insert: apiUrl + '/flow/model/insert',
		update: apiUrl + '/flow/model/update',
		delete: apiUrl + '/flow/model/delete',
		detail: apiUrl + '/flow/model/detail',
		enable: apiUrl + '/flow/model/enable',
		disable: apiUrl + '/flow/model/disable',
		deploy: apiUrl + '/flow/model/deploy',
		export: apiUrl + '/flow/model/export/'
	},
	//【流程定义和流程实例】
	process: {
		list: apiUrl + '/flow/process/list',
		insert: apiUrl + '/flow/process/insert',
		update: apiUrl + '/flow/process/update',
		delete: apiUrl + '/flow/process/delete',
		detail: apiUrl + '/flow/process/detail',
		enable: apiUrl + '/flow/process/enable',
		disable: apiUrl + '/flow/process/disable',
		processInfo: apiUrl + '/flow/process/info',
		//节点
		node: apiUrl + '/flow/process/node',
		//节点审核人
		nodeAssigner: apiUrl + '/flow/process/node/assigner',
		//节点更新
		nodeUpdate: apiUrl + '/flow/process/node/update',
		//转化流程为模型
		convertToModel: apiUrl + '/flow/process/convert/model',
		//获取流程第一个节点
		firstNode: apiUrl + '/flow/process/node/first',
		//获取流程下一个节点
		nextNode: apiUrl + '/flow/process/node/next',
		//获取流程下一个节点
		nextNodeNew: apiUrl + '/flow/process/node/next',
		//流程驳回选项
		backList: apiUrl + '/flow/process/get/back/node',
		//流程定义节点授权列表
		nodeRelateList: apiUrl + '/flow/process/node/relate/list',
		//流程定义节点授权
		nodeRelateInsert: apiUrl + '/flow/process/node/relate/insert',
		//流程定义节点移除
		nodeRelateRemove: apiUrl + '/flow/process/node/relate/remove',
	},
	//【流程待办和流程已办】
	task: {
		//我的流程
		applyList: apiUrl + '/flow/task/list',
		//提交一个流程
		apply: apiUrl + '/flow/task/apply',
		//撤回流程
		cancel: apiUrl + '/flow/task/cancel',
		//跟踪流程
		history: apiUrl + '/flow/task/history',
		//跟踪流程
		businessHistory: apiUrl + '/flow/task/history/business',
		//跟踪流程-图片
		historyImage: apiUrl + '/flow/task/history/image',
		//跟踪流程-图片
		businessHistoryImage: apiUrl + '/flow/task/history/image/business',
		//待办流程
		todoList: apiUrl + '/flow/task/todo/list',
		//已办流程
		doneList: apiUrl + '/flow/task/done/list',
		//运行中流程
		runList: apiUrl + '/flow/task/run/list',
		//完成流程
		finishedList: apiUrl + '/flow/task/finished/list',
		//审核-通过 
		pass: apiUrl + '/flow/task/pass',
		//批量审核-通过 
		passAll: apiUrl + '/flow/task/pass/all',
		//审核-驳回发起人
		back: apiUrl + '/flow/task/back',
		//批量审核-驳回发起人
		backAll: apiUrl + '/flow/task/back/all',
		//审核-驳回至指定历史节点
		backToTask: apiUrl + '/flow/task/back/assignees',
		//挂起和激活
		status: apiUrl + '/flow/task/status',
		//获取可返回的节点
		backList: apiUrl + '/flow/task/get/back/node',
		//获取流程业务类型状态 
		businessCode: apiUrl + '/flow/task/business/code'
	}
};

export default {
	API: API
}
