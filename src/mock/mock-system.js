const Mock = require('mockjs');
console.log('前端 mock mock-system 环境启动成功')
// 统一地址管理 
import systemApiUrl from "../api/apiUrl/systemApiUrl.js";
let base = '/invoice';

//【账户管理】 
Mock.mock(RegExp(base + systemApiUrl.API.account.list + ".*"), 'get', require('./json/system-json/account/getAccountList'));
Mock.mock(RegExp(base + systemApiUrl.API.account.fetchName + ".*"), 'get', require('./json/getJson'));
Mock.mock(RegExp(base + systemApiUrl.API.account.fetchPhone + ".*"), 'get', require('./json/getJson'));
Mock.mock(RegExp(base + systemApiUrl.API.account.disable + ".*"), 'post', require('./json/postJson'));
Mock.mock(RegExp(base + systemApiUrl.API.account.enable + ".*"), 'post', require('./json/postJson'));
Mock.mock(base + systemApiUrl.API.account.registry, 'post', require('./json/postJson'));
Mock.mock(base + systemApiUrl.API.account.update, 'post', require('./json/postJson'));
Mock.mock(RegExp(base + systemApiUrl.API.account.lock + ".*"), 'post', require('./json/postJson'));

//【用户管理】
Mock.mock(RegExp(base + systemApiUrl.API.user.list + ".*"), 'get', require('./json/system-json/user/getUserList'));
Mock.mock(RegExp(base + systemApiUrl.API.user.info + ".*"), 'get', require('./json/postJson'));
Mock.mock(RegExp(base + systemApiUrl.API.user.disable + ".*"), 'post', require('./json/postJson'));
Mock.mock(RegExp(base + systemApiUrl.API.user.enable + ".*"), 'post', require('./json/postJson'));
Mock.mock(base + systemApiUrl.API.user.create, 'post', require('./json/postJson'));
Mock.mock(base + systemApiUrl.API.user.update, 'post', require('./json/postJson'));
Mock.mock(base + systemApiUrl.API.user.updateStatus, 'post', require('./json/postJson'));
Mock.mock(RegExp(base + systemApiUrl.API.user.getBindMemberUserList + ".*"), 'get', require('./json/system-json/user/getMemberFromUser'));
Mock.mock(base + systemApiUrl.API.user.untyingUserOrg, 'post', require('./json/system-json/user/getUserList'));

//【角色管理】
Mock.mock(RegExp(base + systemApiUrl.API.role.list + ".*"), 'get', require('./json/system-json/role/roleList'));
Mock.mock(base + systemApiUrl.API.role.create, 'post', require('./json/postJson'));
Mock.mock(base + systemApiUrl.API.role.update, 'post', require('./json/postJson'));
Mock.mock(RegExp(base + systemApiUrl.API.role.disable + ".*"), 'post', require('./json/postJson'));
Mock.mock(RegExp(base + systemApiUrl.API.role.enable + ".*"), 'post', require('./json/postJson'));
Mock.mock(RegExp(base + systemApiUrl.API.role.userRole + ".*"), 'get', require('./json/system-json/role/userRoleList'));
Mock.mock(RegExp(base + systemApiUrl.API.role.getRoleListByOrgId + ".*"), 'get', require('./json/system-json/user/getUserBindOrgRoleLis'));

//【岗位（用户与角色）管理】
Mock.mock(RegExp(base + systemApiUrl.API.post.getOrgTreeList + ".*"), 'get', require('./json/system-json/post/postList'));
Mock.mock(RegExp(base + systemApiUrl.API.post.getTaskUserByRoles + ".*"), 'get', require('./json/system-json/post/postUserList'));
Mock.mock(RegExp(base + systemApiUrl.API.post.disable + ".*"), 'post', require('./json/postJson'));
Mock.mock(RegExp(base + systemApiUrl.API.post.enable + ".*"), 'post', require('./json/postJson'));
Mock.mock(RegExp(base + systemApiUrl.API.post.create + ".*"), 'post', require('./json/postJson'));
Mock.mock(RegExp(base + systemApiUrl.API.post.update + ".*"), 'post', require('./json/postJson'));
Mock.mock(RegExp(base + systemApiUrl.API.post.remove + ".*"), 'post', require('./json/postJson'));

//【授权管理(角色与菜单、公司与菜单、用户与菜单)】
Mock.mock(RegExp(base + systemApiUrl.API.authz.list + ".*"), 'get', require('./json/system-json/authz/authzList'));
Mock.mock(RegExp(base + systemApiUrl.API.authz.disable + ".*"), 'post', require('./json/postJson'));
Mock.mock(RegExp(base + systemApiUrl.API.authz.enable + ".*"), 'post', require('./json/postJson'));
Mock.mock(RegExp(base + systemApiUrl.API.authz.create + ".*"), 'post', require('./json/postJson'));
Mock.mock(RegExp(base + systemApiUrl.API.authz.update + ".*"), 'post', require('./json/postJson'));
Mock.mock(RegExp(base + systemApiUrl.API.authz.remove + ".*"), 'post', require('./json/postJson'));
Mock.mock(RegExp(base + systemApiUrl.API.authz.batchCreate + ".*"), 'post', require('./json/postJson'));

