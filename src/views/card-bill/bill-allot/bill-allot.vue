<style lang="less">
@import '../../../styles/table-common.less';
</style>
<template>
	<div class="search">
		<AllotAdd
			v-if="currView == 'add'"
			@close="currView = 'index'"
			@fatherMethod="fatherMethod"
			@submited="submited"
			:transferData="transferData"
		/>
		<AllotDetail
			v-if="currView == 'detail'"
			@close="currView = 'index'"
			@submited="submited"
			:businessId="businessId"
		/>
		<ProcessHistoricTrace
			v-if="currView == 'trace'"
			@close="currView = 'index'"
			:traceId="businessId"
		/>
		<Card v-show="currView == 'index'">
			<Row v-show="openSearch" @keydown.enter.native="handleSearch">
				<Form
					ref="searchForm"
					:model="searchForm"
					inline
					:label-width="100"
				>
					<Form-item label="数据状态" prop="statusCode">
						<Select
							v-model="searchForm.statusCode"
							style="width: 250px"
						>
							<Option
								v-for="item in statusCodes"
								:value="item.statusCode"
								:key="item.statusCode"
								:label="item.statusName"
								>{{ item.statusName }}</Option
							>
						</Select>
					</Form-item>

					<Form-item label="新增时间">
						<DatePicker
							v-model="timeForm.addTime"
							type="daterange"
							format="yyyy-MM-dd"
							@on-change="selectDateRange"
							placeholder="选择起始时间"
							style="width: 250px"
						></DatePicker>
					</Form-item>
					<Form-item style="margin-left: -35px" class="br">
						<Button
							@click="handleSearch"
							type="primary"
							icon="ios-search"
							>查询</Button
						>
						<Button @click="handleReset">重置</Button>
					</Form-item>
				</Form>
			</Row>
			<Row class="operation">
				<Button @click="add" type="primary" icon="md-add"
					>新增调拨单</Button
				>
				<Button
					@click="processSubmit"
					type="warning"
					icon="md-paper-plane"
					>流程提交</Button
				>
				<Button
					@click="processTrace"
					type="warning"
					icon="md-git-branch"
					>流程跟踪</Button
				>
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
					<span class="select-count">{{ selectCount }}</span>
					<a class="select-clear" @click="clearSelectAll">清空</a>
				</Alert>
			</Row>
			<Row>
				<Table
					:loading="loading"
					highlight-row
					border
					:columns="columns"
					:data="data"
					sortable="custom"
					@on-sort-change="changeSort"
					@on-current-change="changeTable"
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
		<!-- 流程提交 -->
		<ProcessStart
			ref="processStart"
			v-on:processSubmitCallBack="getDataList"
			@on-loading="processLoading = true"
			@on-loaded="processLoading = false"
		/>
	</div>
</template>

