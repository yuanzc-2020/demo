// 统一请求路径前缀在libs/axios.js中修改
import { getRequest, postRequest, putRequest, deleteRequest, importRequest, getRequestWithNoToken } from '@/libs/axios';
// 统一地址管理 
import systemApiUrl from "./apiUrl/systemApiUrl.js";
let base = '/invoice';

// 文件上传接口
export const uploadFile = "/invoice/upload/file"
// 获取用户菜单
export const getMenuList = base + systemApiUrl.API.permission.list
// Websocket
export const ws = "/invoice/api/base/ws"


// 获取密码加密密钥（RSA公钥）
export const getRsaKey = (params) => {
    return getRequest(systemApiUrl.API.rsa.key, params)
}
// 登陆
export const login = (params) => {
    return postRequest(systemApiUrl.API.login.doLogin, params)
}
// 退出
export const logout = (params) => {
    return postRequest(systemApiUrl.API.login.logout, params)
}
// 获取用户登录信息
export const getLoginUserInfo = (userId, params) => {
    return getRequest(systemApiUrl.API.login.userInfo + `/${userId}`, params)
}
// 通过手机重置密码
export const resetByMobile = (params) => {
    return postRequest(systemApiUrl.API.login.resetByMobile, params)
}
// 登陆成功单位列表
export const getPrincipalList = (params) => {
    return getRequest(systemApiUrl.API.login.principalList, params)
}
// 登陆成功切换单位
export const changePrincipal = (params) => {
    return postRequest(systemApiUrl.API.login.change, params)
}
// 发送重置密码短信验证码
export const sendResetSms = (params) => {
    return postRequest(systemApiUrl.API.sms.sendResetSms, params)
}
// 发送登录短信验证码
export const sendLoginSms = (params) => {
    return postRequest(systemApiUrl.API.sms.sendLoginSms, params)
}
//【账户服务接口】 
export const getAccountList = (params) => {
    return getRequest(systemApiUrl.API.account.list, params)
}
export const getFetchName = (loginName, params) => {
    return getRequest(systemApiUrl.API.account.fetchName + `/${loginName}`, params)
}
export const getFetchPhone = (phone, params) => {
    return getRequest(systemApiUrl.API.account.fetchPhone + `/${phone}`, params)
}
export const disableAccount = (accountId, params) => {
    return postRequest(systemApiUrl.API.account.disable + `/${accountId}`, params)
}
export const enableAccount = (accountId, params) => {
    return postRequest(systemApiUrl.API.account.enable + `/${accountId}`, params)
}
export const registryAccount = (params) => {
    return postRequest(systemApiUrl.API.account.registry, params)
}
export const updateAccount = (params) => {
    return postRequest(systemApiUrl.API.account.update, params)
}
export const lockAccount = (accountId, params) => {
    return postRequest(systemApiUrl.API.account.lock + `/${accountId}`, params)
}
export const unlockAccount = (accountId, params) => {
    return postRequest(systemApiUrl.API.account.unlock + `/${accountId}`, params)
}
//【用户服务接口】
export const getUserList = (params) => {
    return getRequest(systemApiUrl.API.user.list, params)
}
export const getUserInfo = (userId, params) => {
    return getRequest(systemApiUrl.API.user.info + `/${userId}`, params)
}
export const disableUser = (userId, params) => {
    return postRequest(systemApiUrl.API.user.disable + `/${userId}`, params)
}
export const enableUser = (userId, params) => {
    return postRequest(systemApiUrl.API.user.enable + `/${userId}`, params)
}
export const createUser = (params) => {
    return postRequest(systemApiUrl.API.user.create, params)
}
export const updateUser = (params) => {
    return postRequest(systemApiUrl.API.user.update, params)
}
export const updateStatus = (params) => {
    return postRequest(systemApiUrl.API.user.updateStatus, params)
}
export const getBindMemberUserList = (params) => {
    return getRequest(systemApiUrl.API.user.getBindMemberUserList, params)
}
export const untyingUserOrg = (params) => {
    return postRequest(systemApiUrl.API.user.untyingUserOrg, params)
}
export const getUserDetailList = (params) => {
    return postRequest(systemApiUrl.API.user.detailList, params)
}
//【角色管理】 
export const getRoleList = (params) => {
    return getRequest(systemApiUrl.API.role.list, params)
}
export const getRoleDetail = (roleId, params) => {
    return getRequest(systemApiUrl.API.role.detail + `/${roleId}`, params)
}
export const createRole = (params) => {
    return postRequest(systemApiUrl.API.role.create, params)
}
export const updateRole = (params) => {
    return postRequest(systemApiUrl.API.role.update, params)
}
export const disableRole = (roleId, params) => {
    return postRequest(systemApiUrl.API.role.disable + `/${roleId}`, params)
}
export const enableRole = (roleId, params) => {
    return postRequest(systemApiUrl.API.role.enable + `/${roleId}`, params)
}
export const getRoleDetailList = (params) => {
    return postRequest(systemApiUrl.API.role.detailList, params)
}
//【岗位服务接口】
export const getPostList = (params) => {
    return getRequest(systemApiUrl.API.post.list, params)
}
export const getUserPostList = (params) => {
    return postRequest(systemApiUrl.API.post.userList, params)
}
export const disablePost = (roleId, userId, params) => {
    return postRequest(systemApiUrl.API.post.disable + `/${roleId}` + `/${userId}`, params)
}
export const enablePost = (roleId, userId, params) => {
    return postRequest(systemApiUrl.API.post.enable + `/${roleId}` + `/${userId}`, params)
}
export const createPost = (params) => {
    return postRequest(systemApiUrl.API.post.create, params)
}
export const updatePost = (roleId, userId, params) => {
    return postRequest(systemApiUrl.API.post.update + `/${roleId}` + `/${userId}`, params)
}
export const removePost = (roleId, userId, params) => {
    return postRequest(systemApiUrl.API.post.remove + `/${roleId}` + `/${userId}`, params)
}
//【授权服务接口(角色与菜单权限关系)】
export const getAuthzList = (params) => {
    return getRequest(systemApiUrl.API.authz.list, params)
}
export const disableAuthz = (authzId, params) => {
    return postRequest(systemApiUrl.API.authz.disable + `/${authzId}`, params)
}
export const enableAuthz = (authzId, params) => {
    return postRequest(systemApiUrl.API.authz.enable + `/${authzId}`, params)
}
export const removeAuthz = (authzId, params) => {
    return postRequest(systemApiUrl.API.authz.remove + `/${authzId}`, params)
}
export const createAuthz = (params) => {
    return postRequest(systemApiUrl.API.authz.create, params)
}
export const updateAuthz = (params) => {
    return postRequest(systemApiUrl.API.authz.update, params)
}
export const createAuthzBatch = (params) => {
    return postRequest(systemApiUrl.API.authz.batchCreate, params)
}
export const ownerRemoveAuthz = (ownerType, ownerId, permissionId, params) => {
    return postRequest(systemApiUrl.API.authz.ownerRemove + `/${ownerType}` + `/${ownerId}` + `/${permissionId}`, params)
}


