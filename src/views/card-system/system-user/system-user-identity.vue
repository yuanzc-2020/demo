<style lang="less">
@import '../../../styles/single-common.less';
@import '../../../styles/table-common.less';
@import '../../../styles/common.less';
</style>
<template>
	<div>
		<Card>
			<div class="edit-head">
				<a @click="close" class="back-title">
					<Icon type="ios-arrow-back" />返回
				</a>
				<div class="head-name"></div>
				<span></span>
				<a @click="close" class="window-close">
					<Icon type="ios-close" size="31" class="ivu-icon-ios-close" />
				</a>
			</div>
		</Card>
		<Card class="card-margin-top">
			<p slot="title">
				<Icon type="md-list-box" size:18 class="card-title-icon"></Icon>
				创建新用户（账户ID：{{accountId}} 、账户姓名：{{accountName}}）
			</p>
			<Row>
				<Col span="3">
					<Button type="dashed" @click="getUserDataList" icon="md-refresh">刷新数据</Button>
				</Col>
				<Col span="21"></Col>
			</Row>
			<Row style="margin-top:10px;">
				<Table
					:loading="loading"
					border
					:columns="userColumns"
					:data="userData"
					ref="table"
					sortable="custom"
					@on-sort-change="changeSort"
					@on-selection-change="changeSelect"
					size="small"
				></Table>
			</Row>
			<Row type="flex" justify="end" class="page">
				<Page
					:current="searchForm.pageNumber"
					:total="total"
					:page-size="searchForm.pageSize"
					@on-change="changePage"
					@on-page-size-change="changePageSize"
					:page-size-opts="[10]"
					size="small"
					show-total
					show-elevator
					show-sizer
				></Page>
			</Row>
		</Card>
		<!-- 角色权限 -->
		<Modal
			:title="modalTitle"
			v-model="roleModalVisible"
			:mask-closable="false"
			:width="900"
			class="permModal"
		>
			<Row type="flex" justify="space-between">
				<Col v-if="expand" span="5">
					<Alert>已加入组织、小组</Alert>
					<div class="tree-bar" style="350px">
						<!--树形-->
						<Tree ref="tree" :data="treeData" @on-select-change="selectTree"></Tree>
						<Spin size="large" fix v-if="treeLoading"></Spin>
					</div>
				</Col>
				<Col :span="span">
					<div style="position:relative;">
						<Table
							:loading="loadingRole"
							border
							:columns="roleColumns"
							:data="roleData"
							ref="selection"
							sortable="custom"
							@on-sort-change="changeSort"
							@on-selection-change="changeSelect"
							size="small"
						></Table>
					</div>
					<Row type="flex" justify="end" class="page" style="margin: 10px 0;">
						<Page
							:current="searchRoleForm.pageNumberRole"
							:total="roleTotal"
							:page-size="searchRoleForm.pageSizeRole"
							@on-change="changePageRole"
							@on-page-size-change="changePageRoleSize"
							:page-size-opts="[10]"
							size="small"
							show-total
							show-elevator
							show-sizer
						></Page>
					</Row>
				</Col>
			</Row>
			<div slot="footer">
				<Button @click="cancelRole">关闭</Button>
			</div>
		</Modal>
	</div>
</template>

