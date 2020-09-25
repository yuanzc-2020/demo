//基础url
let apiUrl = '/api';

//授权、基础管理URL
let API = {
	//【加密解密】
	rsa: {
		//获取密码加密密钥（RSA公钥）
		key: apiUrl + '/auth/key'
	},
	//【账号登陆】
	login: {
		doLogin: apiUrl + '/auth/login',
		//可切换身份
		principalList: apiUrl + '/auth/principal/list',
		//切换身份
		change: apiUrl + '/auth/principal/change',
		userInfo: apiUrl + '/auth/user/info',
		resetByMobile: apiUrl + '/auth/password/update',
		logout: apiUrl + '/auth/logout'
	},
	//【个人中心】
	userCenter: {
		unlock: apiUrl + '/auth/user/edit',
		changeMobile: apiUrl + '/auth/user/change/mobile',
		changePass: apiUrl + '/auth/user/change/pass',
		changeEmail: apiUrl + '/auth/user/change/email',
		unlock: apiUrl + '/auth/user/change'

	},
	//【公共方法】
	common: {
		//屏幕锁定
		unlock: apiUrl + '/auth/common/unlock',
	},
	//【短信管理】
	sms: {
		//发送登录短信验证码
		sendLoginSms: apiUrl + '/auth/code',
		//发送重置密码短信验证码
		sendResetSms: apiUrl + '/auth/password/update/code'
	},
	//【账户管理】
	account: {
		//基本信息更新
		update: apiUrl + '/auth/account/basic/update',
		//禁用账户
		disable: apiUrl + '/auth/account/disable',
		//启用账户
		enable: apiUrl + '/auth/account/enable',
		//登录名检索账号
		fetchName: apiUrl + '/auth/account/fetch/name',
		//电话号码检索账号 
		fetchPhone: apiUrl + '/auth/account/fetch/phone',
		//账号列表服务
		list: apiUrl + '/auth/account/list',
		//锁定账户-禁止登陆
		lock: apiUrl + '/auth/account/lock',
		//账号注册服务
		registry: apiUrl + '/auth/account/registry',
		//解锁账户,允许登陆
		unlock: apiUrl + '/auth/account/unlock',
		//主用户获取 
		primaryUser: apiUrl + '/auth/account/user/primary'
	},
	//【用户管理】
	user: {
		//用户列表 
		list: apiUrl + '/auth/user/list',
		//用户获取信息
		info: apiUrl + '/auth/user/info',
		//用户禁用
		disable: apiUrl + '/auth/user/disable',
		//用户启用 
		enable: apiUrl + '/auth/user/enable',
		//用户创建新用户
		create: apiUrl + '/auth/user/create',
		//用户更新基本信息
		update: apiUrl + '/auth/user/basic/update',
		//用户状态更新
		updateStatus: apiUrl + '/auth/user/status/update',
		//用户详情列表
		detailList: apiUrl + '/auth/user/detail/list'

	},
	//【角色管理】
	role: {
		//角色列表服务
		list: apiUrl + '/auth/role/list',
		//角色启用服务
		enable: apiUrl + '/auth/role/enable',
		//角色禁用服务
		disable: apiUrl + '/auth/role/disable',
		//角色详情服务
		detail: apiUrl + '/auth/role/detail',
		//角色创建
		create: apiUrl + '/auth/role/create',
		//基本信息更新
		update: apiUrl + '/auth/role/basic/update',
		//角色详情列表  
		detailList: apiUrl + '/auth/role/detail/list'
	},
	//【岗位（角色和用户关系）】
	post: {
		//岗位列表服务
		list: apiUrl + '/auth/post/list',
		//岗位启用服务
		enable: apiUrl + '/auth/post/enable',
		//岗位禁用服务
		disable: apiUrl + '/auth/post/disable',
		//岗位详情服务
		detail: apiUrl + '/auth/post/detail',
		//岗位创建
		create: apiUrl + '/auth/post/create',
		//岗位卸任服务
		remove: apiUrl + '/auth/post/remove',
		//基本信息更新
		update: apiUrl + '/auth/post/basic/update',
		//根据角色Id查询用户
		userList: apiUrl + '/auth/post/user/list'
	},
	//【授权（角色授权、公司授权、用户授权）】
	authz: {
		//授权列表服务
		list: apiUrl + '/auth/authz/list',
		//授权启用服务
		enable: apiUrl + '/auth/authz/enable',
		//授权禁用服务
		disable: apiUrl + '/auth/authz/disable',
		//授权详情服务
		detail: apiUrl + '/auth/authz/detail',
		//授权创建
		create: apiUrl + '/auth/authz/create',
		//授权移除
		remove: apiUrl + '/auth/authz/remove',
		//基本信息更新
		update: apiUrl + '/auth/authz/basic/update',
		//批量更新授权
		batchCreate: apiUrl + '/auth/authz/owner/create',
		//权限移除
		ownerRemove: apiUrl + '/auth/authz/owner/remove'
	},
	//【权限授权】
	permission: {
		//权限列表服务
		list: apiUrl + '/auth/permission/list',
		//权限启用服务
		enable: apiUrl + '/auth/permission/enable',
		//权限禁用服务
		disable: apiUrl + '/auth/permission/disable',
		//权限详情服务
		detail: apiUrl + '/auth/permission/detail',
		//权限创建
		create: apiUrl + '/auth/permission/create',
		//权限移除
		remove: apiUrl + '/auth/permission/remove',
		//权限更新
		update: apiUrl + '/auth/permission/basic/update'
	},
	//【菜单管理】
	menu: {
		//菜单创建
		create: apiUrl + '/auth/menu/create',
		//菜单更新
		update: apiUrl + '/auth/menu/basic/update'
	},
	//【公司资源】  
	corpres: {
		//范围内账号列表服务
		account: apiUrl + '/auth/corp/res/account/list',
		//范围内架构列表服务
		arch: apiUrl + '/auth/corp/res/arch/list',
		//范围内分派列表服务
		assignment: apiUrl + '/auth/corp/res/assignment/list',
		//范围内雇用列表服务
		employment: apiUrl + '/auth/corp/res/employment/list',
		//范围内渠道列表服务
		channel: apiUrl + '/auth/corp/res/channel/list',
		//范围内组织列表服务
		org: apiUrl + '/auth/corp/res/org/list',
		//范围内角色列表服务
		role: apiUrl + '/auth/corp/res/role/list',
		//范围内用户列表服务
		user: apiUrl + '/auth/corp/res/user/list',
	},
	//【公司管理】
	corp: {
		identityCorp: apiUrl + '/auth/corp/xxx',
		tree: apiUrl + '/auth/corp/tree',
		list: apiUrl + '/auth/corp/list',
		enable: apiUrl + '/auth/corp/enable',
		disable: apiUrl + '/auth/corp/disable',
		detail: apiUrl + '/auth/corp/detail',
		create: apiUrl + '/auth/corp/create',
		update: apiUrl + '/auth/corp/update',
		show: apiUrl + '/auth/corp/show',
	},
	//【区域】
	region: {
		list: apiUrl + '/auth/region/list',
		enable: apiUrl + '/auth/region/enable',
		disable: apiUrl + '/auth/region/disable',
		detail: apiUrl + '/auth/region/detail',
		create: apiUrl + '/auth/region/create',
		update: apiUrl + '/auth/region/basic/update',
	},
	//【架构管理】
	architecture: {
		getArchDataList: apiUrl + '/auth/arch/list',
		insertArch: apiUrl + '/auth/arch/create',
		updateArch: apiUrl + '/auth/arch/basic/update',
		enable: apiUrl + '/auth/arch/enable',
		disable: apiUrl + '/auth/arch/disable'
	},
	//【组织管理】
	orginiztion: {
		getOrgDataList: apiUrl + '/auth/org/list',
		insertOrg: apiUrl + '/auth/org/create',
		updateOrg: apiUrl + '/auth/org/basic/update',
		enable: apiUrl + '/auth/org/enable',
		disable: apiUrl + '/auth/org/disable',
	},
	//【成员管理】
	member: {
		getMemberList: apiUrl + '/auth/member/list',
		getMemberDetail: apiUrl + '/auth/member/detail',
		insert: apiUrl + '/auth/member/create',
		update: apiUrl + '/auth/member/update',
		enable: apiUrl + '/auth/member/enable',
		disable: apiUrl + '/auth/member/disable',
		remove: apiUrl + '/auth/member/remove'
	},
};

export default {
	API: API
}
