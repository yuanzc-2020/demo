<style lang="less">
@import '../../../styles/tree&table-common.less';
@import '../../../styles/table-common.less';
@import './system-role.less';
</style>
<template>
	<div class="search">
		<Card>
			<Row type="flex" justify="space-between">
				<Col v-if="expand" span="5">
					<Alert show-icon>
						当前选择：
						<span class="select-title">{{editTitle}}</span>
						<a class="select-clear" v-if="editTitle" @click="cancelEdit">取消选择</a>
					</Alert>
					<Input
						v-model="searchKey"
						suffix="ios-search"
						@on-change="search"
						clearable
						placeholder="输入关键字"
					/>
					<div class="tree-bar" :style="{maxHeight: maxHeight}">
						<Tree ref="tree" :data="treeData" :load-data="loadData" :render="renderContentCorp"></Tree>
						<Spin size="large" fix v-if="treeLoading"></Spin>
					</div>
				</Col>
				<div class="expand">
					<Icon :type="expandIcon" size="16" class="icon" @click="changeExpand" />
				</div>
				<Col :span="span">
					<Row v-show="openSearch" @keydown.enter.native="handleSearch">
						<Form ref="searchForm" :model="searchForm" inline :label-width="70">
							<Form-item label="角色名称" prop="roleName">
								<Input v-model="searchForm.roleName" placeholder="请输入角色名称" />
							</Form-item>
							<Form-item label="角色状态" prop="statusCode">
								<Select v-model="searchForm.statusCode" placeholder="请选择" clearable style="width: 200px">
									<Option value="1">启用</Option>
									<Option value="0">禁用</Option>
								</Select>
							</Form-item>
							<Form-item style="margin-left:-35px;" class="br">
								<Button @click="handleSearch" type="primary" icon="ios-search">搜索</Button>
								<Button @click="handleReset">重置</Button>
							</Form-item>
						</Form>
					</Row>
					<Row class="operation">
						<Button @click="add" type="primary" icon="md-add">新增角色</Button>
						<Button type="dashed" @click="getDataList">刷新数据</Button>
						<Button type="dashed" @click="openSearch=!openSearch">{{openSearch ? "关闭搜索" : "开启搜索"}}</Button>
					</Row>
					<Row>
						<Table
							:loading="loading"
							border
							:columns="columns"
							:data="data"
							sortable="custom"
							@on-sort-change="changeSort"
							@on-selection-change="showSelect"
							ref="table"
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
							:page-size-opts="[10,20,50]"
							size="small"
							show-total
							show-elevator
							show-sizer
						></Page>
					</Row>
				</Col>
			</Row>
		</Card>
		<!-- 新增角色 -->
		<Modal :title="modalTitle" v-model="modalVisible" :mask-closable="false" :width="500">
			<Form ref="form" :model="form" :label-width="80" :rules="formValidate">
				<FormItem label="角色名称" prop="roleName">
					<Input v-model="form.roleName" maxlength="40" show-word-limit />
				</FormItem>
				<FormItem label="角色描述" prop="description">
					<Input
						v-model="form.description"
						type="textarea"
						:autosize="{minRows: 4,maxRows: 6}"
						placeholder="一些描述"
					></Input>
				</FormItem>
			</Form>
			<div slot="footer">
				<Button type="text" @click="modalVisible=false">取消</Button>
				<Button type="primary" :loading="submitLoading" @click="handelSubmit">提交</Button>
			</div>
		</Modal>
		<!-- 菜单权限 -->
		<Modal
			:title="modalTitle"
			v-model="permModalVisible"
			:mask-closable="false"
			:width="500"
			:styles="{top: '30px'}"
			class="permModal"
		>
			<div style="position:relative;height:350px;">
				<Tree
					ref="tree"
					:data="permData"
					show-checkbox
					:render="renderContent"
					@on-check-change="permCheckChange"
					:check-strictly="true"
				></Tree>
				<Spin size="large" fix v-if="permTreeLoading"></Spin>
			</div>
			<div slot="footer">
				<Row>
					<Col span="8">
						<Select
							v-model="openLevel"
							@on-change="changeOpen"
							style="width:110px;text-align:left;margin-right:10px"
						>
							<Option value="0">展开所有</Option>
							<Option value="1">收合所有</Option>
							<Option value="2">仅展开一级</Option>
							<Option value="3">仅展开两级</Option>
						</Select>
					</Col>
					<Col span="12" offset="4">
						<!-- <Button type="primary" :loading="submitPermLoading" @click="submitPermEdit">提交</Button> -->
						<Button type="text" @click="cancelPermEdit">取消</Button>
					</Col>
				</Row>
			</div>
		</Modal>
	</div>
