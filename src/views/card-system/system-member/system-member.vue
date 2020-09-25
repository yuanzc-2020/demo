 <style lang="less">
@import '../../../styles/tree&table-common.less';
@import '../../../styles/table-common.less';
</style>
<template>
	<div class="search">
		<member-Select
			v-if="currView=='memberSelect'"
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
						<!---->
						<Tree ref="tree" :data="treeData" :render="renderContent"></Tree>
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
									placeholder="请输入组织、小组名称"
									clearable
									style="width: 200px"
								/>
							</Form-item>
							<Form-item style="margin-left:-35px;" class="br">
								<Button @click="handleSearch" type="primary" icon="ios-search">搜索</Button>
								<Button @click="handleReset">重置</Button>
							</Form-item>
						</Form>
					</Row>
					<Row class="operation">
						<Button type="dashed" @click="refreshDataList">刷新数据</Button>
						<Button type="dashed" @click="openSearch=!openSearch">{{openSearch ? "关闭搜索" : "开启搜索"}}</Button>
					</Row>
					<Row v-show="openTip">
						<Alert show-icon>
							<span>提醒：把用户加入相应的组织/小组，此用户才能授予组织相应的权限。</span>
						</Alert>
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
	</div>
</template>

<script>
import {
	getCorpList,
	getArchDataList,
	getCorpResOrgList
} from '@/api/card-system-api';
import memberSelect from './system-member-select.vue';
export default {
	name: 'SysMember',
	components: {
		memberSelect
	},
	data() {
		return {
			currView: 'index',
			openSearch: true,
			openTip: true,
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
			infoForm: {},
			treeData: [], // 树数据
			searchForm: {
				corpFullId: '',
				orgName: '',
				statusCode: '',
				pageNumber: 1, // 当前页数
				pageSize: 10 // 页面大小
			},
			form: {
				archId: '',
				orgName: '',
				statusCode: 1,
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
				],
				existsType: [
					{
						required: true,
						message: '请选择',
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
					minWidth: 90,
					align: 'center'
				},
				{
					title: '组织名称',
					key: 'orgName',
					minWidth: 200,
					align: 'center'
				},
				{
					title: '组织状态',
					key: 'statusCode',
					align: 'center',
					minWidth: 100,
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
						}
					}
				},
				{
					title: '所属公司',
					key: 'corpName',
					minWidth: 150,
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
					title: '组织成员',
					key: 'action',
					width: 100,
					align: 'center',
					render: (h, params) => {
						if (params.row.statusCode == 1) {
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
												this.maintenanceMember(
													params.row
												);
											}
										}
									},
									'维护成员'
								)
							]);
						} else {
							return h('div', [
								h(
									'span',
									{
										props: {
											type: 'primary',
											size: 'small'
										},
										style: {
											marginRight: '5px'
										},
										on: {
											click: () => {}
										}
									},
									''
								)
							]);
						}
					}
				},
				{
					title: '描述',
					key: 'description',
					minWidth: 200,
					align: 'center'
				}
			],
			data: [], //表单数据
			total: 0, // 表单数据总数
			formData: {
				name: '',
				url: '',
				owner: '',
				type: '',
				approver: '',
				date: '',
				desc: ''
			},
			dictCorpList: [],
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
		refreshDataList() {
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
		cancelEdit() {
			let data = this.$refs.tree.getSelectedNodes()[0];
			if (data) {
				data.selected = false;
			}
			this.selectNode = {};
			this.editTitle = '';
			this.editTitle = '';
			this.searchForm.corpFullId = this.dictCorpCurr.corpFullId;
			this.getDataList();
		},
		selectTree(v) {
			if (v) {
				this.editTitle = v.title;
				this.searchForm.corpFullId = v.corpFullId;
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
		maintenanceMember(v) {
			if (v.orgId == '') {
				this.$Msg.warning('组织异常，请检查');
				return;
			}
			for (let attr in v) {
				if (v[attr] == null) {
					v[attr] = '';
				}
			}
			let str = JSON.stringify(v);
			let data = JSON.parse(str);
			this.transferData = data;
			this.currView = 'memberSelect';
		}
	},
	created() {
		this.handleAuthcMethods.getBaseAllCorpList().then(res => {
			this.dictCorpList = res;
		});
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
