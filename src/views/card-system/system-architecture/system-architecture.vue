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
						<!--树形-->
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
							<Form-item label="架构名称" prop="archName">
								<Input
									type="text"
									v-model="searchForm.archName"
									placeholder="请输入架构名称"
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
						<Button @click="add" icon="md-add" type="primary">新增架构</Button>
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
			v-model="archModalVisible"
			:mask-closable="false"
			:width="500"
			class-name="vertical-center-modal"
		>
			<Form ref="form" :model="form" :label-width="90" :rules="formValidate">
				<FormItem label="所属公司" v-if="modalType==0">
					<span>{{this.editTitle}}</span>
				</FormItem>
				<FormItem label="架构名称" prop="archName">
					<Input v-model="form.archName" maxlength="50" show-word-limit="true" placeholder="请输入架构名称" />
				</FormItem>
				<FormItem label="状态" prop="statusCode" v-if="modalType==0">
					<i-switch size="large" v-model="form.statusCode" :true-value="1" :false-value="0">
						<span slot="open">启用</span>
						<span slot="close">禁用</span>
					</i-switch>
				</FormItem>
				<FormItem label="描述" prop="description">
					<Input
						v-model="form.description"
						type="textarea"
						:autosize="{minRows: 2,maxRows: 5}"
						placeholder="一些描述"
					></Input>
				</FormItem>
			</Form>
			<div slot="footer">
				<Button @click="cancelArch">取消</Button>
				<Button type="primary" :loading="submitLoading" @click="submitArch">提交</Button>
			</div>
		</Modal>
	</div>
</template>

<script>
import {
	getCorpResArchList,
	insertArch,
	updateArch,
	disableArch,
	enableArch
} from '@/api/card-system-api';
export default {
	name: 'SysArchitecture',
	data() {
		return {
			archModalVisible: false,
			openSearch: true,
			treeLoading: false, // 树加载状态
			maxHeight: '500px',
			loading: false, // 表格加载状态
			selectCorpId: '',
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
				archName: '',
				statusCode: '',
				pageNumber: 1, // 当前页数
				pageSize: 10 // 页面大小
			},
			form: {
				corpId: '',
				archName: '',
				statusCode: 1,
				description: ''
			},
			formValidate: {
				archName: [
					{
						required: true,
						message: '请输入名称',
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
					title: '架构ID',
					key: 'archId',
					minWidth: 80,
					align: 'center'
				},
				{
					title: '架构名称',
					key: 'archName',
					minWidth: 200,
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
					width: 140,
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
								'编辑架构'
							)
						]);
					}
				},
				{
					title: '新增人',
					key: 'addUserName',
					minWidth: 120,
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
					minWidth: 250,
					align: 'left'
				}
			],
			data: [], //表单数据
			total: 0, // 表单数据总数
			dictCorpList: [],
			dictCorpCurr: {},
			dictCurrentUserInfo: {}
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
			getCorpResArchList(this.searchForm).then(res => {
				this.loading = false;
				if (res.success) {
					this.data = res.result.content;
					this.total = res.result.total;
				}
			});
		},
		changeStatus(row, v) {
			if (v == 1) {
				enableArch(row.archId).then(res => {
					this.loading = false;
					if (res.success) {
						this.$Msg.success('操作成功');
					}
				});
			}
			if (v == 0) {
				disableArch(row.archId).then(res => {
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
			this.searchForm.corpFullId = '';
			this.selectCorpId = '';
			this.getDataList();
		},
		selectTree(v) {
			if (v) {
				console.log(v);
				this.editTitle = v.title;
				this.searchForm.corpFullId = v.corpFullId;
				this.searchForm.corpId = v.id;
				this.selectCorpId = v.id;
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
			if (this.selectCorpId == '') {
				this.$Msg.warning('请先选择公司单位');
			} else {
				this.modalType = 0;
				this.modalTitle = '新增架构';
				this.$refs.form.resetFields();
				this.form.archName = '';
				this.form.corpId = this.selectCorpId;
				this.archModalVisible = true;
			}
		},
		edit(v) {
			this.modalType = 1;
			this.modalTitle = '编辑架构';
			this.$refs.form.resetFields();
			for (let attr in v) {
				if (v[attr] == null) {
					v[attr] = '';
				}
			}
			let str = JSON.stringify(v);
			let data = JSON.parse(str);
			this.form = data;
			this.archModalVisible = true;
		},
		submitArch() {
			this.$refs.form.validate(valid => {
				if (valid) {
					if (this.modalType == 0) {
						if (
							this.form.corpId == '' ||
							this.form.corpId == undefined
						) {
							this.errorPass = '公司不能为空';
							return;
						}
						this.submitLoading = true;
						insertArch(this.form).then(res => {
							this.submitLoading = false;
							if (res.success) {
								this.$Msg.success('操作成功');
								this.getDataList();
								this.archModalVisible = false;
							}
						});
					} else {
						this.submitLoading = true;
						delete this.form.corpId;
						updateArch(this.form).then(res => {
							this.submitLoading = false;
							if (res.success) {
								this.$Msg.success('操作成功');
								this.getDataList();
								this.archModalVisible = false;
							}
						});
					}
				}
			});
		},
		cancelArch() {
			this.archModalVisible = false;
		},
		handleSelectDepTree(v) {
			this.form.corpId = v;
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