</template>

<script>
import {
	getPermissionList,
	getCorpList,
	getOrgDataList,
	getCorpResOrgList,
	getRoleList,
	getCorpResRoleList,
	createRole,
	updateRole,
	disableRole,
	enableRole,
	getAuthzList,
	createAuthz,
	createAuthzBatch,
	removeAuthz,
	ownerRemoveAuthz
} from '@/api/card-system-api';
import util from '@/libs/util.js';
export default {
	name: 'SysRole',
	data() {
		return {
			disabled: false,
			style: '',
			openSearch: true,
			openTip: true,
			permModalVisible: false,
			treeLoading: false,
			maxHeight: '600px',
			loading: false,
			editTitle: '',
			searchKey: '',
			expand: true,
			span: 18,
			expandIcon: 'ios-arrow-back',
			selectNode: {},
			selectTitle: '',
			treeData: [],
			searchForm: {
				corpFullId: '',
				roleName: '',
				statusCode: 1,
				pageNumber: 1,
				pageSize: 10
			},
			modalType: 0,
			modalVisible: false,
			modalTitle: '',
			form: {
				orgId: '',
				roleId: '',
				roleName: '',
				pid: '-1',
				orders: 1,
				description: ''
			},
			formValidate: {
				roleName: [
					{
						required: true,
						message: '不能为空',
						trigger: 'blur'
					}
				]
			},
			columns: [
				{
					type: 'index',
					align: 'center',
					width: 60
				},
				{
					title: '角色编码',
					key: 'roleId',
					align: 'center',
					width: 100
				},
				{
					title: '角色名称',
					key: 'roleName',
					align: 'center',
					minWidth: 180
				},
				{
					title: '所属公司',
					key: 'corpName',
					minWidth: 140,
					align: 'center',
					render: (h, params) => {
						let text = '';
						this.dictCorpList.forEach(e => {
							if (e.corpId == params.row.corpId) {
								text = e.corpName;
							}
						});
						return h('div', text);
					}
				},
				{
					title: '状态',
					key: 'statusCode',
					align: 'center',
					width: 100,
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
								h(
									'span',
									{
										slot: 'open'
									},
									'启用'
								),
								h(
									'span',
									{
										slot: 'close'
									},
									'禁用'
								)
							]
						);
					}
				},
				{
					title: '操作',
					key: 'action',
					minWidth: 180,
					align: 'center',
					render: (h, params) => {
						let operatorCollect = '';
						operatorCollect = h(
							'Button',
							{
								props: {
									type: 'warning',
									size: 'small',
									disabled: !params.row.statusCode
								},
								style: {
									marginRight: '5px'
								},
								on: {
									click: () => {
										this.menuPerm(params.row);
									}
								}
							},
							'菜单权限'
						);
						return h('div', [
							h(
								'Button',
								{
									props: {
										type: 'primary',
										size: 'small'
									},
									style: {
										marginRight: '5px'
									},
									on: {
										click: () => {
											this.edit(params.row);
										}
									}
								},
								'编辑'
							),
							operatorCollect
						]);
					}
				},
				{
					title: '新增人',
					align: 'center',
					key: 'addUserName',
					minWidth: 100
				},
				{
					title: '新增时间',
					align: 'center',
					key: 'addTime',
					minWidth: 150
				},
				{
					title: '描述',
					key: 'description',
					minWidth: 200
				}
			],
			submitLoading: false, // 新增或编辑提交状态
			submitPermLoading: false,
			data: [], //表单数据
			total: 0, // 表单数据总数
			loadingEdit: true,
			dataType: 0,
			permData: [],
			editRolePermId: '',
			editRolePermName: '',
			selectAllFlag: false,
			rolePermissions: [],
			permTreeLoading: true,
			corpOrgDatas: [],
			dictCorpList: [],
			dictCorpCurr: {}
		};
	},
	methods: {
		init() {
			// 获取表单数据
			this.getDataList();
			// 获取所有权限（菜单）
			this.getPermList();
		},
		//公司和架构树
		getTreeList() {
			this.treeLoading = true;
			let corpCurrent = JSON.parse(JSON.stringify(this.dictCorpCurr));
			let tempDatas = [];
			let item = {
				id: corpCurrent.corpId,
				pid: 0,
				title: '[公司]' + corpCurrent.corpName,
				statusCode: corpCurrent.statusCode,
				corpFullId: corpCurrent.corpFullId,
				level: corpCurrent.level,
				dataType: 1,
				loading: false,
				children: []
			};
			tempDatas.push(item);
			this.treeData = tempDatas;
			this.treeLoading = false;
		},
		renderContentCorp(h, { root, node, data }) {
			let icon = '';
			icon = 'md-list-box';
			return h(
				'span',
				{
					style: {
						display: 'inline-block',
						cursor: 'pointer'
					},
					on: {
						click: () => {
							this.selectTree(data);
						}
					}
				},
				[
					h('span', [
						h('Icon', {
							props: {
								type: icon,
								size: '16'
							},
							style: {
								color:
									data.dataType == 1 ? '#2d8cf0' : '#ff9900',
								'margin-right': '8px',
								'margin-bottom': '3px'
							}
						}),
						h(
							'span',
							{
								class: {
									'ivu-tree-title': true,
									'ivu-tree-title-selected': false
								}
							},
							data.title
						)
					])
				]
			);
		},
		search() {
			if (this.searchKey) {
				this.treeLoading = true;
				getCorpResOrgList({
					corpFullId: this.dictCorpCurr.corpFullId,
					orgName: this.searchKey,
					statusCode: 1,
					pageNumber: 1,
					pageSize: 20
				}).then(res => {
					this.treeLoading = false;
					if (res.success) {
						let tempDatas = [];
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
						this.treeData = tempDatas;
					}
				});
			} else {
				this.getTreeList();
			}
		},
		//tree异步加载子节点
		loadData(item, callback) {
			this.handleAuthcMethods.getBaseAllCorpAndOrg(item).then(res => {
				callback(res);
			});
		},
		selectTree(v) {
			if (v) {
				if (v.dataType == 1) {
					this.searchForm.corpFullId = v.corpFullId;
					delete this.searchForm.orgId;
				} else if (v.dataType == 2) {
					this.searchForm.orgId = v.id;
					this.searchForm.corpFullId = '';
					this.editTitle = v.title;
					this.form.orgId = v.id;
				}
				this.editTitle = v.title;
				this.selectTitle = v.title;
				this.searchForm.pageNumber = 1;
				this.searchForm.pageSize = 10;
				this.getDataList();
			} else {
				this.cancelEdit();
			}
		},
		cancelEdit() {
			let data = this.$refs.tree.getSelectedNodes()[0];
			if (data) {
				data.selected = false;
			}
			this.selectNode = {};
			this.searchForm.corpFullId = '';
			this.editTitle = '';
			this.getDataList();
		},
		changeStatus(row, v) {
			if (v == 1) {
				this.loading = true;
				enableRole(row.roleId).then(res => {
					this.loading = false;
					if (res.success) {
						this.$Msg.success('启用成功');
						this.getDataList();
					}
				});
			}
			if (v == 0) {
				this.loading = true;
				disableRole(row.roleId).then(res => {
					this.loading = false;
					if (res.success) {
						this.$Msg.warning('禁用成功');
						this.getDataList();
					}
				});
			}
		},
		changeExpand() {
			this.expand = !this.expand;
			if (this.expand) {
				this.expandIcon = 'ios-arrow-back';
				this.span = 18;
			} else {
				this.expandIcon = 'ios-arrow-forward';
				this.span = 23;
			}
		},
		changeSort(v) {},
		showSelect(v) {},
		changePage(v) {
			this.searchForm.pageNumber = v;
			this.getDataList();
		},
		changePageSize(v) {
			this.searchForm.pageSize = v;
			this.getDataList();
		},
		getDataList() {
			this.loading = true;
			if (this.searchForm.corpFullId == '') {
				this.searchForm.corpFullId = this.dictCorpCurr.corpFullId;
			}
			getCorpResRoleList(this.searchForm).then(res => {
				this.loading = false;
				if (res.success) {
					this.data = res.result.content;
					this.total = res.result.total;
				}
			});
		},
		handleSearch() {
			this.searchForm.pageNumber = 1;
			this.searchForm.pageSize = 10;
			this.getDataList();
		},
		handleReset() {
			this.$refs.searchForm.resetFields();
			this.searchForm.pageNumber = 1;
			this.searchForm.pageSize = 10;
			this.getDataList();
		},
		changeSort(e) {
			this.searchForm.sort = e.key;
			this.searchForm.order = e.order;
			if (e.order == 'normal') {
				this.searchForm.order = '';
			}
			this.getDataList();
		},
		add() {
			if (this.form.orgId == '') {
				this.$Msg.warning('请先选择组织、小组');
				return;
			} else {
				this.modalType = 0;
				this.modalTitle = '新增角色（' + this.selectTitle + '）';
				this.modalVisible = true;
				this.$refs.form.resetFields();
				this.disabled = false;
			}
		},
		edit(v) {
			this.modalType = 1;
			this.disabled = true;
			this.modalTitle = '编辑角色';
			for (let attr in v) {
				if (v[attr] == null) {
					v[attr] = '';
				}
			}
			let str = JSON.stringify(v);
			let data = JSON.parse(str);
			this.form = data;
			this.modalVisible = true;
		},
		handelSubmit() {
			this.$refs.form.validate(valid => {
				if (valid) {
					this.submitLoading = true;
					if (this.modalType == 0) {
						createRole(this.form).then(res => {
							this.submitLoading = false;
							if (res.success) {
								this.$Msg.success('操作成功');
								this.getDataList();
								this.modalVisible = false;
							}
						});
					} else if (this.modalType == 1) {
						updateRole({
							roleId: this.form.roleId,
							roleName: this.form.roleName,
							description: this.form.description
						}).then(res => {
							this.submitLoading = false;
							if (res.success) {
								this.$Msg.success('操作成功');
								this.getDataList();
								this.modalVisible = false;
							}
						});
					}
				}
			});
		},
		//获取全部菜单
		getPermList: async function() {
			this.permTreeLoading = true;
			let params = {
				levelId: 1,
				pageNumber: 1,
				pageSize: 9999
			};
			await getPermissionList(params).then(res => {
				if (res.success) {
					let datas = res.result;
					let menus = [];
					datas.content.forEach(e => {
						let item = {
							id: e.permissionId,
							parentId: e.pid,
							name: e.vueName,
							showAlways: e.vueShowAlways,
							level:
								e.level == 1 ? '0' : e.level == 2 ? '1' : '2',
							type:
								e.vueType == 0
									? '-1'
									: e.vueType == 1
									? '0'
									: '1',
							title: e.permissionName + '(' + e.description + ')',
							path: e.vuePath,
							component: e.vueComponent,
							icon: e.icon,
							url: e.urlPattern,
							buttonType: e.buttontype,
							permTypes: e.permtypes,
							description: e.description,
							statusCode: e.statusCode,
							disabled: e.statusCode == 0 ? true : false,
							expand: false,
							checked: false
						};
						menus.push(item);
					});
					let menuData = this.globalUtil.listConvertTreeData(
						menus,
						'id',
						'parentId',
						'children'
					);
					this.permData = menuData;
					this.permTreeLoading = false;
				}
			});
		},
		//授权菜单权限
		menuPerm(v) {
			this.editRolePermId = v.roleId;
			this.editRolePermName = v.roleName;
			this.modalTitle = '分配菜单权限（' + v.roleName + '）';
			this.getPermList().then(dt => {
				//获取当前角色授权
				getAuthzList({
					ownerId: v.roleId,
					ownerType: 3,
					pageNumber: 1,
					pageSize: 9999
				}).then(res => {
					if (res.success) {
						if (res.result.content.length > 0) {
							this.rolePermissions = res.result.content;
							this.checkPermTree(
								this.permData,
								this.rolePermissions
							);
						}
						this.permModalVisible = true;
					}
				});
			});
		},
		//递归判断子节点
		checkPermTree(permData, rolePerms) {
			let that = this;
			permData.forEach(function(p) {
				if (that.hasPerm(p, rolePerms)) {
					p.checked = true;
				} else {
					p.checked = false;
				}
				if (p.children && p.children.length > 0) {
					that.checkPermTree(p.children, rolePerms);
				}
			});
		},
		//判断角色拥有的权限节点勾选
		hasPerm(p, rolePerms) {
			let flag = false;
			for (let i = 0; i < rolePerms.length; i++) {
				if (p.id == rolePerms[i].permissionId) {
					flag = true;
					break;
				}
			}
			if (flag) {
				return true;
			}
			return false;
		},
		changeOpen(v) {
			if (v == '0') {
				this.permData.forEach(e => {
					e.expand = true;
					if (e.children && e.children.length > 0) {
						e.children.forEach(c => {
							c.expand = true;
							if (c.children && c.children.length > 0) {
								c.children.forEach(function(b) {
									b.expand = true;
								});
							}
						});
					}
				});
			} else if (v == '1') {
				this.permData.forEach(e => {
					e.expand = false;
					if (e.children && e.children.length > 0) {
						e.children.forEach(c => {
							c.expand = false;
							if (c.children && c.children.length > 0) {
								c.children.forEach(function(b) {
									b.expand = false;
								});
							}
						});
					}
				});
			} else if (v == '2') {
				this.permData.forEach(e => {
					e.expand = true;
					if (e.children && e.children.length > 0) {
						e.children.forEach(c => {
							c.expand = false;
							if (c.children && c.children.length > 0) {
								c.children.forEach(function(b) {
									b.expand = false;
								});
							}
						});
					}
				});
			} else if (v == '3') {
				this.permData.forEach(e => {
					e.expand = true;
					if (e.children && e.children.length > 0) {
						e.children.forEach(c => {
							c.expand = true;
							if (c.children && c.children.length > 0) {
								c.children.forEach(function(b) {
									b.expand = false;
								});
							}
						});
					}
				});
			}
		},
		renderContent(h, { root, node, data }) {
			let icon = '';
			if (data.level == 0) {
				icon = 'ios-navigate';
			} else if (data.level == 1) {
				icon = 'md-list-box';
			} else if (data.level == 2) {
				icon = 'md-list';
			} else if (data.level == 3) {
				icon = 'md-radio-button-on';
			} else {
				icon = 'md-radio-button-off';
			}
			return h('span', [
				h('span', [
					h('Icon', {
						props: {
							type: icon,
							size: '16'
						},
						style: {
							'margin-right': '8px',
							'margin-bottom': '3px'
						}
					}),
					h('span', data.title)
				])
			]);
		},
		//授权和移除
		permCheckChange(data, item) {
			if (item.checked) {
				createAuthz({
					authzName: '菜单权限_角色_' + this.editRolePermName,
					ownerId: this.editRolePermId,
					ownerType: 3,
					permissionId: item.id
				}).then(res => {
					if (res.success) {
						this.$Msg.success('授权成功');
					}
				});
			} else {
				ownerRemoveAuthz(3, this.editRolePermId, item.id).then(res => {
					if (res.success) {
						this.$Msg.warning('移除成功');
					}
				});
			}
		},
		//提交角色菜单权限
		submitPermEdit() {
			this.submitPermLoading = true;
			let permIds = [];
			let selectedNodes = this.$refs.tree.getCheckedNodes();
			selectedNodes.forEach(function(e) {
				permIds.push(e.id);
			});
			createAuthzBatch({
				authzName: '菜单权限_角色_' + this.editRolePermName,
				ownerId: this.editRolePermId,
				ownerType: 3,
				permissionIds: permIds
			}).then(res => {
				this.submitPermLoading = false;
				if (res.success) {
					this.$Msg.success('提交成功');
					// 标记重新获取菜单数据
					// this.$store.commit("setAdded", false);
					// util.initRouter(this);
					// this.getDataList();
					// this.permModalVisible = false;
				}
			});
		},
		cancelPermEdit() {
			this.permModalVisible = false;
		}
	},
	created() {
		this.handleAuthcMethods.getBaseAllCorpList().then(res => {
			this.dictCorpList = res;
		});
	},
	mounted() {
		let height = document.documentElement.clientHeight;
		this.maxHeight = Number(height - 150) + 'px';
		this.handleAuthcMethods.getBaseCurrentCorpInfo().then(res => {
			this.dictCorpCurr = res;
			this.getTreeList();
			this.init();
		});
	}
};
</script>