<script>
import {
	getUserList,
	getCorpDetail,
	disableUser,
	enableUser,
	getRoleList,
	getMemberList,
	getPostList,
	createPost,
	removePost
} from '@/api/card-system-api';
export default {
	name: 'SysUserIdentity',
	components: {},
	props: {
		transferData: Object
	},
	data() {
		return {
			accountId: '',
			accountName: '',
			orgNameTitle: '',
			maxHeight: '500px',
			loading: false, // 表单加载状态
			loadingRole: false,
			treeLoading: false,
			submitPermLoading: false,
			roleModalVisible: false,
			selectAllFlag: false,
			selectUsers: [],
			selectOrgId: '',
			span: 18,
			expand: true,
			openLevel: '0',
			userModalVisible: false,
			modalTitle: '', // 添加或编辑标题
			searchKey: '',
			treeData: '',
			treeDataFirst: '',
			userAuthorityUserId: '', //选择用户授权
			searchForm: {
				accountId: '',
				pageNumber: 1,
				pageSize: 10
			},
			searchRoleForm: {
				orgId: '',
				userId: '',
				roleId: '',
				pageNumber: 1,
				pageSize: 10
			},
			form: {
				title: '',
				content: '',
				accountId: '',
				accountName: '',
				range: 0
			},
			formValidate: {},
			roleForm: {
				name: '',
				description: ''
			},
			roleFormValidate: {},
			selectList: [],
			selectCount: 0,
			selectedUserRole: [],
			userColumns: [
				{
					type: 'index',
					width: 60,
					align: 'center'
				},
				{
					title: '用户ID',
					key: 'userId',
					minWidth: 100,
					align: 'center'
				},
				{
					title: '用户姓名',
					key: 'userName',
					minWidth: 100,
					align: 'center'
				},
				{
					title: '公司编码',
					key: 'corpId',
					minWidth: 120,
					align: 'center'
				},
				{
					title: '公司名称',
					key: 'corpName',
					minWidth: 300,
					align: 'center'
				},
				{
					title: '新增时间',
					key: 'addTime',
					width: 150,
					align: 'center'
				},
				{
					title: '状态',
					key: 'statusCode',
					align: 'center',
					width: 120,
					render: (h, params) => {
						return h(
							'i-switch',
							{
								props: {
									value: params.row.statusCode,
									size: 'large',
									'true-value': 1,
									'false-value': 0
								},
								on: {
									'on-change': v => {
										this.changeStatus(params.row, v);
									}
								}
							},
							[
								h('span', { slot: 'open' }, '启用'),
								h('span', { slot: 'close' }, '禁用')
							]
						);
					}
				},
				{
					title: '操作',
					key: 'action',
					width: 120,
					align: 'center',
					render: (h, params) => {
						return h('div', [
							h(
								'Button',
								{
									props: {
										type: 'info',
										size: 'small'
									},
									style: {
										marginRight: '5px'
									},
									on: {
										click: () => {
											this.userAuthority(params.row);
										}
									}
								},
								'用户授权'
							)
						]);
					}
				}
			],
			roleColumns: [
				{
					type: 'index',
					width: 60,
					align: 'center'
				},
				{
					width: 60,
					align: 'center',
					key: 'checkBox',
					render: (h, params) => {
						let flag = false;
						this.selectedUserRole.forEach(items => {
							if (items.roleId == params.row.roleId) {
								flag = true;
							}
						});
						return h('div', [
							h('Checkbox', {
								props: {
									value: flag
								},
								on: {
									'on-change': e => {
										if (e) {
											this.submitCreatePost(
												params.row.roleId,
												params.row.roleName
											);
										} else {
											this.submitRemovePost(
												params.row.roleId,
												params.row.roleName
											);
										}
										this.roleData[
											params.index
										].checkBox = e;
									}
								}
							})
						]);
					}
				},

				{
					title: '角色编码',
					key: 'roleId',
					align: 'center',
					width: 90
				},
				{
					title: '角色名称',
					key: 'roleName',
					minWidth: 180,
					align: 'center'
				},
				{
					title: '描述',
					key: 'description',
					minWidth: 200,
					align: 'center'
				}
			],
			userData: [],
			pageNumber: 1,
			pageSize: 10,
			total: 0,
			roleData: [],
			roleTotal: 0,
			submitLoading: false,
			backRoute: ''
		};
	},
	methods: {
		init() {
			this.accountName = this.transferData.accountName;
			this.accountId = this.transferData.accountId;
			this.getUserDataList();
		},
		getUserDataList() {
			this.loading = true;
			this.searchForm.accountId = this.accountId;
			getUserList(this.searchForm).then(res => {
				this.loading = false;
				if (res.success) {
					let resData = res.result.content;
					this.getUserData(resData).then(dt => {
						this.userData = dt;
						this.total = res.result.total;
					});
				}
			});
		},
		getUserData: async function(datas) {
			let data = [];
			for (let i = 0; i < datas.length; i++) {
				await getCorpDetail(datas[i].corpId).then(res => {
					if (res.success) {
						let item = {
							accountId: datas[i].accountId,
							addTime: datas[i].addTime,
							addUserId: datas[i].addUserId,
							addUserName: datas[i].addUserName,
							corpId: datas[i].corpId,
							corpName: res.result.corpName,
							description: datas[i].description,
							statusCode: datas[i].statusCode,
							updateTime: datas[i].updateTime,
							updateUserId: datas[i].updateUserId,
							updateUserName: datas[i].updateUserName,
							userId: datas[i].userId,
							userName: datas[i].userName
						};
						data.push(item);
					}
				});
			}
			return data;
		},
		changeStatus(row, v) {
			if (v == 1) {
				enableUser(row.userId).then(res => {
					if (res.success) {
						this.$Msg.success('启用成功');
					}
				});
			}
			if (v == 0) {
				disableUser(row.userId).then(res => {
					if (res.success) {
						this.$Msg.warning('禁用成功');
					}
				});
			}
		},
		changePage(v) {
			this.searchForm.pageNumber = v;
			this.getUserDataList();
			this.clearSelectAll();
		},
		changePageSize(v) {
			this.searchForm.pageSize = v;
			this.getUserDataList();
		},
		//用户授权-勾选角色
		submitCreatePost(roleId, roleName) {
			createPost({
				roleId: roleId,
				userId: this.userAuthorityUserId
			}).then(res => {
				if (res.success) {
					this.$Msg.success('勾选[' + roleName + ']成功');
				}
			});
		},
		//用户授权-移除角色
		submitRemovePost(roleId, roleName) {
			removePost(roleId, this.userAuthorityUserId).then(res => {
				if (res.success) {
					this.$Msg.warning('移除[' + roleName + ']成功');
				}
			});
		},
		//用户授权-选择组织，查找对应角色
		selectTree(v) {
			if (v.length > 0) {
				this.searchRoleForm.pageNumber = 1;
				this.searchRoleForm.pageSize = 10;
				this.selectOrgId = v[0].id;
				this.getOrgRoleList(this.selectOrgId);
			}
		},
		//用户授权-默认加载第一条组织的角色
		initUserOrgTree(userId) {
			//获取已有角色
			getPostList({ userId: userId, pageNumber: 1, pageSize: 9999 }).then(
				res => {
					if (res.success) {
						//保存当前用户已有角色
						this.selectedUserRole = res.result.content;
					}
				}
			);
			this.roleData = [];
			this.roleTotal = 0;
			this.treeLoading = true;
			//获取已加入组织
			getMemberList({
				userId: userId,
				pageNumber: 1,
				pageSize: 9999
			}).then(res => {
				this.treeLoading = false;
				if (res.success) {
					let tempDatas = [];
					res.result.content.forEach(e => {
						let items = {
							id: e.orgId,
							title: '[组织]' + e.orgName,
							statusCode: e.statusCode,
							disable: e.statusCode == 0
						};
						tempDatas.push(items);
					});
					this.treeData = tempDatas;
					if (tempDatas.length > 0) {
						this.getOrgRoleList(tempDatas[0].id);
					}
				}
			});
		},
		//用户授权-根据orgId查找组对应角色
		getOrgRoleList(orgId) {
			this.loadingRole = true;
			this.searchRoleForm.orgId = orgId;
			getRoleList(this.searchRoleForm).then(res => {
				this.loadingRole = false;
				if (res.success) {
					this.roleData = res.result.content;
					this.roleTotal = res.result.total;
				}
			});
		},
		//用户授权-弹出框
		userAuthority(v) {
			if (v.statusCode == 0) {
				this.$Msg.warning('请先启用');
				return;
			}
			this.userAuthorityUserId = v.userId;
			this.initUserOrgTree(v.userId);
			this.modalTitle =
				'用户授权（' + v.userId + ' - ' + v.userName + '）';
			this.roleModalVisible = true;
		},
		cancelRole() {
			this.roleModalVisible = false;
		},
		close() {
			this.$emit('close', true);
		},
		submited() {
			this.$emit('submited', true);
		},
		changeSort(v) {},
		changeSelect(v) {},
		changePageRole(v) {
			this.searchRoleForm.pageNumber = v;
			this.getOrgRoleList(this.selectOrgId);
		},
		changePageRoleSize(v) {
			this.searchRoleForm.pageSize = v;
			this.getOrgRoleList(this.selectOrgId);
		}
	},
	mounted() {
		let height = document.documentElement.clientHeight;
		this.maxHeight = Number(height - 287) + 'px';
		this.init();
	}
};
</script>

