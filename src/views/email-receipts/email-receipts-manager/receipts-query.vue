<style lang="less">
</style>
<template>
	<div class="receiptsQuery">
		<!-- 新增组件 -->
		<ReceiptsAdd
			v-if="currView == 'add'"
			@close="currView = 'index'"
			@fatherMethod="fatherMethod"
			@submited="submited"
			:transferData="transferData"
		/>
		<!-- 详细组件 -->
		<ReceiptsDetail
			v-if="currView == 'detail'"
			@close="currView = 'index'"
			@submited="submited"
			:businessId="applyReceiptsId"
		/>

		<ProcessHistoricTrace
			v-if="currView == 'trace'"
			@close="currView = 'index'"
			:traceId="applyReceiptsId"
		/>
		<!-- 主体结构包含所有子组件 -->
		   <Card  v-show="currView == 'index'">
            <Row @keydown.enter.native="handleSearch" >
                <Form
                    ref="searchForm"
					:model="searchForm"
					inline
					:label-width="100"
                >
                <!-- 表单内容 -->
                    <Form-item label="单号">
                        <Input v-model="searchForm.applyReceiptsId" placeholder="请输入单号" width="100px"></Input>
                    </Form-item>
                     <Form-item label="申请人">
                        <Input v-model="searchForm.receiptsAddUserId" placeholder="请输入申请人" width="100px"></Input>
                    </Form-item>
					<Form-item label="票据类型">
						<Select
							v-model="searchForm.receiptsType"
							style="width: 250px"
						>
							<Option
								v-for="item in receiptsTypes"
								:value="item.receiptsType"
								:key="item.receiptsType"
								:label="item.typeName"
								>{{ item.typeName }}</Option
							>
						</Select>
					</Form-item>
                    <Form-item label="区域">
                        <Select
							v-model="searchForm.areaId"
							style="width: 250px"
						>
							<Option
								v-for="item in areaIds"
								:value="item.areaId"
								:key="item.areaId"
								:label="item.areaName"
								>{{ item.areaName }}</Option
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
					>新增收据申请单</Button
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
            <Row>
				<Table
					:loading="loading"
					highlight-row
					border
					:columns="columns"
					:data="data"
					sortable="custom"

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
import{
	getReceiptsStatus,
    getReceiptsList,
} from '@/api/email-receipts-api';

import ReceiptsAdd from '@/views/receipts-common/receipts-form.vue';
import ReceiptsDetail from '@/views/receipts-common/receipts-detail.vue';
import ProcessStart from '@/views/card-flow/flow-process/flow-process-start';
import ProcessHistoricTrace from '@/views/card-flow/flow-historic-detail/flow-historic-trace';
export default {
	name: 'receiptsQuery',
	components: {
		ReceiptsAdd,
		ReceiptsDetail,
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
			receiptsTypes:[],
			areaIds:[],
		
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
					title: '申请单号',
					key: 'applyReceiptsId',
					width: 200,
					align: 'center',
				},
				{
					title: '流程类型',
					key: 'progressType',
					minWidth: 150,
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
					key: 'receiptsAddUserId',
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
					title: '申请事由',
					key: 'applyFor',
					width: 180,
					align: 'center',
                },
               
                {
					title: '票据金额',
					key: 'totalfee',
					width: 180,
					align: 'center',
                },
                 {
					title: '当前处理人',
					key: 'emailReceiptsExaminerName',
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
											params.row.statusCode == '0'
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
											params.row.statusCode == '0'
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
          	this.getAllList();
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
		// 获取状态码集合
		getStatusCodes() {
			this.loading=true;
			getReceiptsStatus().then((res) => {
				if (res.success) {
					this.statusCodes = res.result;
					console.log(this.statusCodes);
				
				}
			});
		},
			// 获取调拨单内容--------------------------yuan
			getAllList(){
				this.loading=true;
				getReceiptsList()
				.then((res) => {
					if (res.success) {
						console.log(res.result);
						this.data = res.result.content;
						this.total = res.result.total;
					}
				});
			},
		
		changeTable(currentRow) {
			this.selectCount = currentRow.applyReceiptsId;
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
			this.loading = false;
			getReceiptsList(this.globalUtil.filterParams(this.searchForm)).then(
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
			if (v.applyReceiptsId) {
				let data = [];
				data.actionType = 1;
				data.applyReceiptsId = v.applyReceiptsId;
				data.toCorpId = v.toCorpId;
				this.transferData = data;
				this.currView = 'add';
			}
		},

		details(v) {
			if (v.applyReceiptsId) {
				this.applyReceiptsId = v.applyReceiptsId;
				this.currView = 'detail';
			}
		},

		remove(v) {
			this.$Modal.confirm({
				title: '确认删除',
				content: '您确认要删除调拨单' + v.applyReceiptsId + ' ?',
				loading: true,
				onOk: () => {
					deleteAllot(v.applyReceiptsId).then((res) => {
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
			if (this.selectList.statusCode == 0) {
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
			if (this.selectList.statusCode != 0) {
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