 <style lang="less">
@import '../../../styles/tree&table-common.less';
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
						placeholder="请输入搜索关键字"
						clearable
					/>
					<div class="tree-bar" :style="{maxHeight: maxHeight}">
						<!---->
						<Tree
							ref="tree"
							:data="treeData"
							:load-data="loadData"
							:render="renderContent"
							@on-select-change="selectTree"
						></Tree>
						<Spin size="large" fix v-if="treeLoading"></Spin>
					</div>
				</Col>
				<div class="expand">
					<Icon :type="expandIcon" size="16" class="icon" @click="changeExpand" />
				</div>
				<Col :span="span">
					<Row v-show="openSearch" @keydown.enter.native="handleSearch">
						<Form ref="searchForm" :model="searchForm" inline :label-width="70" @submit.native.prevent>
							<Form-item label="组织名称" prop="orgName">
								<Input
									type="text"
									v-model="searchForm.orgName"
									placeholder="请输入组织名称"
									clearable
									style="width: 200px"
								/>
							</Form-item>
							<Form-item label="数据状态" prop="statusCode">
								<Select v-model="searchForm.statusCode" placeholder="请选择" clearable style="width: 200px">
									<Option value="1">正常</Option>
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
						<Button @click="add" icon="md-add" type="primary">新增组织</Button>
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
		<Modal
			:title="modalTitle"
			v-model="orgModalVisible"
			:mask-closable="false"
			:width="500"
			:styles="{left: '20px'}"
			class-name="vertical-center-modal"
		>
			<Form ref="form" :model="form" :label-width="90" :rules="formValidate">
				<FormItem label="所属架构" v-if="modalType==0">
					<span>{{this.editTitle}}</span>
				</FormItem>
				<FormItem label="组织名称" prop="orgName">
					<Input
						v-model="form.orgName"
						maxlength="50"
						show-word-limit
						autocomplete="off"
						placeholder="请输入组织名称"
					/>
				</FormItem>
				<FormItem label="组织类型" prop="existsType" v-if="modalType==0">
					<Select v-model="form.existsType">
						<Option v-for="item in existsTypes" :value="item.value" :key="item.value">{{item.title}}</Option>
					</Select>
				</FormItem>
				<FormItem label="排序值" prop="orders">
					<Tooltip trigger="hover" placement="right" content="值越小越靠前">
						<InputNumber :max="1000" :min="1" v-model="form.orders"></InputNumber>
					</Tooltip>
				</FormItem>
				<FormItem label="组织描述" prop="description">
					<Input
						v-model="form.description"
						type="textarea"
						:autosize="{minRows: 2,maxRows: 5}"
						placeholder="请输入描述"
					></Input>
				</FormItem>
			</Form>
			<div slot="footer">
				<Button @click="cancelOrg">取消</Button>
				<Button type="primary" :loading="submitLoading" @click="submitOrg">提交</Button>
			</div>
		</Modal>
	</div>
</template>

