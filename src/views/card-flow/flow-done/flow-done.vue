<style lang="less">
@import '../../../styles/table-common.less';
</style>
<template>
	<div class="search">
		<BillAllotDetail
			v-if="currView == 'BillAllotDetail'"
			@close="currView = 'index'"
			:businessId="businessId"
		/>
		<HistoricDetail
			v-if="currView == 'historic_detail'"
			@close="currView = 'index'"
			:transferData="transferData"
		/>
		<Card v-show="currView == 'index'">
			<Row v-show="openSearch" @keydown.enter.native="handleSearch">
				<Form
					ref="searchForm"
					:model="searchForm"
					inline
					:label-width="100"
				>
					<Form-item label="流程实例" prop="name">
						<Input
							type="text"
							v-model="searchForm.name"
							placeholder="请输入流程实例"
							clearable
							style="width: 200px"
						/>
					</Form-item>
					<Form-item label="业务编号" prop="businessId">
						<Input
							type="text"
							v-model="searchForm.businessId"
							placeholder="请输入业务编号"
							clearable
							style="width: 200px"
						/>
					</Form-item>
					<span v-if="drop">
						<FormItem label="流程分类" prop="businessKey">
							<Select
								v-model="searchForm.businessKey"
								placeholder="请选择"
								clearable
								style="width: 200px"
							>
								<Option
									v-for="(item, i) in flowCategorys"
									:key="i"
									:value="item.businessKey"
									:label="item.businessName"
								>
									<span style="margin-right: 10px">{{
										item.businessName
									}}</span>
									<span style="color: #ccc">{{
										item.businessKey
									}}</span>
								</Option>
							</Select>
						</FormItem>
						<Form-item label="处理时间">
							<DatePicker
								v-model="selectDate"
								type="daterange"
								format="yyyy-MM-dd"
								clearable
								@on-change="selectDateRange"
								placeholder="选择起始时间"
								style="width: 200px"
							></DatePicker>
						</Form-item>
					</span>
					<Form-item style="margin-left: -35px" class="br">
						<Button
							@click="handleSearch"
							type="primary"
							icon="ios-search"
							>搜索</Button
						>
						<Button @click="handleReset">重置</Button>
						<a class="drop-down" @click="dropDown">
							{{ dropDownContent }}
							<Icon :type="dropDownIcon"></Icon>
						</a>
					</Form-item>
				</Form>
			</Row>
			<Row class="operation">
				<Button type="dashed" @click="getDataList">刷新数据</Button>
				<Button type="dashed" @click="openSearch = !openSearch">{{
					openSearch ? '关闭搜索' : '开启搜索'
				}}</Button>
				<Button type="dashed" @click="openTip = !openTip">{{
					openTip ? '关闭提示' : '开启提示'
				}}</Button>
			</Row>
			<Row v-show="openTip">
				<Alert show-icon>
					已选择数据
					<span class="select-count">{{ selectCount }}</span> 项
					<a class="select-clear" @click="clearSelectAll">清空</a>
				</Alert>
			</Row>
			<Row>
				<Table
					:loading="loading"
					border
					:columns="columns"
					sortable="custom"
					:data="data"
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
					:page-size-opts="[10, 20, 50]"
					size="small"
					show-total
					show-elevator
					show-sizer
				></Page>
			</Row>
		</Card>
	</div>
</template>

<script>
import { getDoneList, getTaskBusinessCodeList } from '@/api/card-flow-api';

import BillAllotDetail from '@/views/card-bill/bill-allot/bill-allot-detail';

