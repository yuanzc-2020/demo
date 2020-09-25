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
						<Tree ref="tree" :data="treeData" :render="renderContent" @on-select-change="selectTree"></Tree>
						<Spin size="large" fix v-if="treeLoading"></Spin>
					</div>
				</Col>
				<div class="expand">
					<Icon :type="expandIcon" size="16" class="icon" @click="changeExpand" />
				</div>
				<Col :span="span">
					<Row v-show="openSearch">
						<Form
							ref="searchForm"
							:model="searchForm"
							inline
							:label-width="70"
							@keydown.enter.native="handleSearch"
						>
							<Form-item label="公司名称" prop="corpName">
								<Input
									type="text"
									v-model="searchForm.corpName"
									placeholder="请输入公司名称"
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
	</div>
</template>

<script>
import { getCorpList, disableCorp, enableCorp } from '@/api/card-system-api';

export default {
	name: 'SysCorp',
	data() {
		return {
			openSearch: true,
			treeLoading: false, // 树加载状态
			maxHeight: '500px',
			loading: false, // 表格加载状态
			editTitle: '', // 编辑节点名称
			searchKey: '', // 搜索树
			expand: true,
			span: 18,
			expandIcon: 'ios-arrow-back',
			selectNode: {},
			treeData: [], // 树数据
			searchForm: {
				corpFullId: '', //树节点
				corpName: '',
				statusCode: '',
				corpType: '',
				pageNumber: 1, // 当前页数
				pageSize: 10 // 页面大小
				//order: 'corpName'
				//sort: 'desc'
			},
			columns: [
				{
					type: 'index',
					width: 60,
					align: 'center'
				},
				{
					title: '公司ID',
					key: 'corpId',
					minWidth: 100,
					align: 'center'
				},
				{
					title: '公司编码',
					key: 'corpCode',
					minWidth: 100,
					align: 'center'
				},
				{
					title: '公司名称',
					key: 'corpName',
					minWidth: 160,
					align: 'center'
				},
				{
					title: '所属区域',
					key: 'regionName',
					minWidth: 100,
					align: 'center',
					render: (h, params) => {
						let text = '';
						this.dictRegionList.forEach(e => {
							if (e.regionId == params.row.regionId) {
								text = e.regionName;
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
				}
			],
			data: [], //表单数据
			total: 0, // 表单数据总数
			dictCorpList: [],
			dictCorpCurr: {},
			dictRegionList: []
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
			this.searchForm.corpType = 1;
			getCorpList(this.searchForm).then(res => {
				this.loading = false;
				if (res.success) {
					this.data = res.result.content;
					this.total = res.result.total;
				}
			});
		},
		changeStatus(row, v) {
			if (v == 1) {
				enableCorp(row.corpId).then(res => {
					this.loading = false;
					if (res.success) {
						this.$Msg.success('操作成功');
					}
				});
			}
			if (v == 0) {
				disableCorp(row.corpId).then(res => {
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
			this.searchForm.corpFullId = '';
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
		}
	},
	created() {
		this.handleAuthcMethods.getBaseAllRegionList().then(res => {
			this.dictRegionList = res;
		});
		this.handleAuthcMethods.getBaseCurrentCorpInfo().then(res => {
			this.dictCorpCurr = res;
		});
		this.getTreeList();
	},
	mounted() {
		// 计算高度
		let height = document.documentElement.clientHeight;
		this.maxHeight = Number(height - 200) + 'px';
		this.init();
	}
};
</script>