<script>
import {
	getCorpList,
	getArchDataList,
	getCorpResArchList,
	getCorpResOrgList,
	insertOrg,
	updateOrg,
	disableOrg,
	enableOrg
} from '@/api/card-system-api';
export default {
	name: 'SysOrg',
	components: {},
	data() {
		return {
			orgModalVisible: false,
			openSearch: true,
			treeLoading: false, // 树加载状态
			maxHeight: '500px',
			loading: false, // 表格加载状态
			editTitle: '', // 编辑节点名称
			searchKey: '', // 搜索树
			expand: true,
			submitLoading: false,
			span: 18,
			modalType: 0,
			expandIcon: 'ios-arrow-back',
			selectNode: {},
			treeData: [], // 树数据
			searchForm: {
				corpFullId: '',
				corpId: '',
				archId: '',
				orgName: '',
				statusCode: '',
				pageNumber: 1, // 当前页数
				pageSize: 10 // 页面大小
			},
			form: {
				archId: '',
				orgName: '',
				existsType: 0,
				orders: 1,
				description: ''
			},
			formValidate: {
				orgName: [
					{
						required: true,
						message: '请输入',
						trigger: 'blur'
					}
				]
			},
			columns: [
				{
					type: 'index',
					width: 60,
					align: 'center'
				},
				{
					title: '组织ID',
					key: 'orgId',
					minWidth: 100,
					align: 'center'
				},
				{
					title: '组织名称',
					key: 'orgName',
					minWidth: 180,
					align: 'center'
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
					title: '组织类型',
					key: 'existsTypes',
					align: 'center',
					minWidth: 110,
					render: (h, params) => {
						let re = '';
						if (params.row.existsType == 1) {
							re = '实体组织';
						} else if (params.row.existsType == 0) {
							re = '虚拟组织';
						}
						return h('div', re);
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
								h('span', { slot: 'open' }, '启用'),
								h('span', { slot: 'close' }, '禁用')
							]
						);
					}
				},
				{
					title: '操作',
					key: 'action',
					width: 100,
					align: 'center',
					render: (h, params) => {
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
								'编辑组织'
							)
						]);
					}
				},
				{
					title: '排序',
					key: 'orders',
					align: 'center',
					minWidth: 80
				},
				{
					title: '新增人',
					key: 'addUserName',
					minWidth: 100,
					align: 'center'
				},
				{
					title: '新增时间',
					key: 'addTime',
					minWidth: 150,
					align: 'center'
				},
				{
					title: '描述',
					key: 'description',
					minWidth: 200,
					align: 'left'
				}
			],
			data: [], //表单数据
			total: 0, // 表单数据总数
			corpDatas1: [],
			corpDatas2: [],
			corpArchDatas: [],
			dictCorpList: [],
			dictCorpCurr: {},
			dictCurrentUserInfo: {},
			existsTypes: [
				{
					title: '虚拟组织',
					value: 0
				},
				{
					title: '实体组织',
					value: 1
				}
			]
		};
	},
	methods: {
		init() {
			this.getTreeList();
			this.getDataList();
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
				getArchDataList({
					corpFullId: this.dictCorpCurr.corpFullId,
					archName: this.searchKey,
					statusCode: 1,
					pageNumber: 1,
					pageSize: 20
				}).then(res => {
					this.treeLoading = false;
					if (res.success) {
						let tempDatas = [];
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
						this.treeData = tempDatas;
					}
				});
			} else {
				this.getTreeList();
			}
		},
		//tree异步加载子节点
		loadData(item, callback) {
			this.handleAuthcMethods.getBaseAllCorpAndArch(item).then(res => {
				callback(res);
			});
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
			if (this.searchForm.statusCode == '') {
				delete this.searchForm.statusCode;
			}
			if (this.searchForm.corpFullId == '') {
				this.searchForm.corpFullId = this.dictCorpCurr.corpFullId;
			}
			getCorpResOrgList(this.searchForm).then(res => {
				this.loading = false;
				if (res.success) {
					this.data = res.result.content;
					this.total = res.result.total;
				}
			});
		},
		changeStatus(row, v) {
			if (v == 1) {
				enableOrg(row.orgId).then(res => {
					this.loading = false;
					if (res.success) {
						this.$Msg.success('操作成功');
					}
				});
			}
			if (v == 0) {
				disableOrg(row.orgId).then(res => {
					this.loading = false;
					if (res.success) {
						this.$Msg.warning('禁用成功');
					}
				});
			}
		},
		cancelEdit() {
			let data = this.$refs.tree.getSelectedNodes()[0];
			if (data) {
				data.selected = false;
			}
			this.selectNode = {};
			this.editTitle = '';
			this.searchForm.corpId = '';
			this.searchForm.archId = '';
			this.getDataList();
		},
		selectTree(v) {
			if (v) {
				if (v.dataType == 1) {
					this.searchForm.corpId = v.id;
					delete this.searchForm.archId;
				} else if (v.dataType == 2) {
					this.searchForm.archId = v.id;
					delete this.searchForm.corpId;
					this.editTitle = v.title;
					this.form.archId = v.id;
				}
				this.searchForm.pageNumber = 1;
				this.searchForm.pageSize = 10;
				this.getDataList();
			} else {
				this.cancelEdit();
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
		add() {
			if (this.form.archId == '') {
				this.$Msg.warning('请先选择架构');
			} else {
				this.modalType = 0;
				this.modalTitle = '新增组织';
				this.$refs.form.resetFields();
				this.form.orgName = '';
				this.orgModalVisible = true;
			}
		},
		edit(v) {
			this.modalType = 1;
			this.modalTitle = '编辑组织';
			this.$refs.form.resetFields();
			for (let attr in v) {
				if (v[attr] == null) {
					v[attr] = '';
				}
			}
			let str = JSON.stringify(v);
			let data = JSON.parse(str);
			this.form = data;
			this.orgModalVisible = true;
		},
		submitOrg() {
			this.$refs.form.validate(valid => {
				if (valid) {
					if (this.modalType == 0) {
						if (this.form.archId == '' || this.editTitle == '') {
							this.errorPass = '架构不能为空';
							this.$Msg.warning('架构不能为空');
						} else {
							this.submitLoading = true;
							insertOrg({
								archId: this.form.archId,
								pid: -1,
								orders: this.form.orders,
								existsType: this.form.existsType,
								orgName: this.form.orgName,
								description: this.form.description
							}).then(res => {
								this.submitLoading = false;
								if (res.success) {
									this.$Msg.success('操作成功');
									this.getDataList();
									this.orgModalVisible = false;
								}
							});
						}
					} else {
						this.submitLoading = true;
						updateOrg({
							orders: this.form.orders,
							orgId: this.form.orgId,
							orgName: this.form.orgName,
							description: this.form.description
						}).then(res => {
							this.submitLoading = false;
							if (res.success) {
								this.$Msg.success('操作成功');
								this.getDataList();
								this.orgModalVisible = false;
							}
						});
					}
				}
			});
		},
		cancelOrg() {
			this.orgModalVisible = false;
		}
	},
	created() {
		this.handleAuthcMethods.getBaseAllCorpList().then(res => {
			this.dictCorpList = res;
		});
	},
	mounted() {
		// 计算高度
		let height = document.documentElement.clientHeight;
		this.maxHeight = Number(height - 200) + 'px';
		this.handleAuthcMethods.getBaseCurrentCorpInfo().then(res => {
			this.dictCorpCurr = res;
			this.getTreeList();
			this.init();
		});
	}
};
</script>