//【权限(菜单)服务接口】
export const getPermissionList = (params) => {
    return getRequest(systemApiUrl.API.permission.list, params)
}
export const detailPermission = (permissionId, params) => {
    return getRequest(systemApiUrl.API.permission.detail + `/${permissionId}`, params)
}
export const disablePermission = (permissionId, params) => {
    return postRequest(systemApiUrl.API.permission.disable + `/${permissionId}`, params)
}
export const enablePermission = (permissionId, params) => {
    return postRequest(systemApiUrl.API.permission.enable + `/${permissionId}`, params)
}
export const createPermission = (params) => {
    return postRequest(systemApiUrl.API.permission.create, params)
}
export const updatePermission = (params) => {
    return postRequest(systemApiUrl.API.permission.update, params)
}
//【菜单接口 】
export const createMenu = (params) => {
    return postRequest(systemApiUrl.API.menu.create, params)
}
export const updateMenu = (params) => {
    return postRequest(systemApiUrl.API.menu.update, params)
}
//【公司资源接口 】
export const getCorpResAccountList = (params) => {
    return getRequest(systemApiUrl.API.corpres.account, params)
}
export const getCorpResArchList = (params) => {
    return getRequest(systemApiUrl.API.corpres.arch, params)
}
export const getCorpResAssignmentList = (params) => {
    return getRequest(systemApiUrl.API.corpres.assignment, params)
}
export const getCorpResEmploymentList = (params) => {
    return getRequest(systemApiUrl.API.corpres.employment, params)
}
export const getCorpResChannelList = (params) => {
    return getRequest(systemApiUrl.API.corpres.channel, params)
}
export const getCorpResOrgList = (params) => {
    return getRequest(systemApiUrl.API.corpres.org, params)
}
export const getCorpResRoleList = (params) => {
    return getRequest(systemApiUrl.API.corpres.role, params)
}
export const getCorpResUserList = (params) => {
    return getRequest(systemApiUrl.API.corpres.user, params)
}
//【公司服务接口】 
export const getCorpList = (params) => {
    return getRequest(systemApiUrl.API.corp.list, params)
}
export const getCorpDetail = (corpId, params) => {
    return getRequest(systemApiUrl.API.corp.detail + `/${corpId}`, params)
}
export const disableCorp = (corpId, params) => {
    return postRequest(systemApiUrl.API.corp.disable + `/${corpId}`, params)
}
export const enableCorp = (corpId, params) => {
    return postRequest(systemApiUrl.API.corp.enable + `/${corpId}`, params)
}
export const updateShowCorp = (corpId, type, params) => {
    return postRequest(systemApiUrl.API.corp.show + `/${corpId}` + `/${type}`, params)
}
//【区域管理】  
export const getRegionList = (params) => {
    return getRequest(systemApiUrl.API.region.list, params)
}
export const getRegionDetail = (params) => {
    return getRequest(systemApiUrl.API.region.detail, params)
}
export const insertRegion = (params) => {
    return postRequest(systemApiUrl.API.region.create, params)
}
export const updateRegion = (params) => {
    return postRequest(systemApiUrl.API.region.update, params)
}
export const disableRegion = (archId, params) => {
    return postRequest(systemApiUrl.API.region.disable + `/${archId}`, params)
}
export const enableRegion = (archId, params) => {
    return postRequest(systemApiUrl.API.region.enable + `/${archId}`, params)
}
//【架构管理】  
export const getArchDataList = (params) => {
    return getRequest(systemApiUrl.API.architecture.getArchDataList, params)
}
export const insertArch = (params) => {
    return postRequest(systemApiUrl.API.architecture.insertArch, params)
}
export const updateArch = (params) => {
    return postRequest(systemApiUrl.API.architecture.updateArch, params)
}
export const disableArch = (archId, params) => {
    return postRequest(systemApiUrl.API.architecture.disable + `/${archId}`, params)
}
export const enableArch = (archId, params) => {
    return postRequest(systemApiUrl.API.architecture.enable + `/${archId}`, params)
}
//【组织管理】 
export const getOrgDataList = (params) => {
    return getRequest(systemApiUrl.API.orginiztion.getOrgDataList, params)
}
export const getOrgByUserList = (userId, params) => {
    return getRequest(systemApiUrl.API.orginiztion.getOrgByUserList + `/${userId}`, params)
}
export const insertOrg = (params) => {
    return postRequest(systemApiUrl.API.orginiztion.insertOrg, params)
}
export const updateOrg = (params) => {
    return postRequest(systemApiUrl.API.orginiztion.updateOrg, params)
}
export const disableOrg = (orgId, params) => {
    return postRequest(systemApiUrl.API.orginiztion.disable + `/${orgId}`, params)
}
export const enableOrg = (orgId, params) => {
    return postRequest(systemApiUrl.API.orginiztion.enable + `/${orgId}`, params)
}
//【成员管理】 
export const getMemberList = (params) => {
    return getRequest(systemApiUrl.API.member.getMemberList, params)
}
export const getMemberDetail = (memberId, params) => {
    return getRequest(systemApiUrl.API.member.getMemberDetail + `/${memberId}`, params)
}
export const insertMember = (params) => {
    return postRequest(systemApiUrl.API.member.insert, params)
}
export const updateMember = (params) => {
    return postRequest(systemApiUrl.API.member.update, params)
}
export const disableMember = (orgId, userId, params) => {
    return postRequest(systemApiUrl.API.member.disable + `/${orgId}` + `/${userId}`, params)
}
export const enableMember = (orgId, userId, params) => {
    return postRequest(systemApiUrl.API.member.enable + `/${orgId}` + `/${userId}`, params)
}
export const removeMember = (orgId, userId, params) => {
    return postRequest(systemApiUrl.API.member.remove + `/${orgId}` + `/${userId}`, params)
}
//屏幕解锁
export const unlock = (params) => {
    return postRequest(systemApiUrl.API.common.unlock, params)
}
// base64上传
export const base64Upload = (params) => {
    return postRequest('/upload/file', params)
}