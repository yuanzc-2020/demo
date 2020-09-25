<style lang="less">
@import '../../../styles/tree&table-common.less';
@import '../../../styles/table-common.less';
</style>
<template>
	<div class="search">
		<AccountIdentity
			v-if="currView=='accountIdentity'"
			@close="currView='index'"
			:transferData="transferData"
			@submited="submited"
		/>
		<Card v-show="currView=='index'">
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
						placeholder="请输入搜索关键字"
						clearable
					/>
					<div class="tree-bar" :style="{maxHeight: maxHeight}">
						<!--树形-->
						<Tree ref="tree" :data="treeData" :render="renderContent" @on-select-change="selectTree"></Tree>
						<Spin size="large" fix v-if="treeLoading"></Spin>
					</div>
				</Col>
				<div class="expand">
					<Icon :type="expandIcon" size="16" class="icon" @click="changeExpand" />
				</div>
				<Col :span="span">
					<Row v-show="openSearch" @keydown.enter.native="handleSearch">
						<Form ref="searchForm" :model="searchForm" inline :label-width="70">
							<Form-item label="账户姓名" prop="accountName">
								<Input
									type="text"
									v-model="searchForm.accountName"
									clearable
									placeholder="请输入姓名"
									style="width: 200px"
								/>
							</Form-item>
							<span v-if="drop">
								<Form-item label="手机号码" prop="mobile">
									<Input
										type="text"
										v-model="searchForm.mobile"
										clearable
										placeholder="请输入手机号码"
										style="width: 200px"
									/>
								</Form-item>
								<Form-item label="电子邮箱" prop="email">
									<Input
										type="text"
										v-model="searchForm.email"
										clearable
										placeholder="请输入邮箱"
										style="width: 200px"
									/>
								</Form-item>
								<Form-item label="用户类型" prop="accountType">
									<Select v-model="searchForm.accountType" placeholder="请选择" clearable style="width: 200px">
										<Option value="10">分公司账号</Option>
										<Option value="20">代理商账号</Option>
										<Option value="30">渠厅店账号</Option>
									</Select>
								</Form-item>
								<Form-item label="账户状态" prop="statusCode">
									<Select v-model="searchForm.statusCode	" placeholder="请选择" clearable style="width: 200px">
										<Option value="1">正常</Option>
										<Option value="0">禁用</Option>
										<Option value="-1">注销</Option>
									</Select>
								</Form-item>
							</span>
							<Form-item style="margin-left:-35px;" class="br">
								<Button @click="handleSearch" type="primary" icon="ios-search">搜索</Button>
								<Button @click="handleReset">重置</Button>
								<a class="drop-down" @click="dropDown">
									{{dropDownContent}}
									<Icon :type="dropDownIcon"></Icon>
								</a>
							</Form-item>
						</Form>
					</Row>
					<Row class="operation">
						<Button @click="add" type="primary" icon="md-crop">注册新账户</Button>
						<Button @click="bindUserOrg" type="primary" icon="ios-navigate-outline">创建新用户</Button>
						<Button type="dashed" @click="openSearch=!openSearch">{{openSearch ? "关闭搜索" : "开启搜索"}}</Button>
						<Button type="dashed" @click="openTip=!openTip">{{openTip ? "关闭提示" : "开启提示"}}</Button>
					</Row>
					<Row v-show="openTip">
						<Alert show-icon>
							已选择数据
							<span class="select-count">{{selectCountText}}</span>
							<a class="select-clear" @click="clearSelectAll">清空</a>
						</Alert>
					</Row>
					<Row>
						<Table
							:loading="loading"
							:columns="columns"
							border
							:data="data"
							sortable="custom"
							highlight-row
							@on-row-click="clickRow"
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
		<Modal
			:title="modalTitle"
			v-model="userModalVisible"
			:mask-closable="false"
			:width="700"
			class-name="vertical-center-modal"
		>
			<Form ref="form" :model="form" :label-width="90" :rules="formValidate">
				<Row :gutter="16">
					<Col span="12">
						<FormItem label="登录名称" prop="loginName" v-if="modalType==0">
							<Input
								v-model="form.loginName"
								maxlength="10"
								show-word-limit
								autocomplete="off"
								placeholder="请输入名称"
							/>
						</FormItem>
					</Col>
					<Col span="12">
						<FormItem label="账户姓名" prop="accountName">
							<Input
								v-model="form.accountName"
								maxlength="10"
								show-word-limit
								autocomplete="off"
								placeholder="请输入姓名"
							/>
						</FormItem>
					</Col>
				</Row>
				<Row :gutter="16">
					<Col span="12">
						<FormItem label="账户密码" prop="password" v-if="modalType==0" :error="errorPass">
							<Input
								type="password"
								password
								v-model="form.password"
								autocomplete="off"
								placeholder="请输入强密码"
							/>
						</FormItem>
					</Col>
					<Col span="12">
						<FormItem label="账户类型" prop="accountType" v-if="modalType==0">
							<Select v-model="form.accountType" placeholder="请选择">
								<Option v-for="item in accountTypes" :value="item.value" :key="item.value">{{ item.label }}</Option>
							</Select>
						</FormItem>
					</Col>
				</Row>
				<Row :gutter="16">
					<Col span="12">
						<FormItem label="手机号码" prop="mobile">
							<Input v-model="form.mobile" placeholder="请输入手机号" />
						</FormItem>
					</Col>
					<Col span="12">
						<FormItem label="邮箱地址" prop="email">
							<Input v-model="form.email" placeholder="请输入邮箱" />
						</FormItem>
					</Col>
				</Row>
			</Form>
			<div slot="footer">
				<Button @click="cancelUser">取消</Button>
				<Button type="primary" :loading="submitLoading" @click="submitUser">提交</Button>
			</div>
		</Modal>
	</div>
