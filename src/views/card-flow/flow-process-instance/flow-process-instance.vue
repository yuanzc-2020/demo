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
					<Form-item label="流程名称" prop="procInstName">
						<Input
							type="text"
							v-model="searchForm.procInstName"
							placeholder="请输入流程名称"
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
					<Form-item style="margin-left: -35px" class="br">
						<Button
							@click="handleSearch"
							type="primary"
							icon="ios-search"
							>搜索</Button
						>
						<Button @click="handleReset">重置</Button>
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
import { getRunList, updateInsStatus } from '@/api/card-flow-api';

import BillAllotDetail from '@/views/card-bill/bill-allot/bill-allot-detail';

import HistoricDetail from '@/views/card-flow/flow-historic-detail/flow-historic-detail.vue';
export default {
	name: 'FLowInsProcess',
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
			searchForm: {
				procInstName: '',
				businessId: '',
				pageNumber: 1,
				pageSize: 10,
			},
			modalType: 0,
			modalVisible: false,
			modalTitle: '',
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
					title: '版本',
					key: 'version',
					width: 80,
					align: 'center',
					render: (h, params) => {
						let re = '';
						if (params.row.version) {
							re = 'v.' + params.row.version;
						}
						return h('div', re);
					},
				},
				{
					title: '当前环节',
					key: 'currTaskName',
					width: 120,
					align: 'center',
				},
				{
					title: '状态',
					key: 'isSuspended',
					align: 'center',
					width: 110,
					render: (h, params) => {
						if (!params.row.isSuspended) {
							return h('div', [
								h('Badge', {
									props: {
										status: 'success',
										text: '已激活',
									},
								}),
							]);
						} else if (params.row.isSuspended) {
							return h('div', [
								h('Badge', {
									props: {
										status: 'error',
										text: '已挂起',
									},
								}),
							]);
						}
					},
					filters: [
						{
							label: '已激活',
							value: false,
						},
						{
							label: '已挂起',
							value: true,
						},
					],
					filterMultiple: false,
					filterMethod(value, row) {
						if (value) {
							return row.isSuspended == true;
						} else if (!value) {
							return row.isSuspended == false;
						}
					},
				},
				{
					title: '流程发起人',
					key: 'applyUserName',
					align: 'center',
					width: 100,
				},
				{
					title: '流程发起时间',
					key: 'addTime',
					align: 'center',
					width: 160,
				},
				{
					title: '操作',
					key: 'action',
					align: 'center',
					width: 200,
					render: (h, params) => {
						let suspendOrActive = '';
						if (params.row.isSuspended) {
							// 挂起可激活
							suspendOrActive = h(
								'Button',
								{
									props: {
										type: 'success',
										size: 'small',
										icon: 'md-play',
									},
									style: {
										marginRight: '5px',
									},
									on: {
										click: () => {
											this.editStatus(1, params.row);
										},
									},
								},
								'激活'
							);
						} else {
							// 激活可挂起
							suspendOrActive = h(
								'Button',
								{
									props: {
										type: 'warning',
										size: 'small',
										icon: 'md-pause',
									},
									style: {
										marginRight: '5px',
									},
									on: {
										click: () => {
											this.editStatus(0, params.row);
										},
									},
								},
								'挂起'
							);
						}
						return h('div', [
							suspendOrActive,
							h(
								'Button',
								{
									props: {
										type: 'primary',
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
								'审批详情'
							),
						]);
					},
				},
			],
			data: [],
			total: 0,
			deleteId: '',
			businessId: '',
		};
	},
	methods: {
		init() {
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
			getRunList(this.searchForm).then((res) => {
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
		showSelect(e) {
			this.selectList = e;
			this.selectCount = e.length;
		},
		clearSelectAll() {
			this.$refs.table.selectAll(false);
		},
		editStatus(status, v) {
			let operation = '';
			if (status == 0) {
				operation = '暂停挂起';
			} else {
				operation = '激活运行';
			}
			this.$Modal.confirm({
				title: '确认' + operation,
				content: `您确认要${operation}流程实例${v.procInstName}?`,
				loading: true,
				onOk: () => {
					let params = {
						statusCode: status,
						procInstId: v.procInstId,
					};
					updateInsStatus(params).then((res) => {
						this.$Modal.remove();
						if (res.success) {
							this.$Msg.success('操作成功');
							this.getDataList();
						}
					});
				},
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
	mounted() {
		this.init();
	},
};
</script>