import HistoricDetail from '@/views/card-flow/flow-historic-detail/flow-historic-detail.vue';
import util from '@/libs/util';
export default {
	name: 'FLowDone',
	components: {
		HistoricDetail,
		BillAllotDetail,
	},
	data() {
		return {
			currView: 'index',
			openSearch: true,
			openTip: true,
			loading: true,
			selectCount: 0,
			selectList: [],
			selectDate: null,
			searchForm: {
				businessKey: '',
				businessId: '',
				pageNumber: 1,
				pageSize: 10,
				startDate: '',
				endDate: '',
			},
			drop: false,
			dropDownContent: '展开',
			dropDownIcon: 'ios-arrow-down',
			modalType: 0,
			modalVisible: false,
			modalTitle: '',
			form: {
				reason: '',
			},
			formValidate: {},
			submitLoading: false,
			columns: [
				/* {
					type: 'selection',
					width: 60,
					align: 'center'
				}, */
				{
					type: 'index',
					width: 60,
					align: 'center',
				},
				{
					title: '流程归属',
					key: 'businessName',
					width: 130,
					align: 'center',
				},
				{
					title: '业务编号',
					key: 'businessId',
					align: 'center',
					minWidth: 160,
					render: (h, params) => {
						return h('div', [
							h(
								'a',
								{
									on: {
										click: () => {
											this.detail(params.row);
										},
									},
								},
								params.row.businessId
							),
						]);
					},
				},
				{
					title: '流程名称',
					key: 'procInstName',
					minWidth: 200,
				},
				{
					title: '审批环节',
					key: 'name',
					minWidth: 130,
					align: 'center',
				},
				{
					title: '流程发起人',
					key: 'applyer',
					width: 150,
					align: 'center',
					render: (h, params) => {
						return h('div', [
							params.row.applyUserName +
								'(' +
								params.row.applyUserId +
								')',
						]);
					},
				},
				{
					title: '优先级',
					key: 'priority',
					align: 'center',
					width: 100,
					render: (h, params) => {
						let text = '无',
							color = '';
						if (params.row.priority == 0) {
							color = 'green';
						} else if (params.row.priority == 1) {
							color = 'orange';
						} else if (params.row.priority == 2) {
							color = 'red';
						} else {
							color = 'default';
						}
						this.dictPriority.forEach((e) => {
							if (e.value == params.row.priority) {
								text = e.title;
							}
						});
						return h('div', [
							h(
								'Tag',
								{
									props: {
										color: color,
									},
								},
								text
							),
						]);
					},
				},
				{
					title: '审批操作',
					key: 'deleteReason',
					align: 'center',
					width: 120,
					render: (h, params) => {
						let text = '',
							color = '';
						if (params.row.deleteReason == '审批驳回') {
							color = 'volcano';
							text = '审批驳回';
							return h('div', [
								h(
									'Tag',
									{
										props: {
											color: color,
										},
									},
									text
								),
							]);
						} else if (params.row.deleteReason == '审批通过') {
							color = 'green';
							text = '审批通过';
							return h('div', [
								h(
									'Tag',
									{
										props: {
											color: color,
										},
									},
									text
								),
							]);
						} else {
							color = 'default';
							text = params.row.deleteReason;
							return h('div', [text]);
						}
					},
				},
				{
					title: '审批意见',
					key: 'comment',
					align: 'center',
					width: 150,
				},
				{
					title: '耗时',
					key: 'duration',
					align: 'center',
					width: 80,
					render: (h, params) => {
						return h('div', util.millsToTime(params.row.duration));
					},
				},
				{
					title: '处理时间',
					key: 'createTime',
					align: 'center',
					width: 180,
				},
				{
					title: '操作',
					key: 'action',
					align: 'center',
					width: 100,
					render: (h, params) => {
						return h('div', [
							h(
								'Button',
								{
									props: {
										size: 'small',
									},
									style: {
										marginRight: '5px',
									},
									on: {
										click: () => {
											this.history(params.row);
										},
									},
								},
								'审批历史'
							),
						]);
					},
				},
			],
			data: [],
			total: 0,
			deleteId: '',
			dictPriority: this.$store.state.dict.priority,
			flowCategorys: [],
			businessId: '',
		};
	},
	methods: {
		init() {
			this.getDataList();
			this.getCatrgoryList();
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
		changeSort(e) {
			this.searchForm.sort = e.key;
			this.searchForm.order = e.order;
			if (e.order == 'normal') {
				this.searchForm.order = '';
			}
			this.getDataList();
		},
		changePage(v) {
			this.searchForm.pageNumber = v;
			this.getDataList();
			this.clearSelectAll();
		},
		changePageSize(v) {
			this.searchForm.pageSize = v;
			this.getDataList();
		},
		getDataList() {
			this.loading = true;
			getDoneList(this.globalUtil.filterParams(this.searchForm)).then(
				(res) => {
					this.loading = false;
					if (res.success) {
						this.data = res.result.content;
						this.total = res.result.total;
					}
				}
			);
		},
		getCatrgoryList() {
			getTaskBusinessCodeList().then((res) => {
				this.loading = false;
				if (res.success) {
					this.flowCategorys = res.result;
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
		showSelect(e) {
			this.selectList = e;
			this.selectCount = e.length;
		},
		clearSelectAll() {
			this.$refs.table.selectAll(false);
		},
		handelCancel() {
			this.modalVisible = false;
		},
		handelSubmit() {
			this.$refs.form.validate((valid) => {
				if (valid) {
					this.submitLoading = true;
					if (this.modalType == 0) {
						deleteProcessIns(this.deleteId).then((res) => {
							this.submitLoading = false;
							if (res.success) {
								this.$Msg.success('操作成功');
								this.modalVisible = false;
								this.getDataList();
							}
						});
					} else if (this.modalType == 1) {
						let ids = '';
						this.selectList.forEach(function (e) {
							ids += e.id + ',';
						});
						ids = ids.substring(0, ids.length - 1);
						// 批量删除
						deleteProcessIns(ids).then((res) => {
							this.submitLoading = false;
							if (res.success) {
								this.$Msg.success('操作成功');
								this.modalVisible = false;
								this.clearSelectAll();
								this.getDataList();
							}
						});
					}
				}
			});
		},
		//浏览表单详情
		detail(v) {
			if (v.businessKey) {
				this.businessId = v.businessId;
				switch (v.businessKey) {
					case 1001: //售卡业务流程
						this.currView = 'BillSellDetail';
						break;
					case 1002: //赠卡业务流程
						this.currView = 'BillPresentDetail';
						break;
					case 1003: //制卡业务流程
						break;
					case 1004: //申购业务流程
						this.currView = 'BillOrderApplyDetail';
						break;
					case 1005: //市州调拨流程
						this.currView = 'BillAllotDetail';
						break;
					case 1006: //市州报废流程
						this.currView = 'BillScrapDetail';
						break;
					case 1007: //11888业务流程
						this.currView = 'BillOrderPlanDetail';
						break;
					default:
						this.$Msg.warning('未能查到数据');
				}
			}
		},
		history(v) {
			let data = [];
			data.procInstId = v.procInstId;
			data.name = v.name;
			data.type = 3;
			data.backRoute = this.$route.name;
			this.transferData = data;
			this.currView = 'historic_detail';
		},
	},
	selectDateRange(v) {
		if (v) {
			this.searchForm.startDate = v[0];
			this.searchForm.endDate = v[1];
		}
	},
	mounted() {
		this.init();
	},
	watch: {},
};
</script>