</template>

<script>
import {
	getRsaKey,
	getAccountList,
	registryAccount,
	updateAccount,
	disableAccount,
	enableAccount,
	lockAccount,
	unlockAccount
} from '@/api/card-system-api';
import AccountIdentity from './system-account-identity.vue';
import { validateMobile, validatePassword } from '@/libs/validate';
export default {
	name: 'SysAccount',
	components: {
		AccountIdentity
	},
	data() {
		return {
			currView: 'index',
			height: 510,
			openSearch: true,
			treeLoading: false,
			maxHeight: '500px',
			openTip: true,
			loading: true,
			reading: false,
			loadingExport: true,
			loadData: false,
			drop: false,
			editTitle: '',
			treeData: [],
			searchKey: '',
			dropDownContent: '展开',
			dropDownIcon: 'ios-arrow-down',
			selectCount: 0,
			expand: true,
			submitLoading: false,
			span: 18,
			modalType: 0,
			expandIcon: 'ios-arrow-back',
			selectLoginName: '',
			selectAccountId: '',
			selectAccountName: '',
			selectCountText: '',
			selectCorpId: '',
			selectList: [],
			transferData: {},
			searchForm: {
				corpId: '',
				accountName: '',
				mobile: '',
				email: '',
				accountType: '',
				statusCode: '',
				pageNumber: 1,
				pageSize: 10
			},
			selectDate: null,
			modalType: 0,
			userModalVisible: false,
			modalTitle: '',
			form: {
				corpId: '',
				loginName: '',
				accountName: '',
				mobile: '',
				password: '',
				email: '',
				accountType: 0
			},
			errorPass: '',
			formValidate: {
				loginName: [
					{
						required: true,
						message: '请输入登录账户',
						trigger: 'blur'
					}
				],
				accountName: [
					{
						required: true,
						message: '请输入账户名称',
						trigger: 'blur'
					}
				],
				password: [
					{
						required: true,
						message: '请输入强密码',
						trigger: 'blur'
					},
					{
						validator: validatePassword,
						trigger: 'blur'
					}
				],
				mobile: [
					{
						required: true,
						message: '请输入手机号',
						trigger: 'blur'
					},
					{
						validator: validateMobile,
						trigger: 'blur'
					}
				],
				email: [
					{
						required: true,
						message: '请输入邮箱地址'
					},
					{
						type: 'email',
						message: '邮箱格式不正确'
					}
				],
				accountType: [
					{
						required: true,
						message: '请选择类型'
					}
				]
			},
			submitLoading: false,
			columns: [
				{
					type: 'index',
					width: 60,
					align: 'center'
				},
				{
					title: '账户ID',
					key: 'accountId',
					minWidth: 90,
					align: 'center'
				},
				{
					title: '登录名称',
					key: 'loginName',
					minWidth: 100,
					align: 'center'
				},
				{
					title: '账户姓名',
					key: 'accountName',
					minWidth: 120,
					align: 'center'
				},
				{
					title: '手机号码',
					key: 'mobile',
					minWidth: 115,
					align: 'center'
				},
				{
					title: '是否锁定',
					key: 'onlock',
					align: 'center',
					width: 100,
					render: (h, params) => {
						return h(
							'i-switch',
							{
								props: {
									value: params.row.onlock,
									size: 'large',
									'true-value': true,
									'false-value': false
								},
								on: {
									'on-change': v => {
										this.changeOnlock(params.row, v);
									}
								}
							},
							[
								h('span', { slot: 'open' }, '是'),
								h('span', { slot: 'close' }, '否')
							]
						);
					}
				},
				{
					title: '状态',
					key: 'statusCode',
					align: 'center',
					minWidth: 90,
					render: (h, params) => {
						if (params.row.statusCode == 1) {
							return h('div', [
								h('Badge', {
									props: {
										status: 'success',
										text: '启用'
									}
								})
							]);
						} else if (params.row.statusCode == 0) {
							return h('div', [
								h('Badge', {
									props: {
										status: 'warning',
										text: '禁用'
									}
								})
							]);
						} else if (params.row.statusCode == -1) {
							return h('div', [
								h('Badge', {
									props: {
										status: 'error',
										text: '注销'
									}
								})
							]);
						}
					}
				},
				{
					title: '操作',
					key: 'action',
					width: 135,
					align: 'center',
					render: (h, params) => {
						let enableOrDisable = '';
						if (params.row.statusCode == 1) {
							enableOrDisable = h(
								'Button',
								{
									props: { type: 'warning', size: 'small' },
									style: {
										marginRight: '5px'
									},
									on: {
										click: () => {
											this.disable(params.row);
										}
									}
								},
								'禁用'
							);
						} else if (params.row.statusCode == 0) {
							enableOrDisable = h(
								'Button',
								{
									props: {
										type: 'success',
										size: 'small'
									},
									style: {
										marginRight: '5px'
									},
									on: {
										click: () => {
											this.enable(params.row);
										}
									}
								},
								'启用'
							);
						} else if (params.row.statusCode == -1) {
							enableOrDisable = h(
								'Button',
								{
									props: {
										type: 'error',
										size: 'small',
										disabled: 'disabled'
									},
									style: {
										marginRight: '5px'
									},
									on: {
										click: () => {}
									}
								},
								'注销'
							);
						}
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
							enableOrDisable
						]);
					}
				}
			],
			data: [],
			total: 0,
			accountTypes: [
				{
					label: '分公司账号',
					value: 10
				},
				{
					label: '代理商账号',
					value: 20
				},
				{
					label: '渠厅店账号',
					value: 30
				}
			],
			dictCorpCurr: {}
		};
	},
	methods: {
		init() {
			this.getTreeList();
			this.getDataList();
		},
		getTreeList() {
			this.treeLoading = true;
			this.handleAuthcMethods.getBaseAllEnableCorpTree().then(res => {
				this.treeData = res;
				this.treeLoading = false;
			});
		},
		renderContent(h, { root, node, data }) {
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
									data.statusCode == 1
										? '#2d8cf0'
										: '#515a6e',
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
				this.handleAuthcMethods
					.getBaseAllEnableCorpTreeSearch(this.searchKey)
					.then(res => {
						this.treeData = res;
						this.treeLoading = false;
					});
			} else {
				this.getTreeList();
			}
		},
		submited() {
			this.currView = 'index';
			this.getDataList();
		},
		changeSort(v) {},
		showSelect(v) {},
		changePage(v) {
			this.searchForm.pageNumber = v;
			this.getDataList();
			this.clearSelectAll();
		},
		changePageSize(v) {
			this.searchForm.pageSize = v;
			this.getDataList();
		},
		selectDateRange(v) {
			if (v) {
				this.searchForm.startDate = v[0];
				this.searchForm.endDate = v[1];
			}
		},
		cancelEdit() {
			let data = this.$refs.tree.getSelectedNodes()[0];
			if (data) {
				data.selected = false;
			}
			this.selectNode = {};
			this.editTitle = '';
			this.selectCorpId = '';
			this.searchForm.corpId = '';
			this.getDataList();
		},
		selectTree(v) {
			if (v) {
				this.editTitle = v.title;
				this.selectCorpId = v.id;
				this.searchForm.corpId = v.id;
				this.searchForm.pageNumber = 1;
				this.searchForm.pageSize = 10;
				this.getDataList();
			} else {
				this.cancelEdit();
			}
		},
		clickRow(row, index) {
			this.selectCountText = ' ' + row.loginName + ' ' + row.accountName;
			this.selectLoginName = row.loginName;
			this.selectAccountId = row.accountId;
			this.selectAccountName = row.accountName;
		},
		//搜索
		getDataList() {
			// 多条件搜索用户列表
			this.loading = true;
			// 避免后台默认值
			if (!this.searchForm.accountType) {
				this.searchForm.accountType = '';
			}
			if (this.searchForm.statusCode == '') {
				delete this.searchForm.statusCode;
			}
			if (this.searchForm.corpFullId == '') {
				this.searchForm.corpFullId = this.dictCorpCurr.corpFullId;
			}
			getAccountList(this.searchForm).then(res => {
				this.loading = false;
				if (res.success) {
					this.data = res.result.content;
					this.total = res.result.total;
				}
			});
			this.clearSelectAll();
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
		handleDropdown(name) {
			if (name == 'refresh') {
				this.getDataList();
				this.clearSelectAll();
			}
		},
		changeOnlock(row, v) {
			this.loading = true;
			if (v) {
				lockAccount(row.accountId).then(res => {
					this.loading = false;
					if (res.success) {
						this.$Msg.success('锁定成功');
					}
				});
			} else {
				unlockAccount(row.accountId).then(res => {
					this.loading = false;
					if (res.success) {
						this.$Msg.warning('解锁成功');
					}
				});
			}
		},
		cancelUser() {
			this.userModalVisible = false;
		},
		submitUser() {
			this.$refs.form.validate(valid => {
				if (valid) {
					if (this.modalType == 0) {
						this.form.corpId = this.selectCorpId;
						if (
							this.form.password == '' ||
							this.form.password == undefined
						) {
							this.errorPass = '密码不能为空';
							return;
						}
						if (this.form.password.length < 8) {
							this.errorPass = '密码长度不得少于8位';
							return;
						}
						let rsaPassword = this.getRsaCode(
							this.form.password,
							this.getStore('pubKey')
						);
						this.form.password = rsaPassword;
						console.log(rsaPassword);
						this.submitLoading = true;
						registryAccount(this.form).then(res => {
							this.submitLoading = false;
							if (res.success) {
								this.$Msg.success('操作成功');
								this.getDataList();
								this.userModalVisible = false;
							}
						});
					} else {
						// 编辑
						this.submitLoading = true;
						updateAccount(this.form).then(res => {
							this.submitLoading = false;
							if (res.success) {
								this.$Msg.success('操作成功');
								this.getDataList();
								this.userModalVisible = false;
							}
						});
					}
				}
			});
		},
		add() {
			if (this.selectCorpId == '') {
				this.$Msg.warning('请先选择注册账号所属公司');
				return;
			} else {
				this.$refs.form.resetFields();
				this.modalType = 0;
				this.modalTitle = '注册新账户（' + this.editTitle + '）';
				this.userModalVisible = true;
			}
		},
		edit(v) {
			this.modalType = 1;
			this.modalTitle = '编辑账户';
			this.$refs.form.resetFields();
			for (let attr in v) {
				if (v[attr] == null) {
					v[attr] = '';
				}
			}
			let str = JSON.stringify(v);
			let data = JSON.parse(str);
			this.form = data;
			this.userModalVisible = true;
		},
		enable(v) {
			this.$Modal.confirm({
				title: '确认启用',
				content: '您确认要启用账户 ' + v.loginName + ' ?',
				loading: true,
				onOk: () => {
					enableAccount(v.accountId).then(res => {
						this.$Modal.remove();
						if (res.success) {
							this.$Msg.success('操作成功');
							this.getDataList();
						}
					});
				}
			});
		},
		disable(v) {
			this.$Modal.confirm({
				title: '确认禁用',
				content: '您确认要禁用账户 ' + v.loginName + ' ?',
				loading: true,
				onOk: () => {
					disableAccount(v.accountId).then(res => {
						this.$Modal.remove();
						if (res.success) {
							this.$Msg.success('操作成功');
							this.getDataList();
						}
					});
				}
			});
		},
		bindUserOrg() {
			if (this.selectAccountId == '') {
				this.$Msg.warning('您还未选择要注册的账户');
				return;
			}
			let data = [];
			data.loginName = this.selectLoginName;
			data.accountId = this.selectAccountId;
			data.accountName = this.selectAccountName;
			this.transferData = data;
			this.currView = 'accountIdentity';
		},
		dropDown() {
			if (this.drop) {
				this.dropDownContent = '展开';
				this.dropDownIcon = 'ios-arrow-down';
			} else {
				this.dropDownContent = '收起';
				this.dropDownIcon = 'ios-arrow-up';
			}
			this.drop = !this.drop;
		},
		showSelect(e) {
			this.exportData = e;
			this.selectList = e;
			this.selectCount = e.length;
		},
		clearSelectAll() {
			this.$refs.table.clearCurrentRow();
			this.selectCountText = '';
			this.selectLoginName = '';
			this.selectAccountId = '';
			this.selectAccountName = '';
		}
	},
	created() {
		this.getTreeList();
	},
	mounted() {
		let height = document.documentElement.clientHeight;
		this.maxHeight = Number(height - 200) + 'px';
		this.handleAuthcMethods.getBaseCurrentCorpInfo().then(res => {
			this.dictCorpCurr = res;
			this.init();
		});
	}
};
</script>