<script>
import {
	getAllotList,
	deleteAllot,
	getAllotStatus,
	updateAlloatCardStatus,
} from '@/api/card-bill-api';
import AllotAdd from './bill-allot-form.vue';
import AllotDetail from './bill-allot-detail.vue';
import ProcessStart from '@/views/card-flow/flow-process/flow-process-start';
import ProcessHistoricTrace from '@/views/card-flow/flow-historic-detail/flow-historic-trace';
export default {
	name: 'Allot',
	components: {
		AllotAdd,
		AllotDetail,
		ProcessStart,
		ProcessHistoricTrace,
	},
	data() {
		return {
			openSearch: true,
			openTip: true,
			loading: false,
			modalVisible: false,
			currView: 'index',
			error: '',
			businessId: '',
			transferData: {},
			selectCount: '',
			selectList: [],
			searchForm: {
				pageNumber: 1,
				pageSize: 10,
				statusCode: '',
				startDate: '',
				endDate: '',
			},
			timeForm: {
				addTime: '',
			},
			columns: [
				{
					type: 'index',
					width: 60,
					align: 'center',
				},
				{
					title: '调拨编号',
					key: 'allotId',
					width: 200,
					align: 'center',
				},
				{
					title: '目的单位',
					key: 'toCorpName',
					minWidth: 200,
					align: 'center',
				},
				{
					title: '数量',
					key: 'amount',
					minWidth: 100,
					align: 'center',
				},
				{
					title: '单据状态',
					key: 'statusCode',
					align: 'center',
					minWidth: 130,
					render: (h, params) => {
						let text = '';
						this.statusCodes.forEach((e) => {
							if (e.statusCode == params.row.statusCode) {
								text = e.statusName;
							}
						});
						return h('div', text);
					},
				},
				{
					title: '新增人',
					key: 'addUserName',
					width: 150,
					align: 'center',
				},
				{
					title: '新增时间',
					key: 'addTime',
					width: 180,
					align: 'center',
				},
				{
					title: '操作',
					key: 'action',
					align: 'center',
					width: 200,
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
											this.details(params.row);
										},
									},
								},
								'详情'
							),
							h(
								'Button',
								{
									props: {
										type: 'primary',
										size: 'small',
										disabled:
											params.row.statusCode == '1000'
												? false
												: true,
									},

									style: {
										marginRight: '5px',
									},
									on: {
										click: () => {
											this.edit(params.row);
										},
									},
								},
								'编辑'
							),
							h(
								'Button',
								{
									props: {
										type: 'error',
										size: 'small',
										disabled:
											params.row.statusCode == '1000'
												? false
												: true,
									},
									style: {
										marginRight: '5px',
									},
									on: {
										click: () => {
											this.remove(params.row);
										},
									},
								},
								'删除'
							),
						]);
					},
				},
			],
			data: [],
			total: 0,
			statusCodes: [],
		};
	},

	methods: {
		init() {
			this.setDateDeflut();
			this.getDataList();
			this.getStatusCodes();
		},
		fatherMethod() {
			this.handleSearch();
		},
		setDateDeflut() {
			let getDatePickerDefault = this.getDatePickerDefault(90, 1);
			this.timeForm.addTime = getDatePickerDefault[0];
			this.searchForm.startDate = getDatePickerDefault[1];
			this.searchForm.endDate = getDatePickerDefault[2];
		},
		selectDateRange(v) {
			if (v) {
				this.searchForm.startDate = v[0];
				this.searchForm.endDate = v[1];
			}
		},
		getStatusCodes() {
			getAllotStatus().then((res) => {
				if (res.success) {
					this.statusCodes = res.result;
				}
			});
		},
		changeTable(currentRow) {
			this.selectCount = currentRow.allotId;
			this.selectList = currentRow;
		},
		submited() {
			this.currView = 'index';
			this.getDataList();
		},

		clearSelectAll() {
			this.selectCount = '';
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
			getAllotList(this.globalUtil.filterParams(this.searchForm)).then(
				(res) => {
					this.loading = false;
					if (res.success) {
						this.data = res.result.content;
						this.total = res.result.total;
					}
				}
			);
			this.clearSelectAll();
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
			this.timeForm.addTime = '';
			this.searchForm.startDate = '';
			this.searchForm.endDate = '';
			this.getDataList();
		},
		handelCancel() {
			this.modalVisible = false;
		},

		add() {
			let data = [];
			data.actionType = 0;
			this.transferData = data;
			this.currView = 'add';
		},
		edit(v) {
			if (v.allotId) {
				let data = [];
				data.actionType = 1;
				data.allotId = v.allotId;
				data.toCorpId = v.toCorpId;
				this.transferData = data;
				this.currView = 'add';
			}
		},

		details(v) {
			if (v.allotId) {
				this.businessId = v.allotId;
				this.currView = 'detail';
			}
		},

		remove(v) {
			this.$Modal.confirm({
				title: '确认删除',
				content: '您确认要删除调拨单' + v.allotId + ' ?',
				loading: true,
				onOk: () => {
					deleteAllot(v.allotId).then((res) => {
						this.$Modal.remove();
						if (res.success) {
							this.$Msg.success('操作成功');
							this.getDataList();
						}
					});
				},
			});
		},
		//流程提交
		processSubmit() {
			if (!this.selectCount) {
				this.$Msg.warning('您还未选择需要提交的数据');
				return;
			}
			if (this.selectList.statusCode == 1000) {
				this.$Modal.confirm({
					title: '流程提交',
					content: '您确认要提交所选的数据?',
					onOk: () => {
						this.$refs.processStart.show(
							'modelAlloatCard',
							'1005',
							this.selectCount
						);
					},
				});
			} else {
				this.$Msg.warning('请勿重复提交流程');
			}
		},
		//流程跟踪
		processTrace() {
			if (!this.selectCount) {
				this.$Msg.warning('您还未选择需要跟踪的数据');
				return;
			}
			if (this.selectList.statusCode != 1000) {
				this.businessId = this.selectCount;
				this.currView = 'trace';
			} else {
				this.$Msg.warning('草稿数据无流程记录');
			}
		},
	},
	mounted() {
		this.init();
	},
};
</script>