//【权限（菜单）管理】
Mock.mock(RegExp(base + systemApiUrl.API.permission.tree + ".*"), 'get', require('./json/system-json/permission/permissionTree'));
Mock.mock(RegExp(base + systemApiUrl.API.permission.list + ".*"), 'get', require('./json/system-json/permission/permissionTree'));
Mock.mock(RegExp(base + systemApiUrl.API.permission.treeSearch + ".*"), 'get', require('./json/system-json/permission/permissionTreeSearch'));
Mock.mock(RegExp(base + systemApiUrl.API.permission.disable + ".*"), 'post', require('./json/postJson'));
Mock.mock(RegExp(base + systemApiUrl.API.permission.enable + ".*"), 'post', require('./json/postJson'));
Mock.mock(RegExp(base + systemApiUrl.API.permission.create + ".*"), 'post', require('./json/postJson'));
Mock.mock(RegExp(base + systemApiUrl.API.permission.update + ".*"), 'post', require('./json/postJson'));
Mock.mock(RegExp(base + systemApiUrl.API.permission.detail + ".*"), 'post', require('./json/postJson'));
Mock.mock(RegExp(base + systemApiUrl.API.permission.remove + ".*"), 'post', require('./json/postJson'));

//【公司管理】
Mock.mock(RegExp(base + systemApiUrl.API.corp.identityCorp + ".*"), 'get', require('./json/system-json/orginiztion/orginiztionChooseList'));
Mock.mock(RegExp(base + systemApiUrl.API.corp.tree + ".*"), 'get', require('./json/system-json/orginiztion/getCorpDataTree'));
Mock.mock(RegExp(base + systemApiUrl.API.corp.list + ".*"), 'get', require('./json/system-json/orginiztion/getCorpDataList'));
Mock.mock(base + systemApiUrl.API.corp.disable, 'post', require('./json/postJson'));
Mock.mock(RegExp(base + systemApiUrl.API.corp.enable + ".*"), 'post', require('./json/postJson'));
Mock.mock(RegExp(base + systemApiUrl.API.corp.disable + ".*"), 'post', require('./json/postJson'));
Mock.mock(base + systemApiUrl.API.corp.detail, 'post', require('./json/postJson'));
Mock.mock(RegExp(base + systemApiUrl.API.corp.userChooseOrg + ".*"), 'get', require('./json/system-json/orginiztion/orginiztionChooseList'));
Mock.mock(RegExp(base + systemApiUrl.API.corp.getOrgListByAccountId + ".*"), 'get', require('./json/system-json/user/getUserBindOrgList'));
Mock.mock(RegExp(base + systemApiUrl.API.corp.getAllotCorp + ".*"), 'get', require('./json/system-json/orginiztion/orginiztionAllot'));


//【架构管理】
Mock.mock(RegExp(base + systemApiUrl.API.architecture.getCorpArchTreeList + ".*"), 'get', require('./json/system-json/orginiztion/getCorpArchTree'));
Mock.mock(RegExp(base + systemApiUrl.API.architecture.getArchDataList + ".*"), 'get', require('./json/system-json/orginiztion/getArchDataList'));
Mock.mock(RegExp(base + systemApiUrl.API.architecture.searchArchDataList + ".*"), 'get', require('./json/system-json/orginiztion/getArchDataSearch'));
Mock.mock(base + systemApiUrl.API.architecture.insertArch, 'post', require('./json/postJson'));
Mock.mock(base + systemApiUrl.API.architecture.updateArch, 'post', require('./json/postJson'));
Mock.mock(base + systemApiUrl.API.architecture.disable, 'post', require('./json/postJson'));
Mock.mock(base + systemApiUrl.API.architecture.enable, 'post', require('./json/postJson'));

//【组织管理】
Mock.mock(RegExp(base + systemApiUrl.API.orginiztion.getCorpArchOrgTreeList + ".*"), 'get', require('./json/system-json/orginiztion/getCorpArchOrgTree'));
Mock.mock(RegExp(base + systemApiUrl.API.orginiztion.getOrgDataList + ".*"), 'get', require('./json/system-json/orginiztion/getOrgDataList'));
Mock.mock(base + systemApiUrl.API.orginiztion.insertOrg, 'post', require('./json/postJson'));
Mock.mock(RegExp(base + systemApiUrl.API.orginiztion.getOrgByUserList + ".*"), 'get', require('./json/system-json/orginiztion/getUserAddOrgSearch'));
Mock.mock(base + systemApiUrl.API.orginiztion.updateOrg, 'post', require('./json/postJson'));
Mock.mock(base + systemApiUrl.API.orginiztion.disable, 'post', require('./json/postJson'));
Mock.mock(base + systemApiUrl.API.orginiztion.enable, 'post', require('./json/postJson'));

//【成员管理】
Mock.mock(RegExp(base + systemApiUrl.API.member.getMemberList + ".*"), 'get', require('./json/system-json/orginiztion/getMemberByOrgId'));
Mock.mock(RegExp(base + systemApiUrl.API.member.getMemberDetail + ".*"), 'get', require('./json/system-json/orginiztion/getMemberByOrgId'));
Mock.mock(base + systemApiUrl.API.member.insert, 'post', require('./json/postJson'));
Mock.mock(base + systemApiUrl.API.member.update, 'post', require('./json/postJson'));
Mock.mock(RegExp(base + systemApiUrl.API.member.disable + ".*"), 'post', require('./json/postJson'));
Mock.mock(RegExp(base + systemApiUrl.API.member.enable + ".*"), 'post', require('./json/postJson'));
Mock.mock(RegExp(base + systemApiUrl.API.member.leave + ".*"), 'post', require('./json/postJson'));


Mock.mock(base + systemApiUrl.API.common.unlock, 'post', require('./json/postJson'));


